"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "../../prisma/prisma";
import { auth } from "../../auth";
import { CategoryFormValues } from "@/components/forms/UserCategoryForm";

// робота з категоріями

// додавання категоріїї, отримуємо дані від форми
export const addCategory = async (data: CategoryFormValues) => {
  const session = await auth();
  if (!session?.user.id) return;
  try {
    await prisma.category.create({
      data: {
        name: data.name,
        categoryType: data.categoryType,
        userId: session.user.id,
      },
    });
  } catch (error) {
    console.error(error);
  }

  revalidatePath("/dashboard/categories");
};

// редагуємо категорію, отримуємо дані від форми та ід категоріїї щоб її знайти
export const editCategory = async (data: CategoryFormValues, id: string) => {
  try {
    await prisma.category.update({
      where: {
        id,
      },
      data: data,
    });
  } catch (error) {
    console.error(error);
  }

  revalidatePath("/dashboard/categories");
};

// видалямо категорію, отримуємо її ід
export const deleteCategory = async (id: string) => {
  try {
    await prisma.category.delete({
      where: {
        id,
      },
    });
  } catch (error) {
    console.error(error);
  }

  revalidatePath("/dashboard/categories");
};
