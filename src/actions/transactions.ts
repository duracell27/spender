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
  format,
  eachDayOfInterval,
} from "date-fns";
import { formatDigits } from "@/lib/utils";

// Робота з транзакціями

// додавання транзакції на базі даних із форми
// також перераховуємо баланси у рахунку у відповідності до суми витрати
export const addTransaction = async (data: TransactionFormValues, transfer: boolean = false) => {
  const session = await auth();
  if (!session?.user.id) return;

  // додавання витрати
  try {
    const dateTr = data.date.toISOString() 
    const createdTransaction = await prisma.transaction.create({
      data: {
        title: data.title,
        amount: data.amount,
        transactionType: data.transactionType,
        userId: session.user.id,
        date: dateTr,
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

    let debitChange = 0;
    let creditChange = 0;

    if (transfer === false) {
      debitChange = data.transactionType === "DEBIT" ? data.amount : 0;
      creditChange = data.transactionType === "CREDIT" ? data.amount : 0;
    }

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

    revalidatePath("/dashboard");
    return createdTransaction.id;
  } catch (error) {
    console.error(error);
  }
};

// редагування транзакції на базі даних від форми та ід самої транзакції
// також перераховуємо значення суми рахунку методом попреднього видалення обрахунку і застосуванням нового
export const editTransaction = async (data: TransactionFormValues, id: string) => {
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

      const debitChange = transaction.transactionType === "DEBIT" ? -transaction.amount : 0;
      const creditChange = transaction.transactionType === "CREDIT" ? -transaction.amount : 0;
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
        date: data.date.toISOString(),
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
export const deleteTransaction = async (id: string, transfer: boolean = false) => {
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

      let debitChange = 0;
      let creditChange = 0;

      if (transfer === false) {
        debitChange = transaction.transactionType === "DEBIT" ? -transaction.amount : 0;
        creditChange = transaction.transactionType === "CREDIT" ? -transaction.amount : 0;
      }

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

export async function getTransactionsByPeriod(
  period: "day" | "week" | "month" | "year",
  activeWalletId: string = "all",
  page: number = 1, // Номер сторінки
  limit: number = 10 // Кількість записів на сторінку
) {
  const session = await auth();
  if (!session?.user.id) return { transactions: [], startDate: new Date(), endDate: new Date(), total: 0 };

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

  // Вираховуємо, скільки записів пропустити
  const skip = (page - 1) * limit;

  // Отримуємо загальну кількість записів для пагінації
  const total = await prisma.transaction.count({
    where: {
      date: {
        gte: startDate,
        lte: endDate,
      },
      userId: session.user.id,
      ...(activeWalletId !== "all" && { walletId: activeWalletId }),
    },
  });

  // Отримуємо записи з урахуванням пагінації
  const transactions = await prisma.transaction.findMany({
    where: {
      date: {
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
    orderBy: {
      date: "desc", // Використовуємо поле date і сортуємо за спаданням (desc) або зростанням (asc)
    },
    skip, // Пропускаємо записи для пагінації
    take: limit, // Обмежуємо кількість записів
  });

  const debitTotal = await prisma.transaction.aggregate({
    _sum: {
      amount: true,
    },
    where: {
      date: {
        gte: startDate,
        lte: endDate,
      },

      userId: session.user.id,
      transactionType: "DEBIT",
      ...(activeWalletId !== "all" && { walletId: activeWalletId }),
      category: {
        name: { not: "Перенесення" }, // Виключаємо категорію "Перенесення"
      },
    },
  });

  // Підрахунок сум для CREDIT
  const creditTotal = await prisma.transaction.aggregate({
    _sum: {
      amount: true,
    },
    where: {
      date: {
        gte: startDate,
        lte: endDate,
      },
      userId: session.user.id,
      transactionType: "CREDIT",
      ...(activeWalletId !== "all" && { walletId: activeWalletId }),
      category: {
        name: { not: "Перенесення" }, // Виключаємо категорію "Перенесення"
      },
    },
  });

  return {
    transactions,
    startDate,
    endDate,
    total,
    page,
    limit,
    debitTotal: debitTotal._sum.amount || 0,
    creditTotal: creditTotal._sum.amount || 0,
  };
}

// дістаємо дані для графіка в дешборд на базі вказаного користувача місяця і року
interface ChartData {
  day: string;
  value: number;
}
export async function getMonthlyExpenses(
  userId: string,
  month: number,
  year: number,
  defaultCurrencyId: string
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
      category: {
        name: { not: "Перенесення" }, // Виключаємо категорію "Перенесення"
      },
    },
    include: {
      wallet: true,
    },
  });

  const exchangeRates = await prisma.exchangeRate.findMany({
    where: {
      userId,
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
    if (transaction.wallet.currencyId !== defaultCurrencyId) {
      const exchangeRate = exchangeRates.find(
        (rate) =>
          rate.firstCurrencyId === defaultCurrencyId &&
          rate.secondCurrencyId === transaction.wallet.currencyId
      );

      if (exchangeRate) {
        data[day - 1].value += transaction.amount * exchangeRate.rate; // Додати до відповідного дня
      } else {
        data[day - 1].value += 0;
      }
    } else {
      data[day - 1].value += transaction.amount;
    }
  }

  return data;
}

export async function getMonthlyExpensesByCategory(
  userId: string,
  month: number,
  year: number,
  defaultCurrencyId: string
) {
  const startDate = new Date(year, month - 1, 1); // Початок місяця
  const endDate = new Date(year, month, 0, 23, 59, 59, 999); // Кінець місяця

  // Отримуємо транзакції
  const transactions = await prisma.transaction.groupBy({
    by: ["categoryId", "walletId"],
    where: {
      userId,
      transactionType: "CREDIT",
      date: {
        gte: startDate,
        lte: endDate,
      },
      category: {
        name: { not: "Перенесення" }, // Виключаємо категорію "Перенесення"
      },
    },
    _sum: {
      amount: true,
    },
  });

  // Отримуємо категорії
  const categories = await prisma.category.findMany({
    where: {
      id: {
        in: transactions.map((t) => t.categoryId),
      },
    },
    select: {
      id: true,
      name: true,
    },
  });

  // Отримуємо курси обміну
  const exchangeRates = await prisma.exchangeRate.findMany({
    where: {
      userId,
    },
  });

  // Отримуємо валюти гаманців транзакцій
  const wallets = await prisma.wallet.findMany({
    where: {
      id: {
        in: transactions.map((t) => t.walletId),
      },
    },
    select: {
      id: true,
      currencyId: true,
    },
  });

  // Обробляємо транзакції
  const data = transactions.map((transaction) => {
    const category = categories.find((cat) => cat.id === transaction.categoryId);
    const wallet = wallets.find((w) => w.id === transaction.walletId);

    let sum = transaction._sum.amount || 0;

    if (wallet && wallet.currencyId !== defaultCurrencyId) {
      // Знаходимо курс обміну
      const exchangeRate = exchangeRates.find(
        (rate) => rate.secondCurrencyId === wallet.currencyId && rate.firstCurrencyId === defaultCurrencyId
      );

      if (exchangeRate) {
        // Конвертуємо суму
        sum *= exchangeRate.rate;
      } else {
        console.warn(`No exchange rate found for ${wallet.currencyId} -> ${defaultCurrencyId}`);
      }
    }

    return {
      catName: category?.name || "Unknown",
      sum,
    };
  });

  // Сортуємо дані за спаданням суми витрат
  const top8 = data.sort((a, b) => b.sum - a.sum).slice(0, 8);

  return top8;
}

//дістаємо дані для графіка мак мін вистрати і середні
export interface MonthlyInfoData {
  maxExpense: { title: string; amount: string } | null;
  maxIncome: { title: string; amount: string } | null;
  averageDailyExpense: number;
  averageDailyIncome: number;
}

export const getMonthlyInfoData = async (
  userId: string,
  month: number,
  year: number,
  defaultCurrencyId: string
): Promise<MonthlyInfoData> => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  // Отримуємо всі транзакції користувача
  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
        lte: endDate,
      },
      category: {
        name: { not: "Перенесення" }, // Виключаємо категорію "Перенесення"
      },
    },
  });

  // Отримуємо курси обміну
  const exchangeRates = await prisma.exchangeRate.findMany({
    where: {
      userId,
    },
  });

  // Отримуємо валюти гаманців
  const wallets = await prisma.wallet.findMany({
    where: {
      id: {
        in: transactions.map((t) => t.walletId),
      },
    },
    select: {
      id: true,
      currencyId: true,
    },
  });

  // Функція для конвертації суми
  const convertToDefaultCurrency = (amount: number, walletId: string): number => {
    const wallet = wallets.find((w) => w.id === walletId);

    if (wallet && wallet.currencyId !== defaultCurrencyId) {
      const exchangeRate = exchangeRates.find(
        (rate) => rate.secondCurrencyId === wallet.currencyId && rate.firstCurrencyId === defaultCurrencyId
      );

      if (exchangeRate) {
        return amount * exchangeRate.rate;
      } else {
        console.warn(`No exchange rate found for ${wallet.currencyId} -> ${defaultCurrencyId}`);
        return amount; // Якщо курс не знайдено, повертаємо початкову суму
      }
    }

    return amount; // Якщо валюта співпадає, повертаємо початкову суму
  };

  // Конвертуємо всі транзакції до базової валюти
  const convertedTransactions = transactions.map((t) => ({
    ...t,
    amount: convertToDefaultCurrency(t.amount, t.walletId),
  }));

  // Розподіляємо транзакції на витрати та доходи
  const expenses = convertedTransactions.filter((t) => t.transactionType === "CREDIT");
  const incomes = convertedTransactions.filter((t) => t.transactionType === "DEBIT");

  // Обчислюємо максимальні витрати
  const maxExpense = expenses.length ? expenses.reduce((max, t) => (t.amount > max.amount ? t : max)) : null;

  // Обчислюємо максимальні доходи
  const maxIncome = incomes.length ? incomes.reduce((max, t) => (t.amount > max.amount ? t : max)) : null;

  // Поточний день для обчислення середніх витрат
  const today = new Date();
  const currentDay =
    today.getFullYear() === year && today.getMonth() === month - 1 ? today.getDate() : endDate.getDate();

  // Сума витрат та середні витрати
  const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);
  const averageDailyExpense = expenses.length ? totalExpense / currentDay : 0;

  // Сума доходів та середні доходи
  const totalIncome = incomes.reduce((sum, t) => sum + t.amount, 0);
  const averageDailyIncome = incomes.length ? totalIncome / endDate.getDate() : 0;

  return {
    maxExpense: maxExpense
      ? { title: maxExpense.title, amount: formatDigits(maxExpense.amount) }
      : { title: "", amount: formatDigits(0) },
    maxIncome: maxIncome
      ? { title: maxIncome.title, amount: formatDigits(maxIncome.amount) }
      : { title: "", amount: formatDigits(0) },
    averageDailyExpense: +averageDailyExpense.toFixed(2),
    averageDailyIncome: +averageDailyIncome.toFixed(2),
  };
};

