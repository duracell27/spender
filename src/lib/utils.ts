import { Transaction } from "@prisma/client";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateBalance(transactions: Transaction[]): number {
  return transactions.reduce((balance, transaction) => {
    if (transaction.transactionType === "DEBIT") {
      return balance + transaction.amount; // Додаємо до балансу
    } else if (transaction.transactionType === "CREDIT") {
      return balance - transaction.amount; // Віднімаємо від балансу
    }
    return balance;
  }, 0); // Початковий баланс — 0
}
