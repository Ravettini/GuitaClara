import { PrismaClient, Prisma } from '@prisma/client'
import { AppError } from '../middleware/errorHandler'

const prisma = new PrismaClient()

export interface CreateGoalData {
  name: string
  targetAmount: number
  currency?: string
  targetDate: Date
  calculationMode?: string
  tagKey?: string | null
  notes?: string
}

export interface UpdateGoalData extends Partial<CreateGoalData> {
  status?: string
}

export const goalService = {
  async getAll(userId: string, status?: string) {
    const where: Prisma.GoalWhereInput = {
      userId,
      ...(status && { status }),
    }

    const goals = await prisma.goal.findMany({
      where,
      orderBy: {
        targetDate: 'asc',
      },
    })

    // Calcular progreso para cada meta
    const goalsWithProgress = await Promise.all(
      goals.map(async (goal) => {
        let currentAmount = 0

        if (goal.calculationMode === 'ACCOUNT_BALANCE') {
          // Por ahora, usar un cálculo simple basado en ingresos/expenses con tags
          // En el futuro, esto se puede conectar con un sistema de cuentas
          if (goal.tagKey) {
            const expenses = await prisma.expense.aggregate({
              where: {
                userId,
                tags: {
                  path: [goal.tagKey],
                  equals: true,
                } as any,
              },
              _sum: {
                amount: true,
              },
            })
            // Simplificado: asumimos que los gastos negativos son aportes
            // En producción, esto debería ser más sofisticado
            currentAmount = Number(expenses._sum.amount || 0)
          }
        } else if (goal.calculationMode === 'TAG_SUM' && goal.tagKey) {
          const expenses = await prisma.expense.aggregate({
            where: {
              userId,
              tags: {
                path: [goal.tagKey],
                equals: true,
              } as any,
            },
            _sum: {
              amount: true,
            },
          })
          currentAmount = Number(expenses._sum.amount || 0)
        }

        const percentage = Number(goal.targetAmount) > 0
          ? (currentAmount / Number(goal.targetAmount)) * 100
          : 0
        const remaining = Number(goal.targetAmount) - currentAmount

        const now = new Date()
        const monthsRemaining = Math.max(
          0,
          Math.ceil((goal.targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30))
        )
        const suggestedMonthlyContribution = monthsRemaining > 0
          ? remaining / monthsRemaining
          : 0

        const isAtRisk = monthsRemaining > 0 && 
          (currentAmount / Number(goal.targetAmount)) < (1 - monthsRemaining / 12)

        return {
          ...goal,
          currentAmount: Number(currentAmount),
          percentage: Math.round(percentage * 100) / 100,
          remaining: Number(remaining),
          monthsRemaining,
          suggestedMonthlyContribution: Number(suggestedMonthlyContribution),
          isAtRisk,
        }
      })
    )

    return goalsWithProgress
  },

  async getById(userId: string, id: string) {
    const goal = await prisma.goal.findFirst({
      where: {
        id,
        userId,
      },
    })

    if (!goal) {
      throw new AppError('Meta no encontrada', 404)
    }

    // Calcular progreso (mismo cálculo que en getAll)
    let currentAmount = 0
    if (goal.calculationMode === 'TAG_SUM' && goal.tagKey) {
      const expenses = await prisma.expense.aggregate({
        where: {
          userId,
          tags: {
            path: [goal.tagKey],
            equals: true,
          } as any,
        },
        _sum: {
          amount: true,
        },
      })
      currentAmount = Number(expenses._sum.amount || 0)
    }

    const percentage = Number(goal.targetAmount) > 0
      ? (currentAmount / Number(goal.targetAmount)) * 100
      : 0
    const remaining = Number(goal.targetAmount) - currentAmount

    const now = new Date()
    const monthsRemaining = Math.max(
      0,
      Math.ceil((goal.targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30))
    )
    const suggestedMonthlyContribution = monthsRemaining > 0
      ? remaining / monthsRemaining
      : 0

    return {
      ...goal,
      currentAmount: Number(currentAmount),
      percentage: Math.round(percentage * 100) / 100,
      remaining: Number(remaining),
      monthsRemaining,
      suggestedMonthlyContribution: Number(suggestedMonthlyContribution),
    }
  },

  async create(userId: string, data: CreateGoalData) {
    const goal = await prisma.goal.create({
      data: {
        userId,
        name: data.name,
        targetAmount: data.targetAmount,
        currency: data.currency || 'ARS',
        targetDate: data.targetDate,
        calculationMode: data.calculationMode || 'ACCOUNT_BALANCE',
        tagKey: data.tagKey || null,
        notes: data.notes || null,
        status: 'ACTIVE',
      },
    })

    return goal
  },

  async update(userId: string, id: string, data: UpdateGoalData) {
    const existing = await prisma.goal.findFirst({
      where: { id, userId },
    })

    if (!existing) {
      throw new AppError('Meta no encontrada', 404)
    }

    const goal = await prisma.goal.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.targetAmount !== undefined && { targetAmount: data.targetAmount }),
        ...(data.currency && { currency: data.currency }),
        ...(data.targetDate && { targetDate: data.targetDate }),
        ...(data.calculationMode && { calculationMode: data.calculationMode }),
        ...(data.tagKey !== undefined && { tagKey: data.tagKey }),
        ...(data.status && { status: data.status }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
    })

    return goal
  },

  async delete(userId: string, id: string) {
    const existing = await prisma.goal.findFirst({
      where: { id, userId },
    })

    if (!existing) {
      throw new AppError('Meta no encontrada', 404)
    }

    await prisma.goal.delete({
      where: { id },
    })

    return { success: true }
  },

  async getSummary(userId: string) {
    const goals = await this.getAll(userId, 'ACTIVE')

    const totalTarget = goals.reduce((sum, g) => sum + Number(g.targetAmount), 0)
    const totalCurrent = goals.reduce((sum, g) => sum + g.currentAmount, 0)
    const overallPercentage = totalTarget > 0
      ? (totalCurrent / totalTarget) * 100
      : 0

    const completed = goals.filter((g) => g.percentage >= 100).length
    const inProgress = goals.filter((g) => g.percentage > 0 && g.percentage < 100).length
    const atRisk = goals.filter((g) => g.isAtRisk).length

    return {
      totalTarget: Number(totalTarget),
      totalCurrent: Number(totalCurrent),
      overallPercentage: Math.round(overallPercentage * 100) / 100,
      completed,
      inProgress,
      atRisk,
      total: goals.length,
    }
  },
}

