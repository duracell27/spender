import { Wallet } from "@prisma/client";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateBalanceAndSums(wallets: Wallet[], activeWalletId: string) {
  if (activeWalletId === "all") {
    // Сумуємо значення з усіх гаманців
    return wallets.reduce(
      (result, wallet) => {
        result.balance += wallet.balance;
        result.creditSum += wallet.creditSum;
        result.debitSum += wallet.debitSum;
        return result;
      },
      { balance: 0, creditSum: 0, debitSum: 0 } // Початкові значення
    );
  } else {
    // Знаходимо відповідний гаманець за activeWalletId
    const activeWallet = wallets.find(wallet => wallet.id === activeWalletId);
    if (!activeWallet) {
      throw new Error(`Wallet with ID ${activeWalletId} not found`);
    }
    return {
      balance: activeWallet.balance,
      creditSum: activeWallet.creditSum,
      debitSum: activeWallet.debitSum,
    };
  }
}

export function formatDigits(amount: number) {
  const formatter = new Intl.NumberFormat('uk-UA', {
    minimumFractionDigits: 0, // Мінімум десяткових знаків
    maximumFractionDigits: 2, // Максимум два десяткових знаки
  });
  return formatter.format(amount);
}
