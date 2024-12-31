"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "../../prisma/prisma";
import { WalletFormValues } from "@/components/forms/UserWaletForm";
import { auth } from "../../auth";

export const addWallet = async (data: WalletFormValues) => {
  const session = await auth();
  if (!session?.user.id) return;
  try {
     await prisma.wallet.create({
        data: {
          name: data.name,
          currencyId: data.currencyId,
          userId: session.user.id,
          initialBalance: data.initialBalance,
          initialBalanceDate: data.initialBalanceDate,
        }
      });
  } catch (error) {
    console.error(error);
  }
  
  revalidatePath("/dashboard/wallets");
};

export const editWallet = async (data: WalletFormValues, id:string) => {

    try {
       await prisma.wallet.update({
          where:{
            id
          },
          data: data
        });
    } catch (error) {
      console.error(error);
    }
    
    revalidatePath("/dashboard/wallets");
  };
  
  export const deleteWallet = async (id:string) => {
    
    try {
       await prisma.wallet.delete({
          where:{
            id
          }
        });
    } catch (error) {
      console.error(error);
    }
    
    revalidatePath("/dashboard/wallets");
  };
  