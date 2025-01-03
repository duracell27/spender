"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "../../prisma/prisma";
// import { WalletFormValues } from "@/components/forms/UserWaletForm";
// import { auth } from "../../auth";
import {ActiveWalletSchema} from '@/components/forms/UserDashboardWaletSelect'

// export const addUserSettings = async (data: ActiveWalletSchema) => {
//   const session = await auth();
//   if (!session?.user.id) return;
//   try {
//      await prisma.userSettings.create({
//         data: {
//           userId: session.user.id,
//           activeWalletId: data.activeWalletId
//         }
//       });
//   } catch (error) {
//     console.error(error);
//   }
  
//   revalidatePath("/dashboard");
// };


// оновлямо налаштування користувача на базі даних з форми та ід самого користувача
export const editUserSettings = async (data: ActiveWalletSchema, id:string) => {
  // const session = await auth();
  //   if (!session?.user.id) return;
    try {
       await prisma.userSettings.update({
          where:{
            id: id,
          },
          data: data
        });
    } catch (error) {
      console.error(error);
    }
    
    revalidatePath("/dashboard");
  };
  
//   export const deleteWallet = async (id:string) => {
    
//     try {
//        await prisma.wallet.delete({
//           where:{
//             id
//           }
//         });
//     } catch (error) {
//       console.error(error);
//     }
    
//     revalidatePath("/dashboard/wallets");
//   };
  