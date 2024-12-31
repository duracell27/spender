"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "../../prisma/prisma";
import { TransactionFormValues } from "@/components/forms/UserTransactionForm";
import { auth } from "../../auth";
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
} from "date-fns";

export const addTransaction = async (data: TransactionFormValues) => {
  const session = await auth();
  if (!session?.user.id) return;
  console.log("активний гаманець з сервера", data.walletId);
  try {
    await prisma.transaction.create({
      data: {
        title: data.title,
        amount: data.amount,
        transactionType: data.transactionType,
        userId: session.user.id,
        date: data.date,
        categoryId: data.categoryId,
        walletId: data.walletId,
      },
    });
  } catch (error) {
    console.error(error);
  }

  revalidatePath("/dashboard");
};

export const editTransaction = async (data: TransactionFormValues, id: string) => {
  const session = await auth();
  if (!session?.user.id) return;

  try {
    await prisma.transaction.update({
      where: {
        id,
      },
      data: {
        title: data.title,
        amount: data.amount,
        transactionType: data.transactionType,
        userId: session.user.id,
        date: data.date,
        categoryId: data.categoryId,
        walletId: data.walletId,
      },
    });
  } catch (error) {
    console.error(error);
  }

  revalidatePath("/dashboard");
};

export const deleteTransaction = async (id: string) => {
  try {
    await prisma.transaction.delete({
      where: {
        id,
      },
    });
  } catch (error) {
    console.error(error);
  }

  revalidatePath("/dashboard");
};

export async function getTransactionsByPeriod(
  period: "day" | "week" | "month" | "year",
  activeWalletId: string
) {
  const session = await auth();
  if (!session?.user.id) return { transactions: [], startDate: new Date(), endDate: new Date() };

  let startDate: Date;
  let endDate: Date;

  if (period === "day") {
    startDate = startOfDay(new Date());
    endDate = endOfDay(new Date());
  } else if (period === "week") {
    startDate = startOfWeek(new Date(), { weekStartsOn: 1 });
    endDate = endOfWeek(new Date(), { weekStartsOn: 1 });
  } else if (period === "month") {
    startDate = startOfMonth(new Date());
    endDate = endOfMonth(new Date());
  } else if (period === "year") {
    startDate = startOfYear(new Date());
    endDate = endOfYear(new Date());
  } else {
    throw new Error("Invalid period");
  }

  const transactions = await prisma.transaction.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
      userId: session.user.id,
      ...(activeWalletId !== "all" && { walletId: activeWalletId }),
    },
    include: {
      category: true,
      wallet: true, // Пов’язана категорія, якщо потрібно
    },
  });

  return { transactions, startDate, endDate };
}
