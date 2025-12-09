import { PrismaClient, CategoryType } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export interface CreateCategoryData {
  name: string;
  type: CategoryType;
  color?: string;
  icon?: string;
}

export interface UpdateCategoryData {
  name?: string;
  type?: CategoryType;
  color?: string;
  icon?: string;
}

export const getCategories = async (userId: string, type?: CategoryType) => {
  const where: any = { userId };
  if (type) {
    where.type = type;
  }

  return prisma.category.findMany({
    where,
    orderBy: { name: 'asc' },
  });
};

export const getCategoryById = async (categoryId: string, userId: string) => {
  const category = await prisma.category.findFirst({
    where: {
      id: categoryId,
      userId,
    },
  });

  if (!category) {
    throw new AppError(404, 'Category not found');
  }

  return category;
};

export const createCategory = async (userId: string, data: CreateCategoryData) => {
  try {
    return await prisma.category.create({
      data: {
        ...data,
        userId,
      },
    });
  } catch (error: any) {
    console.error('Error creating category:', error);
    if (error.code === 'P2002') {
      throw new AppError(409, 'Category with this name already exists');
    }
    if (error.code === 'P1001') {
      throw new AppError(503, 'Database connection error. Please try again later.');
    }
    throw error;
  }
};

export const updateCategory = async (
  categoryId: string,
  userId: string,
  data: UpdateCategoryData
) => {
  // Verificar que la categoría pertenece al usuario
  await getCategoryById(categoryId, userId);

  return prisma.category.update({
    where: { id: categoryId },
    data,
  });
};

export const deleteCategory = async (categoryId: string, userId: string) => {
  // Verificar que la categoría pertenece al usuario
  await getCategoryById(categoryId, userId);

  return prisma.category.delete({
    where: { id: categoryId },
  });
};

