import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export interface CreateIncomeData {
  categoryId?: string;
  amount: number;
  currency?: string;
  date: Date;
  description?: string;
  sourceType?: string;
}

export interface UpdateIncomeData {
  categoryId?: string;
  amount?: number;
  currency?: string;
  date?: Date;
  description?: string;
  sourceType?: string;
}

export interface IncomeFilters {
  startDate?: Date;
  endDate?: Date;
  categoryId?: string;
  minAmount?: number;
  maxAmount?: number;
}

export const getIncomes = async (userId: string, filters?: IncomeFilters) => {
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

  if (filters?.minAmount || filters?.maxAmount) {
    where.amount = {};
    if (filters.minAmount) {
      where.amount.gte = filters.minAmount;
    }
    if (filters.maxAmount) {
      where.amount.lte = filters.maxAmount;
    }
  }

  return prisma.income.findMany({
    where,
    include: {
      category: true,
    },
    orderBy: { date: 'desc' },
  });
};

export const getIncomeById = async (incomeId: string, userId: string) => {
  const income = await prisma.income.findFirst({
    where: {
      id: incomeId,
      userId,
    },
    include: {
      category: true,
    },
  });

  if (!income) {
    throw new AppError(404, 'Income not found');
  }

  return income;
};

export const createIncome = async (userId: string, data: CreateIncomeData) => {
  // Verificar que la categoría pertenece al usuario si se proporciona
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

  return prisma.income.create({
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

export const updateIncome = async (
  incomeId: string,
  userId: string,
  data: UpdateIncomeData
) => {
  // Verificar que el ingreso pertenece al usuario
  await getIncomeById(incomeId, userId);

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

  return prisma.income.update({
    where: { id: incomeId },
    data,
    include: {
      category: true,
    },
  });
};

export const deleteIncome = async (incomeId: string, userId: string) => {
  await getIncomeById(incomeId, userId);
  return prisma.income.delete({
    where: { id: incomeId },
  });
};

