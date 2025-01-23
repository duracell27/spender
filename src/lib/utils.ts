import { ExchangeRate, Wallet } from "@prisma/client";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 1 версія, робоча
// export function calculateBalanceAndSums(wallets: Wallet[], activeWalletId: string, exchangeRates: ExchangeRate[]) {
//   if (activeWalletId === "all") {
//     // Сумуємо значення з усіх гаманців
//     return wallets.reduce(
//       (result, wallet) => {
//         result.balance += wallet.balance;
//         result.creditSum += wallet.creditSum;
//         result.debitSum += wallet.debitSum;
//         return result;
//       },
//       { balance: 0, creditSum: 0, debitSum: 0 } // Початкові значення
//     );
//   } else {
//     // Знаходимо відповідний гаманець за activeWalletId
//     const activeWallet = wallets.find(wallet => wallet.id === activeWalletId);
//     if (!activeWallet) {
//       throw new Error(`Wallet with ID ${activeWalletId} not found`);
//     }
//     return {
//       balance: activeWallet.balance,
//       creditSum: activeWallet.creditSum,
//       debitSum: activeWallet.debitSum,
//     };
//   }
// }

//2 еверсія, тестувати
export function calculateBalanceAndSums(
  wallets: Wallet[],
  activeWalletId: string,
  defaultCurrencyId: string,
  exchangeRates: ExchangeRate[]
) {
  if (activeWalletId === "all") {
    return wallets.reduce(
      (result, wallet) => {
        let walletBalance = wallet.balance;
        let walletCredit = wallet.creditSum;
        let walletDebit = wallet.debitSum;
     
        // Якщо валюта гаманця відрізняється, виконуємо конвертацію
        let exchangeRate;
        if (wallet.currencyId !== defaultCurrencyId) {
          
          if (exchangeRates === undefined) {
            result.error = true;
          } else {
            exchangeRate = exchangeRates.find(
              (rate) =>
                (rate.firstCurrencyId === defaultCurrencyId && rate.secondCurrencyId === wallet.currencyId) ||
                (rate.secondCurrencyId === defaultCurrencyId && rate.firstCurrencyId === wallet.currencyId)
            );
          }

          if (!exchangeRate) {
            result.error = true;
          } else {
            if (exchangeRate.firstCurrencyId === defaultCurrencyId) {
              walletBalance *= exchangeRate.rate; // Конвертація в активну валюту
              walletCredit *= exchangeRate.rate;
              walletDebit *= exchangeRate.rate;
            }
          }
        }

        // Додаємо результати до загальних сум
        result.balance += walletBalance;
        result.creditSum += walletCredit;
        result.debitSum += walletDebit;

        return result;
      },
      { balance: 0, creditSum: 0, debitSum: 0, error: false } // Початкові значення
    );
  } else {
    // Знаходимо відповідний гаманець за activeWalletId
    const activeWallet = wallets.find((wallet) => wallet.id === activeWalletId);
    if (!activeWallet) {
      throw new Error(`Wallet with ID ${activeWalletId} not found`);
    }
    return {
      balance: activeWallet.balance,
      creditSum: activeWallet.creditSum,
      debitSum: activeWallet.debitSum,
      error: false,
    };
  }
}

export function formatDigits(amount: number | string, digits: number = 2): string {
  // Convert the input to a number
  const numericAmount = typeof amount === "string" ? parseFloat(amount) : amount;

  // Validate the number
  if (isNaN(numericAmount)) {
    throw new Error("Invalid input: amount must be a number or a numeric string");
  }

  // Format the number with the specified number of fractional digits
  const formatter = new Intl.NumberFormat("uk-UA", {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  });

  return formatter.format(numericAmount);
}