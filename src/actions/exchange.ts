"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "../../prisma/prisma";
import { ExchangeFormValues } from "@/components/forms/UserExchangeForm";
import { auth } from "../../auth";

// робота з валютами

// створюмо валюту на базі даних з форми
export const addExchange = async (data: ExchangeFormValues) => {
  const session = await auth();
    if (!session?.user.id) return;
  try {
    // створюмо ексчендж на базі даних з форми
     await prisma.exchangeRate.create({
        data: {
          rate: data.rate,
          date: data.date,
          userId: session.user.id,
          firstCurrencyId: data.firstCurrencyId,
          secondCurrencyId: data.secondCurrencyId
        }
      });
      // створюмо зворотній ексчендж на базі даних з форми, зеркальний курс
      await prisma.exchangeRate.create({
        data: {
          rate: 1 / data.rate,
          date: data.date,
          userId: session.user.id,
          firstCurrencyId: data.secondCurrencyId,
          secondCurrencyId: data.firstCurrencyId,
        }
      });

  } catch (error) {
    console.error(error);
  }
  
  revalidatePath("/dashboard/currencies");
};

// редагуємо валюту на базі даних та ід самої валюти
export const editExchange = async (data: ExchangeFormValues, id:string) => {
  const session = await auth();
    if (!session?.user.id) return;
  try {
     await prisma.exchangeRate.update({
        where:{
          id
        },
        data: {
          rate: data.rate,
          date: data.date,
          userId: session.user.id,
          firstCurrencyId: data.firstCurrencyId,
          secondCurrencyId: data.secondCurrencyId
        }
      });

      // пошуку парного курсу

      const secondExchangeRate = await prisma.exchangeRate.findFirst({
        where:{
          userId: session.user.id,
          firstCurrencyId: data.secondCurrencyId,
          secondCurrencyId: data.firstCurrencyId
        }
      })
      if(secondExchangeRate){

        if(secondExchangeRate.id){
          
          await prisma.exchangeRate.update({
            where:{
              id: secondExchangeRate.id
            },
            data: {
              rate: 1 / data.rate,
              date: data.date,
              userId: session.user.id,
              firstCurrencyId: data.secondCurrencyId,
              secondCurrencyId: data.firstCurrencyId
            }
          })
        }
      }


  } catch (error) {
    console.error(error);
  }
  
  revalidatePath("/dashboard/currencies");
};

// видаляємо валюту, ід самої валюти
export const deleteExchange = async (id:string) => {
  const session = await auth();
    if (!session?.user.id) return;
  try {

    // спочатку знайдемо дані для пошуку парного курсу
    const exchangeRateFirst = await prisma.exchangeRate.findFirst({
      where:{
        userId: session.user.id,
        id
      }
    })
    if(exchangeRateFirst){

      const exchangeRateSecond = await prisma.exchangeRate.findFirst({
        where:{
          userId: session.user.id,
          firstCurrencyId: exchangeRateFirst.secondCurrencyId,
          secondCurrencyId: exchangeRateFirst.firstCurrencyId
        }
      })
      //видаляємо другий парний курс
      if(exchangeRateSecond){
        await prisma.exchangeRate.delete({
          where:{
            id: exchangeRateSecond.id
          }
        });
      }
    }
    // видаляємо основний курс
     await prisma.exchangeRate.delete({
        where:{
          id
        }
      });
  } catch (error) {
    console.error(error);
  }
  
  revalidatePath("/dashboard/currencies");
};