export interface ZvitChartData {
  day: string;
  value: number;
}

export interface ExpensesResult {
  data: ZvitChartData[];
  total: number;
}

export async function getExpensesByCategoryAndDate(
  categoryId: string,
  dateFrom: Date,
  dateTo: Date,
  defaultCurrencyId: string
): Promise<ExpensesResult> {
  const session = await auth();
  if (!session?.user.id) return { data: [], total: 0 };

  // Отримуємо всі витрати за категорією та датою разом із гаманцем користувача
  const transactions = await prisma.transaction.findMany({
    where: {
      categoryId,
      userId: session.user.id,
      date: {
        gte: dateFrom,
        lte: dateTo,
      },
    },
    include: {
      wallet: true,
    },
  });

  // Отримуємо курси валют для користувача
  const exchangeRates = await prisma.exchangeRate.findMany({
    where: {
      userId: session.user.id,
    },
  });

  // Групуємо витрати по днях
  const groupedData: Record<string, number> = {};
  let totalSum = 0; // Загальна сума витрат

  transactions.forEach((transaction) => {
    const day = format(startOfDay(transaction.date), "dd-MM-yyyy"); // Форматуємо дату
    let amountInDefaultCurrency = transaction.amount;

    // Якщо валюта транзакції не співпадає з основною
    if (transaction.wallet.currencyId !== defaultCurrencyId) {
      const exchangeRate = exchangeRates.find(
        (rate) =>
          rate.firstCurrencyId === defaultCurrencyId &&
          rate.secondCurrencyId === transaction.wallet.currencyId
      );
      if (exchangeRate) {
        amountInDefaultCurrency *= exchangeRate.rate;
      } else {
        amountInDefaultCurrency = 0; // Якщо немає курсу валют
      }
    }

    groupedData[day] = (groupedData[day] || 0) + amountInDefaultCurrency;
    totalSum += amountInDefaultCurrency;
  });

  // Створюємо масив всіх днів у діапазоні
  const allDays = eachDayOfInterval({ start: dateFrom, end: dateTo });

  // Формуємо кінцевий масив із заповненням нульових значень
  const data: ZvitChartData[] = allDays.map((day) => {
    const formattedDay = format(day, "dd-MM-yyyy");
    return {
      day: formattedDay,
      value: groupedData[formattedDay] || 0, // Якщо дня немає в `groupedData`, ставимо 0
    };
  });

  return { data, total: totalSum };
}