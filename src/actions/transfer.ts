"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "../../prisma/prisma";
import { auth } from "../../auth";
import { addTransaction, deleteTransaction } from "./transactions";

// робота з валютами

// створюмо валюту на базі даних з форми
export const addTransfer = async (
  data: { fromWalletId: string; amount: number; toWalletId: string },
  exchangeRate: number
) => {
  const session = await auth();
  if (!session?.user.id) return;

  const categoryId = await prisma.category.findFirst({
    where: {
      categoryType: "TRANSFER",
      userId: session.user.id,
    },
    select: {
      id: true,
    },
  });

  if (categoryId !== null) {
    const fromTransaction = await addTransaction(
      {
        title: "Вилучення",
        amount: data.amount,
        transactionType: "CREDIT",
        date: new Date(),
        categoryId: categoryId.id,
        walletId: data.fromWalletId,
      },
      true
    );

    const toTransaction = await addTransaction(
      {
        title: "Внесення",
        amount: data.amount * exchangeRate,
        transactionType: "DEBIT",
        date: new Date(),
        categoryId: categoryId.id,
        walletId: data.toWalletId,
      },
      true
    );

    if (fromTransaction && toTransaction) {
      try {
        await prisma.transfer.create({
          data: {
            userId: session.user.id,
            fromWalletId: data.fromWalletId,
            amount: data.amount,
            changed: data.amount * exchangeRate,
            toWalletId: data.toWalletId,
            fromTransactionId: fromTransaction,
            toTransactionId: toTransaction,
          },
        });
      } catch (error) {
        console.error(error);
      }

      revalidatePath("/dashboard/wallets");
    }
  }
};

// редагуємо валюту на базі даних та ід самої валюти
export const editTransfer = async (
  data: { fromWalletId: string; amount: number; toWalletId: string },
  exchangeRate: number,
  id: string
) => {
  const session = await auth();
  if (!session?.user.id) return;
  try {
    const transfer = await prisma.transfer.findUnique({
      where: {
        id,
      },
    });

    if (transfer) {
      console.log("єєєєєєєє трансфер");
      //видалямо транзакції
      const oldFromTransaction = transfer.fromTransactionId;
      const oldToTransaction = transfer.toTransactionId;

      // створюємо нові витрати та дохіди

      const categoryId = await prisma.category.findFirst({
        where: {
          categoryType: "TRANSFER",
          userId: session.user.id,
        },
        select: {
          id: true,
        },
      });

      if (categoryId !== null) {
        const fromTransaction = await addTransaction(
          {
            title: "Вилучення",
            amount: data.amount,
            transactionType: "CREDIT",
            date: new Date(),
            categoryId: categoryId.id,
            walletId: data.fromWalletId,
          },
          true
        );

        const toTransaction = await addTransaction(
          {
            title: "Внесення",
            amount: data.amount * exchangeRate,
            transactionType: "DEBIT",
            date: new Date(),
            categoryId: categoryId.id,
            walletId: data.toWalletId,
          },
          true
        );

        if (fromTransaction && toTransaction) {
          console.log("початок");
          console.log(session.user.id);
          console.log(data.fromWalletId);
          console.log(data.amount);
          console.log(data.toWalletId);
          console.log(data.amount * exchangeRate);
          console.log(fromTransaction);
          console.log(toTransaction);
          console.log("кінець");

          await prisma.transfer.update({
            where: {
              id,
            },
            data: {
              userId: session.user.id,
              fromWalletId: data.fromWalletId,
              amount: data.amount,
              changed: data.amount * exchangeRate,
              toWalletId: data.toWalletId,
              fromTransactionId: fromTransaction,
              toTransactionId: toTransaction,
            },
          });

          await deleteTransaction(oldFromTransaction, true);
          await deleteTransaction(oldToTransaction, true);
        }
      }
    }
  } catch (error) {
    console.error(error);
  }

  revalidatePath("/dashboard/wallets");
};

// видаляємо валюту, ід самої валюти
export const deleteTransfer = async (id: string) => {
  try {
    const transfer = await prisma.transfer.findUnique({
      where: {
        id,
      },
    });

    if (transfer) {
      const oldFromTransaction = transfer.fromTransactionId;
      const oldToTransaction = transfer.toTransactionId;

      await prisma.transfer.delete({
        where: {
          id,
        },
      });

      await deleteTransaction(oldFromTransaction, true);
      await deleteTransaction(oldToTransaction, true);
    }
  } catch (error) {
    console.error(error);
  }

  revalidatePath("/dashboard/wallets");
};
