import { PrismaClient, Prisma } from '@prisma/client'
import { AppError } from '../middleware/errorHandler'

const prisma = new PrismaClient()

export interface CreateBudgetData {
  categoryId: string
  amount: number
  currency?: string
  periodStart: Date
  periodEnd: Date
  repeat?: boolean
  repeatUntil?: Date | null
  notes?: string
}

export interface UpdateBudgetData extends Partial<CreateBudgetData> {}

export const budgetService = {
  async getAll(userId: string, periodStart?: Date, periodEnd?: Date) {
    const where: Prisma.BudgetWhereInput = {
      userId,
      ...(periodStart && periodEnd && {
        OR: [
          {
            periodStart: { lte: periodEnd },
            periodEnd: { gte: periodStart },
          },
        ],
      }),
    }

    const budgets = await prisma.budget.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: {
        periodStart: 'desc',
      },
    })

    // Calcular gastado para cada presupuesto
    const budgetsWithSpent = await Promise.all(
      budgets.map(async (budget) => {
        const expenses = await prisma.expense.aggregate({
          where: {
            userId,
            categoryId: budget.categoryId,
            currency: budget.currency,
            date: {
              gte: budget.periodStart,
              lte: budget.periodEnd,
            },
          },
          _sum: {
            amount: true,
          },
        })

        const spent = expenses._sum.amount || 0
        const percentage = Number(budget.amount) > 0 
          ? (Number(spent) / Number(budget.amount)) * 100 
          : 0
        const remaining = Number(budget.amount) - Number(spent)

        return {
          ...budget,
          spent: Number(spent),
          percentage: Math.round(percentage * 100) / 100,
          remaining: Number(remaining),
        }
      })
    )

    return budgetsWithSpent
  },

  async getById(userId: string, id: string) {
    const budget = await prisma.budget.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        category: true,
      },
    })

    if (!budget) {
      throw new AppError(404, 'Presupuesto no encontrado')
    }

    const expenses = await prisma.expense.aggregate({
      where: {
        userId,
        categoryId: budget.categoryId,
        currency: budget.currency,
        date: {
          gte: budget.periodStart,
          lte: budget.periodEnd,
        },
      },
      _sum: {
        amount: true,
      },
    })

    const spent = expenses._sum.amount || 0
    const percentage = Number(budget.amount) > 0 
      ? (Number(spent) / Number(budget.amount)) * 100 
      : 0
    const remaining = Number(budget.amount) - Number(spent)

    return {
      ...budget,
      spent: Number(spent),
      percentage: Math.round(percentage * 100) / 100,
      remaining: Number(remaining),
    }
  },

  async create(userId: string, data: CreateBudgetData) {
    // Verificar que la categoría existe y pertenece al usuario
    const category = await prisma.category.findFirst({
      where: {
        id: data.categoryId,
        userId,
        type: { in: ['EXPENSE', 'BOTH'] },
      },
    })

    if (!category) {
      throw new AppError(404, 'Categoría no encontrada o no válida para presupuestos')
    }

    const budget = await prisma.budget.create({
      data: {
        userId,
        categoryId: data.categoryId,
        amount: data.amount,
        currency: data.currency || 'ARS',
        periodStart: data.periodStart,
        periodEnd: data.periodEnd,
        repeat: data.repeat || false,
        repeatUntil: data.repeatUntil || null,
        notes: data.notes || null,
      },
      include: {
        category: true,
      },
    })

    return budget
  },

  async update(userId: string, id: string, data: UpdateBudgetData) {
    const existing = await prisma.budget.findFirst({
      where: { id, userId },
    })

    if (!existing) {
      throw new AppError(404, 'Presupuesto no encontrado')
    }

    if (data.categoryId) {
      const category = await prisma.category.findFirst({
        where: {
          id: data.categoryId,
          userId,
          type: { in: ['EXPENSE', 'BOTH'] },
        },
      })

      if (!category) {
        throw new AppError(404, 'Categoría no encontrada o no válida')
      }
    }

    const budget = await prisma.budget.update({
      where: { id },
      data: {
        ...(data.categoryId && { categoryId: data.categoryId }),
        ...(data.amount !== undefined && { amount: data.amount }),
        ...(data.currency && { currency: data.currency }),
        ...(data.periodStart && { periodStart: data.periodStart }),
        ...(data.periodEnd && { periodEnd: data.periodEnd }),
        ...(data.repeat !== undefined && { repeat: data.repeat }),
        ...(data.repeatUntil !== undefined && { repeatUntil: data.repeatUntil }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
      include: {
        category: true,
      },
    })

    return budget
  },

  async delete(userId: string, id: string) {
    const existing = await prisma.budget.findFirst({
      where: { id, userId },
    })

    if (!existing) {
      throw new AppError(404, 'Presupuesto no encontrado')
    }

    await prisma.budget.delete({
      where: { id },
    })

    return { success: true }
  },

  async getSummary(userId: string, periodStart: Date, periodEnd: Date) {
    const budgets = await this.getAll(userId, periodStart, periodEnd)

    const totalBudget = budgets.reduce((sum, b) => sum + Number(b.amount), 0)
    const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0)
    const totalRemaining = totalBudget - totalSpent
    const overallPercentage = totalBudget > 0 
      ? (totalSpent / totalBudget) * 100 
      : 0

    const categoriesNearLimit = budgets.filter(
      (b) => b.percentage >= 70 && b.percentage < 100
    )
    const categoriesExceeded = budgets.filter((b) => b.percentage >= 100)

    return {
      totalBudget: Number(totalBudget),
      totalSpent: Number(totalSpent),
      totalRemaining: Number(totalRemaining),
      overallPercentage: Math.round(overallPercentage * 100) / 100,
      categoriesNearLimit: categoriesNearLimit.length,
      categoriesExceeded: categoriesExceeded.length,
      budgets,
    }
  },
}

