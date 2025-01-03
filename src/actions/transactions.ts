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

// Робота з транзакціями

// додавання транзакції на базі даних із форми
// також перераховуємо баланси у рахунку у відповідності до суми витрати
export const addTransaction = async (data: TransactionFormValues) => {
  const session = await auth();
  if (!session?.user.id) return;

  // додавання витрати
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

    // Оновлення балансу у відповідності до суми витрати
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

// редагування транзакції на базі даних від форми та ід самої транзакції
// також перераховуємо значення суми рахунку методом попреднього видалення обрахунку і застосуванням нового
export const editTransaction = async (
  data: TransactionFormValues,
  id: string
) => {
  const session = await auth();
  if (!session?.user.id) return;
  // визначаємо суми попередньої транзакції
  try {
    const transaction = await prisma.transaction.findUnique({
      where: {
        id,
      },
    });
    // віднімаємо ці суми
    if (transaction) {
      // Визначаємо зміну балансу залежно від типу транзакції
      const balanceChange =
        transaction.transactionType === "CREDIT"
          ? transaction.amount // Витрати
          : -transaction.amount; // Дохід

      const debitChange =
        transaction.transactionType === "DEBIT" ? -transaction.amount : 0;
      const creditChange =
        transaction.transactionType === "CREDIT" ? -transaction.amount : 0;
      // віднімаємо ці суми
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
    // оновлюмо траназакцію
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

    // на базі оновлених даних перераховуємо баланс гаманця

    // Визначаємо зміну балансу залежно від типу транзакції
    const balanceChange =
      data.transactionType === "CREDIT"
        ? -data.amount // Витрати
        : data.amount; // Дохід

    const debitChange = data.transactionType === "DEBIT" ? data.amount : 0;
    const creditChange = data.transactionType === "CREDIT" ? data.amount : 0;
    // на базі оновлених даних перераховуємо баланс гаманця
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

// видалямо транзакцію, отримуємо ід самої транзакції
export const deleteTransaction = async (id: string) => {
  // знаходимо транзакцію щоб вімінусувати з рахунку її дані
  try {
    const transaction = await prisma.transaction.findUnique({
      where: {
        id,
      },
    });
    // міняємо рахунок

    if (transaction) {
      // Визначаємо зміну балансу залежно від типу транзакції
      const balanceChange =
        transaction.transactionType === "CREDIT"
          ? transaction.amount // Витрати
          : -transaction.amount; // Дохід

      const debitChange =
        transaction.transactionType === "DEBIT" ? -transaction.amount : 0;
      const creditChange =
        transaction.transactionType === "CREDIT" ? -transaction.amount : 0;

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
    // видалямо транзакцію
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


// дістаємо транзакції по користувачу за вказаний період, та за активним рахунком
export async function getTransactionsByPeriod(
  period: "day" | "week" | "month" | "year",
  activeWalletId: string = "all"
) {
  const session = await auth();
  if (!session?.user.id)
    return { transactions: [], startDate: new Date(), endDate: new Date() };

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



// дістаємо дані для графіка в дешборд на базі вказаного користувача місяця і року
interface ChartData {
  day: string;
  value: number;
}
export async function getMonthlyExpenses(
  userId: string,
  month: number,
  year: number
): Promise<ChartData[]> {
  // Отримати всі транзакції за вказаний місяць і рік з типом `credit`
  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      transactionType: "CREDIT",
      date: {
        gte: new Date(year, month - 1, 1), // Початок місяця
        lt: new Date(year, month, 1), // Початок наступного місяця
      },
    },
    select: {
      amount: true,
      date: true,
    },
  });

  // Ініціалізувати масив з днями місяця
  const daysInMonth = new Date(year, month, 0).getDate();
  const data: ChartData[] = Array.from({ length: daysInMonth }, (_, i) => ({
    day: (i + 1).toString().padStart(2, "0"), // Дні у форматі "01", "02", ...
    value: 0,
  }));

  // Сумувати витрати за кожен день
  for (const transaction of transactions) {
    const day = new Date(transaction.date).getDate(); // Отримати номер дня
    data[day - 1].value += transaction.amount; // Додати до відповідного дня
  }

  return data;
}
