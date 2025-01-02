"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "../../prisma/prisma";
import { WalletFormValues } from "@/components/forms/UserWaletForm";
import { auth } from "../../auth";

export const addWallet = async (data: WalletFormValues) => {
  const session = await auth();
  if (!session?.user.id) return;
  try {
  
    const initialBalance = data.initialBalance || 0; // Якщо не передано значення, використовуємо 0
    const balance = initialBalance;
    const debitSum = initialBalance > 0 ? initialBalance : 0; // Якщо баланс позитивний, враховуємо як дебіт
    const creditSum = initialBalance < 0 ? Math.abs(initialBalance) : 0; // Якщо баланс негативний, враховуємо як кредит

    const wallet = await prisma.wallet.create({
      data: {
        name: data.name,
        currencyId: data.currencyId,
        userId: session.user.id,
        balance: balance,
        debitSum: debitSum,
        creditSum: creditSum,
        initialBalance: initialBalance,
        initialBalanceDate: data.initialBalanceDate,
      },
    });

    // Додаємо початковий баланс до гаманця якщо він є
    const initCategory = await prisma.category.findFirst({
      where: {
        categoryType: "INIT",
        userId: session.user.id,
      },
    });

    if (initCategory?.id) {
      if (data.initialBalance > 0) {
        await prisma.transaction.create({
          data: {
            title: "Початковий баланс",
            amount: data.initialBalance,
            transactionType: "DEBIT",
            walletId: wallet.id,
            categoryId: initCategory?.id,
            userId: session.user.id,
            date: data.initialBalanceDate,
          },
        });
      }

      if (data.initialBalance < 0) {
        await prisma.transaction.create({
          data: {
            title: "Початковий баланс",
            amount: data.initialBalance,
            transactionType: "CREDIT",
            walletId: wallet.id,
            categoryId: initCategory?.id,
            userId: session.user.id,
            date: data.initialBalanceDate,
          },
        });
      }
    }
  } catch (error) {
    console.error(error);
  }

  revalidatePath("/dashboard/wallets");
};

export const editWallet = async (data: WalletFormValues, id: string) => {
  try {
    await prisma.wallet.update({
      where: {
        id,
      },
      data: data,
    });
  } catch (error) {
    console.error(error);
  }

  revalidatePath("/dashboard/wallets");
};

export const deleteWallet = async (id: string) => {
  const session = await auth();
  if (!session?.user.id) return;
  try {
    await prisma.wallet.delete({
      where: {
        id,
      },
    });
    await prisma.userSettings.update({
      where: {
        userId: session.user.id,
      },
      data: {
        activeWalletId: 'all'
      }
    })
    await prisma.transaction.deleteMany({
      where: {
        walletId: id
      }
    })
  } catch (error) {
    console.error(error);
  }

  revalidatePath("/dashboard/wallets");
};
