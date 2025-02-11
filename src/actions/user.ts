"use server";

import { prisma } from "../../prisma/prisma";
// import { WalletFormValues } from "@/components/forms/UserWaletForm";
 import { auth } from "../../auth";

export type getInfoAdminDashboard = {
    totalUsers: number
    usersThisMonth: number;
    totalTransactions: number;
    transactionsThisMonth: number;
 }

 export const getInfoAdminDashboard = async (): Promise<getInfoAdminDashboard | null>=> {
    const session = await auth();
    if (!session?.user.id) return null;
  
    try {
      const currentDate = new Date();
      const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  
      // Кількість всіх користувачів
      const totalUsers = await prisma.user.count();
  
      // Кількість користувачів, зареєстрованих цього місяця
      const usersThisMonth = await prisma.user.count({
        where: {
          createdAt: {
            gte: firstDayOfMonth,
          },
        },
      });
  
      // Кількість всіх транзакцій
      const totalTransactions = await prisma.transaction.count();
  
      // Кількість транзакцій за останній місяць
      const transactionsThisMonth = await prisma.transaction.count({
        where: {
          createdAt: {
            gte: firstDayOfMonth,
          },
        },
      });
  
      return {
        totalUsers,
        usersThisMonth,
        totalTransactions,
        transactionsThisMonth,
      };
    } catch (error) {
      console.error("Error fetching admin dashboard data:", error);
      return null;
    }
  };