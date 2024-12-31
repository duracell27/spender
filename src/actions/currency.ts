"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "../../prisma/prisma";

export const addCurrency = async (data: {
  name: string;
  code: string;
  symbol: string;
}) => {
  
  try {
     await prisma.currency.create({
        data: {
          name: data.name,
          code: data.code,
          symbol: data.symbol,
        }
      });
  } catch (error) {
    console.error(error);
  }
  
  revalidatePath("/adminPanel/currency");
};

export const editCurrency = async (data: {
  name: string;
  code: string;
  symbol: string;
}, id:string) => {

  try {
     await prisma.currency.update({
        where:{
          id
        },
        data: {
          name: data.name,
          code: data.code,
          symbol: data.symbol,
        }
      });
  } catch (error) {
    console.error(error);
  }
  
  revalidatePath("/adminPanel/currency");
};

export const deleteCurrency = async (id:string) => {
  
  try {
     await prisma.currency.delete({
        where:{
          id
        }
      });
  } catch (error) {
    console.error(error);
  }
  
  revalidatePath("/adminPanel/currency");
};


