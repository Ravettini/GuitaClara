import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AdminStats {
  totalUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  activeUsersLast30Days: number; // Usuarios que han creado al menos un registro (income, expense, etc.)
  totalIncomes: number;
  totalExpenses: number;
  totalFixedTerms: number;
  totalInvestments: number;
  usersByMonth: Array<{
    month: string;
    count: number;
  }>;
  recentUsers: Array<{
    id: string;
    email: string;
    createdAt: Date;
  }>;
}

/**
 * Obtiene estadísticas generales de la aplicación para el dashboard de admin
 */
export async function getAdminStats(): Promise<AdminStats> {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Total de usuarios
  const totalUsers = await prisma.user.count();

  // Nuevos usuarios hoy
  const newUsersToday = await prisma.user.count({
    where: {
      createdAt: {
        gte: today,
      },
    },
  });

  // Nuevos usuarios esta semana
  const newUsersThisWeek = await prisma.user.count({
    where: {
      createdAt: {
        gte: weekAgo,
      },
    },
  });

  // Nuevos usuarios este mes
  const newUsersThisMonth = await prisma.user.count({
    where: {
      createdAt: {
        gte: new Date(now.getFullYear(), now.getMonth(), 1),
      },
    },
  });

  // Usuarios activos en los últimos 30 días (que han creado al menos un registro)
  const activeUsersLast30Days = await prisma.user.count({
    where: {
      OR: [
        {
          incomes: {
            some: {
              createdAt: {
                gte: last30Days,
              },
            },
          },
        },
        {
          expenses: {
            some: {
              createdAt: {
                gte: last30Days,
              },
            },
          },
        },
        {
          fixedTerms: {
            some: {
              createdAt: {
                gte: last30Days,
              },
            },
          },
        },
        {
          positions: {
            some: {
              createdAt: {
                gte: last30Days,
              },
            },
          },
        },
      ],
    },
  });

  // Totales de registros
  const totalIncomes = await prisma.income.count();
  const totalExpenses = await prisma.expense.count();
  const totalFixedTerms = await prisma.fixedTermDeposit.count();
  const totalInvestments = await prisma.investmentPosition.count();

  // Usuarios por mes (últimos 12 meses)
  const usersByMonth: Array<{ month: string; count: number }> = [];
  for (let i = 11; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
    
    const count = await prisma.user.count({
      where: {
        createdAt: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
    });

    usersByMonth.push({
      month: monthStart.toLocaleDateString('es-AR', { year: 'numeric', month: 'short' }),
      count,
    });
  }

  // Usuarios recientes (últimos 10)
  const recentUsers = await prisma.user.findMany({
    take: 10,
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      id: true,
      email: true,
      createdAt: true,
    },
  });

  return {
    totalUsers,
    newUsersToday,
    newUsersThisWeek,
    newUsersThisMonth,
    activeUsersLast30Days,
    totalIncomes,
    totalExpenses,
    totalFixedTerms,
    totalInvestments,
    usersByMonth,
    recentUsers,
  };
}

