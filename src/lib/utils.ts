import { Transaction } from "@prisma/client";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateBalanceAndSums(transactions: Transaction[]) {
  return transactions.reduce(
    (result, transaction) => {
      if (transaction.transactionType === "DEBIT") {
        result.debitSum += transaction.amount; // Додаємо до дебету (доходів)
        result.balance += transaction.amount; // Додаємо до балансу
      } else if (transaction.transactionType === "CREDIT") {
        result.creditSum += transaction.amount; // Додаємо до кредиту (витрат)
        result.balance -= transaction.amount; // Віднімаємо від балансу
      }
      return result;
    },
    { balance: 0, creditSum: 0, debitSum: 0 } // Початкові значення
  );
}

