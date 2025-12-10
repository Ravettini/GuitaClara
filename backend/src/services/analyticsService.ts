import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface SummaryData {
  totalIncome: number;
  totalIncomeUSD: number;
  totalExpenses: number;
  totalExpensesUSD: number;
  balance: number;
  balanceUSD: number;
  savingsRate: number;
  totalFixedTerms: number;
  totalFixedTermsValue: number;
  totalFixedTermsValueUSD: number;
  totalPortfolioValue: number;
  totalPortfolioValueUSD: number;
  netWorth: number;
  netWorthUSD: number;
}

export interface ExpenseByCategory {
  categoryId: string;
  categoryName: string;
  total: number;
  percentage: number;
  color?: string;
}

export interface IncomeVsExpense {
  date: string;
  income: number;
  expense: number;
}

export interface CashFlow {
  month: string;
  income: number;
  expense: number;
  balance: number;
}

export const getSummary = async (
  userId: string,
  dateRange?: DateRange
): Promise<SummaryData> => {
  const whereIncome: any = { userId };
  const whereExpense: any = { userId };

  if (dateRange) {
    whereIncome.date = {
      gte: dateRange.startDate,
      lte: dateRange.endDate,
    };
    whereExpense.date = {
      gte: dateRange.startDate,
      lte: dateRange.endDate,
    };
  }

  // Ejecutar todas las consultas en paralelo para mejor rendimiento
  let incomeARS, incomeUSD, expenseARS, expenseUSD, fixedTerms, positions;
  
  try {
    [
      incomeARS,
      incomeUSD,
      expenseARS,
      expenseUSD,
      fixedTerms,
      positions,
    ] = await Promise.all([
      // Ingresos ARS - usar aggregate para sumar directamente en la BD
      prisma.income.aggregate({
        where: {
          ...whereIncome,
          currency: 'ARS',
        },
        _sum: {
          amount: true,
        },
      }),
      // Ingresos USD
      prisma.income.aggregate({
        where: {
          ...whereIncome,
          currency: 'USD',
        },
        _sum: {
          amount: true,
        },
      }),
      // Gastos ARS
      prisma.expense.aggregate({
        where: {
          ...whereExpense,
          currency: 'ARS',
        },
        _sum: {
          amount: true,
        },
      }),
      // Gastos USD
      prisma.expense.aggregate({
        where: {
          ...whereExpense,
          currency: 'USD',
        },
        _sum: {
          amount: true,
        },
      }),
      // Plazos fijos - solo los campos necesarios
      prisma.fixedTermDeposit.findMany({
        where: { userId },
        select: {
          principalAmount: true,
          computedInterestAmount: true,
          currency: true,
        },
      }),
      // Portfolio - solo los campos necesarios
      prisma.investmentPosition.findMany({
        where: { userId },
        select: {
          quantity: true,
          averageBuyPrice: true,
          instrument: {
            select: {
              currency: true,
            },
          },
        },
      }),
    ]);
  } catch (error: any) {
    console.error('Error fetching summary data:', error);
    throw error;
  }

  const totalIncome = Number(incomeARS._sum.amount || 0);
  const totalIncomeUSD = Number(incomeUSD._sum.amount || 0);
  const totalExpenses = Number(expenseARS._sum.amount || 0);
  const totalExpensesUSD = Number(expenseUSD._sum.amount || 0);

  const balance = totalIncome - totalExpenses;
  const balanceUSD = totalIncomeUSD - totalExpensesUSD;
  const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;

  // Procesar plazos fijos
  const totalFixedTerms = fixedTerms.length;
  const fixedTermsByCurrency = new Map<string, number>();
  fixedTerms.forEach((ft) => {
    const currency = ft.currency || 'ARS';
    const value = Number(ft.principalAmount) + Number(ft.computedInterestAmount);
    fixedTermsByCurrency.set(currency, (fixedTermsByCurrency.get(currency) || 0) + value);
  });
  const totalFixedTermsValue = fixedTermsByCurrency.get('ARS') || 0;
  const totalFixedTermsValueUSD = fixedTermsByCurrency.get('USD') || 0;

  // Procesar portfolio
  const portfolioByCurrency = new Map<string, number>();
  positions.forEach((pos) => {
    const currency = pos.instrument.currency || 'ARS';
    const value = Number(pos.quantity) * Number(pos.averageBuyPrice);
    portfolioByCurrency.set(currency, (portfolioByCurrency.get(currency) || 0) + value);
  });
  const totalPortfolioValue = portfolioByCurrency.get('ARS') || 0;
  const totalPortfolioValueUSD = portfolioByCurrency.get('USD') || 0;

  const netWorth = balance + totalFixedTermsValue + totalPortfolioValue;
  const netWorthUSD = balanceUSD + totalFixedTermsValueUSD + totalPortfolioValueUSD;

  return {
    totalIncome,
    totalIncomeUSD,
    totalExpenses,
    totalExpensesUSD,
    balance,
    balanceUSD,
    savingsRate,
    totalFixedTerms,
    totalFixedTermsValue,
    totalFixedTermsValueUSD,
    totalPortfolioValue,
    totalPortfolioValueUSD,
    netWorth,
    netWorthUSD,
  };
};

