import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';
import { Decimal } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

export interface CreateFixedTermData {
  principalAmount: number;
  currency?: string;
  tna: number;
  startDate: Date;
  termInDays: number;
  bankName?: string;
  autoRenew?: boolean;
}

export interface UpdateFixedTermData {
  principalAmount?: number;
  currency?: string;
  tna?: number;
  startDate?: Date;
  termInDays?: number;
  bankName?: string;
  autoRenew?: boolean;
}

const calculateInterest = (
  principal: number,
  tna: number,
  termInDays: number
): number => {
  return principal * (tna / 100) * (termInDays / 365);
};

const calculateMaturityDate = (startDate: Date, termInDays: number): Date => {
  const maturity = new Date(startDate);
  maturity.setDate(maturity.getDate() + termInDays);
  return maturity;
};

export const getFixedTermDeposits = async (userId: string) => {
  return prisma.fixedTermDeposit.findMany({
    where: { userId },
    orderBy: { startDate: 'desc' },
  });
};

export const getFixedTermDepositById = async (
  depositId: string,
  userId: string
) => {
  const deposit = await prisma.fixedTermDeposit.findFirst({
    where: {
      id: depositId,
      userId,
    },
  });

  if (!deposit) {
    throw new AppError(404, 'Fixed term deposit not found');
  }

  return deposit;
};

export const createFixedTermDeposit = async (
  userId: string,
  data: CreateFixedTermData
) => {
  const interestAmount = calculateInterest(
    data.principalAmount,
    data.tna,
    data.termInDays
  );
  const maturityDate = calculateMaturityDate(data.startDate, data.termInDays);

  return prisma.fixedTermDeposit.create({
    data: {
      ...data,
      userId,
      currency: data.currency || 'ARS',
      computedInterestAmount: interestAmount,
      computedMaturityDate: maturityDate,
      autoRenew: data.autoRenew || false,
    },
  });
};

export const updateFixedTermDeposit = async (
  depositId: string,
  userId: string,
  data: UpdateFixedTermData
) => {
  await getFixedTermDepositById(depositId, userId);

  const updateData: any = { ...data };

  // Recalcular si cambian montos, TNA o plazo
  if (
    data.principalAmount !== undefined ||
    data.tna !== undefined ||
    data.termInDays !== undefined ||
    data.startDate !== undefined
  ) {
    const existing = await getFixedTermDepositById(depositId, userId);
    const principal =
      data.principalAmount ?? Number(existing.principalAmount);
    const tna = data.tna ?? Number(existing.tna);
    const termInDays = data.termInDays ?? existing.termInDays;
    const startDate = data.startDate ?? existing.startDate;

    updateData.computedInterestAmount = calculateInterest(
      principal,
      tna,
      termInDays
    );
    updateData.computedMaturityDate = calculateMaturityDate(
      startDate,
      termInDays
    );
  }

  return prisma.fixedTermDeposit.update({
    where: { id: depositId },
    data: updateData,
  });
};

export const deleteFixedTermDeposit = async (
  depositId: string,
  userId: string
) => {
  await getFixedTermDepositById(depositId, userId);
  return prisma.fixedTermDeposit.delete({
    where: { id: depositId },
  });
};

