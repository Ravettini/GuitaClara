import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export interface CreateExpenseData {
  categoryId: string;
  amount: number;
  currency?: string;
  date: Date;
  description?: string;
  paymentMethod?: string;
  tags?: any;
}

export interface UpdateExpenseData {
  categoryId?: string;
  amount?: number;
  currency?: string;
  date?: Date;
  description?: string;
  paymentMethod?: string;
  tags?: any;
}

export interface ExpenseFilters {
  startDate?: Date;
  endDate?: Date;
  categoryId?: string;
  paymentMethod?: string;
  minAmount?: number;
  maxAmount?: number;
}

export const getExpenses = async (userId: string, filters?: ExpenseFilters) => {
  const where: any = { userId };

  if (filters?.startDate || filters?.endDate) {
    where.date = {};
    if (filters.startDate) {
      where.date.gte = filters.startDate;
    }
    if (filters.endDate) {
      where.date.lte = filters.endDate;
    }
  }

  if (filters?.categoryId) {
    where.categoryId = filters.categoryId;
  }

  if (filters?.paymentMethod) {
    where.paymentMethod = filters.paymentMethod;
  }

  if (filters?.minAmount || filters?.maxAmount) {
    where.amount = {};
    if (filters.minAmount) {
      where.amount.gte = filters.minAmount;
    }
    if (filters.maxAmount) {
      where.amount.lte = filters.maxAmount;
    }
  }

  return prisma.expense.findMany({
    where,
    include: {
      category: true,
    },
    orderBy: { date: 'desc' },
  });
};

export const getExpenseById = async (expenseId: string, userId: string) => {
  const expense = await prisma.expense.findFirst({
    where: {
      id: expenseId,
      userId,
    },
    include: {
      category: true,
    },
  });

  if (!expense) {
    throw new AppError(404, 'Expense not found');
  }

  return expense;
};

export const createExpense = async (userId: string, data: CreateExpenseData) => {
  // Verificar que la categoría pertenece al usuario
  const category = await prisma.category.findFirst({
    where: {
      id: data.categoryId,
      userId,
    },
  });

  if (!category) {
    throw new AppError(404, 'Category not found');
  }

  return prisma.expense.create({
    data: {
      ...data,
      userId,
      currency: data.currency || 'ARS',
    },
    include: {
      category: true,
    },
  });
};

export const updateExpense = async (
  expenseId: string,
  userId: string,
  data: UpdateExpenseData
) => {
  // Verificar que el gasto pertenece al usuario
  await getExpenseById(expenseId, userId);

  // Verificar categoría si se actualiza
  if (data.categoryId) {
    const category = await prisma.category.findFirst({
      where: {
        id: data.categoryId,
        userId,
      },
    });

    if (!category) {
      throw new AppError(404, 'Category not found');
    }
  }

  return prisma.expense.update({
    where: { id: expenseId },
    data,
    include: {
      category: true,
    },
  });
};

export const deleteExpense = async (expenseId: string, userId: string) => {
  await getExpenseById(expenseId, userId);
  return prisma.expense.delete({
    where: { id: expenseId },
  });
};