export const getExpensesByCategory = async (
  userId: string,
  dateRange?: DateRange
): Promise<ExpenseByCategory[]> => {
  const where: any = { userId };

  if (dateRange) {
    where.date = {
      gte: dateRange.startDate,
      lte: dateRange.endDate,
    };
  }

  // Usar groupBy de Prisma para agregar directamente en la BD
  const expensesByCategory = await prisma.expense.groupBy({
    by: ['categoryId'],
    where,
    _sum: {
      amount: true,
    },
  });

  // Obtener total para calcular porcentajes
  const totalResult = await prisma.expense.aggregate({
    where,
    _sum: {
      amount: true,
    },
  });
  const total = Number(totalResult._sum.amount || 0);

  // Obtener información de categorías en una sola consulta
  const categoryIds = expensesByCategory.map((e) => e.categoryId).filter(Boolean) as string[];
  const categories = categoryIds.length > 0
    ? await prisma.category.findMany({
        where: {
          id: { in: categoryIds },
          userId,
        },
        select: {
          id: true,
          name: true,
          color: true,
        },
      })
    : [];

  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  const result: ExpenseByCategory[] = expensesByCategory
    .map((item) => {
      const category = categoryMap.get(item.categoryId || '');
      if (!category) return null;

      const totalAmount = Number(item._sum.amount || 0);
      const expenseByCategory: ExpenseByCategory = {
        categoryId: item.categoryId || '',
        categoryName: category.name,
        total: totalAmount,
        percentage: total > 0 ? (totalAmount / total) * 100 : 0,
      };
      
      if (category.color) {
        expenseByCategory.color = category.color;
      }
      
      return expenseByCategory;
    })
    .filter((item): item is ExpenseByCategory => item !== null && item !== undefined)
    .sort((a, b) => b.total - a.total);

  return result;
};

export const getIncomeVsExpense = async (
  userId: string,
  dateRange?: DateRange
): Promise<IncomeVsExpense[]> => {
  const whereIncome: any = { userId };
  const whereExpense: any = { userId };

  if (dateRange) {
    whereIncome.date = {
      gte: dateRange.startDate,
      lte: dateRange.endDate,
    };
    whereExpense.date = {
      gte: dateRange.startDate,
      lte: dateRange.endDate,
    };
  }

  // Usar groupBy para agregar por fecha directamente en la BD
  const [incomesByDate, expensesByDate] = await Promise.all([
    prisma.income.groupBy({
      by: ['date'],
      where: whereIncome,
      _sum: {
        amount: true,
      },
    }),
    prisma.expense.groupBy({
      by: ['date'],
      where: whereExpense,
      _sum: {
        amount: true,
      },
    }),
  ]);

  // Agrupar por día (formato YYYY-MM-DD)
  const byDate = new Map<string, IncomeVsExpense>();

  incomesByDate.forEach((item) => {
    const dateKey = item.date.toISOString().split('T')[0];
    if (!byDate.has(dateKey)) {
      byDate.set(dateKey, {
        date: dateKey,
        income: 0,
        expense: 0,
      });
    }
    byDate.get(dateKey)!.income += Number(item._sum.amount || 0);
  });

  expensesByDate.forEach((item) => {
    const dateKey = item.date.toISOString().split('T')[0];
    if (!byDate.has(dateKey)) {
      byDate.set(dateKey, {
        date: dateKey,
        income: 0,
        expense: 0,
      });
    }
    byDate.get(dateKey)!.expense += Number(item._sum.amount || 0);
  });

  return Array.from(byDate.values()).sort((a, b) =>
    a.date.localeCompare(b.date)
  );
};

export const getCashFlow = async (
  userId: string,
  dateRange?: DateRange
): Promise<CashFlow[]> => {
  const whereIncome: any = { userId };
  const whereExpense: any = { userId };

  if (dateRange) {
    whereIncome.date = {
      gte: dateRange.startDate,
      lte: dateRange.endDate,
    };
    whereExpense.date = {
      gte: dateRange.startDate,
      lte: dateRange.endDate,
    };
  }

  // Obtener ingresos y gastos agrupados por mes usando groupBy
  // Primero obtenemos los datos agrupados por fecha
  const [incomesByDate, expensesByDate] = await Promise.all([
    prisma.income.findMany({
      where: whereIncome,
      select: { amount: true, date: true },
    }),
    prisma.expense.findMany({
      where: whereExpense,
      select: { amount: true, date: true },
    }),
  ]);

  // Agrupar por mes
  const byMonth = new Map<string, CashFlow>();

  incomesByDate.forEach((inc) => {
    const monthKey = `${inc.date.getFullYear()}-${String(inc.date.getMonth() + 1).padStart(2, '0')}`;
    if (!byMonth.has(monthKey)) {
      byMonth.set(monthKey, {
        month: monthKey,
        income: 0,
        expense: 0,
        balance: 0,
      });
    }
    byMonth.get(monthKey)!.income += Number(inc.amount);
  });

  expensesByDate.forEach((exp) => {
    const monthKey = `${exp.date.getFullYear()}-${String(exp.date.getMonth() + 1).padStart(2, '0')}`;
    if (!byMonth.has(monthKey)) {
      byMonth.set(monthKey, {
        month: monthKey,
        income: 0,
        expense: 0,
        balance: 0,
      });
    }
    byMonth.get(monthKey)!.expense += Number(exp.amount);
  });

  return Array.from(byMonth.values())
    .map((item) => ({
      ...item,
      balance: item.income - item.expense,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));
};

