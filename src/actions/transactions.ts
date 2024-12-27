"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "../../prisma/prisma";
import { TransactionFormValues } from "@/components/forms/UserTransactionForm";
import { auth } from "../../auth";


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
          categoryId: data.categoryId,
          walletId: data.walletId,
        }
      });
  } catch (error) {
    console.error(error);
  }
  
  revalidatePath("/dashboard");
};

export const editTransaction = async (data: TransactionFormValues, id:string) => {
  const session = await auth();
  if (!session?.user.id) return;
  console.log("edit transaction", data);
  try {
     await prisma.transaction.update({
        where:{
          id
        },
        data: {
          title: data.title,
          amount: data.amount,
          transactionType: data.transactionType,
          userId: session.user.id,
          categoryId: data.categoryId,
          walletId: data.walletId,
        }
      });
  } catch (error) {
    console.error(error);
  }
  
  revalidatePath("/dashboard");
};

export const deleteTransaction = async (id:string) => {
  
  try {
     await prisma.transaction.delete({
        where:{
          id
        }
      });
  } catch (error) {
    console.error(error);
  }
  
  revalidatePath("/dashboard");
};


