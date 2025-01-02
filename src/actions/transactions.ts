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

    // Визначаємо зміну балансу залежно від типу транзакції
    const balanceChange =
      data.transactionType === "CREDIT"
        ? -data.amount // Витрати
        : data.amount; // Дохід

    const debitChange = data.transactionType === "DEBIT" ? data.amount : 0;
    const creditChange = data.transactionType === "CREDIT" ? data.amount : 0;

    await prisma.wallet.update({
      where: {
        id: data.walletId,
      },
      data: {
        balance: {
          increment: balanceChange,
        },
        debitSum: {
          increment: debitChange, // Додаємо до debitSum, якщо тип DEBIT
        },
        creditSum: {
          increment: creditChange, // Додаємо до creditSum, якщо тип CREDIT
        },
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
    const transaction = await prisma.transaction.findUnique({
      where: {
        id,
      },
    });

    if (transaction) {
      // Визначаємо зміну балансу залежно від типу транзакції
      const balanceChange =
        transaction.transactionType === "CREDIT"
          ? transaction.amount // Витрати
          : -transaction.amount; // Дохід

      const debitChange = transaction.transactionType === "DEBIT" ? -transaction.amount : 0;
      const creditChange = transaction.transactionType === "CREDIT" ? -transaction.amount : 0;

      await prisma.wallet.update({
        where: {
          id: transaction.walletId,
        },
        data: {
          balance: {
            increment: balanceChange,
          },
          debitSum: {
            increment: debitChange, // Додаємо до debitSum, якщо тип DEBIT
          },
          creditSum: {
            increment: creditChange, // Додаємо до creditSum, якщо тип CREDIT
          },
        },
      });
    }

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

    // Визначаємо зміну балансу залежно від типу транзакції
    const balanceChange =
      data.transactionType === "CREDIT"
        ? -data.amount // Витрати
        : data.amount; // Дохід

    const debitChange = data.transactionType === "DEBIT" ? data.amount : 0;
    const creditChange = data.transactionType === "CREDIT" ? data.amount : 0;

    await prisma.wallet.update({
      where: {
        id: data.walletId,
      },
      data: {
        balance: {
          increment: balanceChange,
        },
        debitSum: {
          increment: debitChange, // Додаємо до debitSum, якщо тип DEBIT
        },
        creditSum: {
          increment: creditChange, // Додаємо до creditSum, якщо тип CREDIT
        },
      },
    });
  } catch (error) {
    console.error(error);
  }

  revalidatePath("/dashboard");
};

export const deleteTransaction = async (id: string) => {
  try {
    const transaction = await prisma.transaction.findUnique({
      where: {
        id,
      },
    });

    if (transaction) {
      
      // Визначаємо зміну балансу залежно від типу транзакції
      const balanceChange =
        transaction.transactionType === "CREDIT"
          ? transaction.amount // Витрати
          : -transaction.amount; // Дохід

      const debitChange = transaction.transactionType === "DEBIT" ? -transaction.amount : 0;
      const creditChange = transaction.transactionType === "CREDIT" ? -transaction.amount : 0;

      await prisma.wallet.update({
        where: {
          id: transaction.walletId,
        },
        data: {
          balance: {
            increment: balanceChange,
          },
          debitSum: {
            increment: debitChange, // Додаємо до debitSum, якщо тип DEBIT
          },
          creditSum: {
            increment: creditChange, // Додаємо до creditSum, якщо тип CREDIT
          },
        },
      });
    }

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
  activeWalletId: string = "all"
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
