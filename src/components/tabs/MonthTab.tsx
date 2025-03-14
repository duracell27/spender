import React from "react";
import { PanelRightClose, Pencil, ShieldAlert, Trash2 } from "lucide-react";
import Confirm from "@/components/Confirm";
import { deleteTransaction, getTransactionsByPeriod } from "@/actions/transactions";
import { calculateBalanceAndSums, formatDigits } from "@/lib/utils";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { auth } from "../../../auth";
import UserTransactionForm from "../forms/UserTransactionForm";
import { Category, Currency, ExchangeRate, UserSettings, Wallet } from "@prisma/client";
import { prisma } from "../../../prisma/prisma";

const DayTab = async ({
  wallets,
  categories,
  userSettings,
  exchangeRates,
  pageNumber,
  currentTab,
}: {
  wallets: Wallet[];
  categories: Category[];
  userSettings: UserSettings & { defaultCurrency: Currency };
  exchangeRates: ExchangeRate[];
  pageNumber: number;
  currentTab?: string;
}) => {
  const session = await auth();
  if (!session?.user.id) return;

  const {
    transactions,
    startDate,
    total,
    debitTotal = 0,
    creditTotal = 0,
  } = await getTransactionsByPeriod("month", userSettings.activeWalletId, pageNumber, 10);

  const { balance, creditSum, debitSum, error } = calculateBalanceAndSums(
    wallets,
    userSettings.activeWalletId,
    userSettings.defaultCurrencyId,
    exchangeRates
  );

  let currency;

  if (userSettings.activeWalletId === "all") {
    currency = await prisma.currency.findFirst({
      where: {
        id: userSettings.defaultCurrencyId,
      },
    });
  } else {
    currency = await prisma.currency.findFirst({
      where: {
        wallets: {
          some: {
            id: userSettings.activeWalletId,
          },
        },
      },
    });
  }

  if (!currency) return null;

  let exchanges: ExchangeRate | null = {} as ExchangeRate;

  if (currency.id !== userSettings.defaultCurrencyId) {
    exchanges = await prisma.exchangeRate.findFirst({
      where: {
        userId: session.user.id,
        firstCurrencyId: userSettings.defaultCurrencyId,
        secondCurrencyId: currency.id,
      },
      orderBy: {
        date: "desc",
      },
    });
  }

  return (
    <div>
      <div className="font-bold text-center my-4 text-2xl capitalize">
        {format(startDate, "LLLL", { locale: uk })}
      </div>
      <div className="flex justify-evenly items-center text-xs sm:text-sm">
        <div className="text-green-500 p-3 px-3 sm:px-5 bg-green-200 rounded-full">
          <p className="flex items-center">
            {`Прибуток за період ${formatDigits(debitTotal)} ${currency?.symbol}`}
            {error && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <ShieldAlert className="size-4" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Не задано курс валюти для деяких рахунків, вкажіть всі курси у вкладці Валюти</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </p>
          {currency.id !== userSettings.defaultCurrencyId && exchanges === null ? (
            <p>Курс не задано</p>
          ) : currency.id !== userSettings.defaultCurrencyId && exchanges ? (
            <p className="text-center text-xs text-gray-500">
              ~{formatDigits(exchanges.rate * debitTotal)}
              {userSettings.defaultCurrency.symbol}
            </p>
          ) : (
            ""
          )}
        </div>

        <div
          className={
            balance >= 0
              ? "text-green-500 p-3 px-3 sm:px-5 bg-green-200 rounded-full"
              : "text-red-500 p-3 px-3 sm:px-5 bg-red-200 rounded-full"
          }
        >
          <div className="flex items-center">
            <div className="flex flex-col justify-center text-center">
              <div className="font-bold text-2xl">
                Баланс {formatDigits(balance)} {currency?.symbol}
                {currency.id !== userSettings.defaultCurrencyId && exchanges === null ? (
                  <p>Курс не задано</p>
                ) : currency.id !== userSettings.defaultCurrencyId && exchanges ? (
                  <p className="text-center text-xs text-gray-500">
                    ~{formatDigits(exchanges.rate * balance)}
                    {userSettings.defaultCurrency.symbol}
                  </p>
                ) : (
                  ""
                )}
              </div>
              <div className="my-1"></div>
              <span className="text-red-500">
                Витрати {formatDigits(creditSum)} {currency?.symbol}
              </span>
              <span className="text-green-500">
                Прибуток {formatDigits(debitSum)} {currency?.symbol}
              </span>
            </div>
            {error && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <ShieldAlert className="size-4" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Не задано курс валюти для деяких рахунків, вкажіть всі курси у вкладці Валюти</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>

        <div className="text-red-500 p-3 px-3 sm:px-5 bg-red-200 rounded-full">
          <p className="flex items-center">
            {`Витрати за період ${formatDigits(creditTotal)} ${currency?.symbol}`}
            {error && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <ShieldAlert className="size-4" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Не задано курс валюти для деяких рахунків, вкажіть всі курси у вкладці Валюти</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </p>
          {currency.id !== userSettings.defaultCurrencyId && exchanges === null ? (
            <p>Курс не задано</p>
          ) : currency.id !== userSettings.defaultCurrencyId && exchanges ? (
            <p className="text-center text-xs text-gray-500">
              ~{formatDigits(exchanges.rate * creditTotal)}
              {userSettings.defaultCurrency.symbol}
            </p>
          ) : (
            ""
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 my-4 justify-center">
        <UserTransactionForm
          title="Дохід"
          initType="DEBIT"
          wallets={wallets}
          categories={categories}
          userSettings={userSettings}
        />
        <UserTransactionForm
          title="Витрата"
          initType="CREDIT"
          wallets={wallets}
          categories={categories}
          userSettings={userSettings}
        />
      </div>

      <div className="">
        <Table className="text-[8px] sm:text-sm">
          <TableCaption className="caption-top font-bold">Лист транзакцій</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="">Дата</TableHead>
              <TableHead>Назва</TableHead>
              <TableHead>Сума</TableHead>
              <TableHead className="">Категорія</TableHead>
              <TableHead className="">Рахунок</TableHead>
              <TableHead className="text-right">Дії</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow
                className={
                  transaction.transactionType === "DEBIT"
                    ? "bg-green-400 text-background hover:bg-green-600"
                    : "bg-red-400 text-background hover:bg-red-600"
                }
                key={transaction.id}
              >
                <TableCell>{format(transaction.date, "dd.MM", { locale: uk })}</TableCell>
                <TableCell>{transaction.title}</TableCell>
                <TableCell>
                  {formatDigits(transaction.amount)} {currency?.symbol}
                </TableCell>
                <TableCell className="font-medium">{transaction.category.name}</TableCell>
                <TableCell className="font-medium">{transaction.wallet.name}</TableCell>
                <TableCell className="text-right">
                  <div className="hidden sm:block">
                  {transaction.category.name !== 'Перенесення' ? (<div className="flex justify-end gap-2">
                      <UserTransactionForm
                        title={<Pencil />}
                        edit={true}
                        data={transaction}
                        id={transaction.id}
                        wallets={wallets}
                        initType={transaction.transactionType}
                        categories={categories}
                        userSettings={userSettings}
                      />
                      <Confirm
                        title={<Trash2 />}
                        message="Транзакція успішно видалена!"
                        actionButtonTitle="Видалити"
                        fn={deleteTransaction}
                        id={transaction.id}
                      />
                    </div>):(<>Змінити можна в рахунках</>)}
                  </div>
                  <div className="block sm:hidden">
                    <Dialog>
                      <DialogTrigger>
                        <PanelRightClose className="size-3" />
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Видалити чи редагувати?</DialogTitle>
                          <DialogDescription>
                          {transaction.category.name !== 'Перенесення'?(<div className="flex justify-center gap-2 mt-4">
                              <UserTransactionForm
                                title={<Pencil />}
                                edit={true}
                                data={transaction}
                                id={transaction.id}
                                wallets={wallets}
                                initType={transaction.transactionType}
                                categories={categories}
                                userSettings={userSettings}
                              />
                              <Confirm
                                title={<Trash2 />}
                                actionButtonTitle="Видалити"
                                fn={deleteTransaction}
                                id={transaction.id}
                                message="Транзакція успішно видалена!"
                              />
                            </div>):(<>Змінити можна в рахунках</>)}
                          </DialogDescription>
                        </DialogHeader>
                      </DialogContent>
                    </Dialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {total > 10 ? (
          <Pagination>
            <PaginationContent className="mt-2">
              {pageNumber > 1 ? (
                <PaginationItem className="border">
                  <PaginationPrevious href={`/dashboard/transactions/${pageNumber - 1}?tab=${currentTab}`} />
                </PaginationItem>
              ) : (
                ""
              )}

              <PaginationItem className="border">
                <PaginationLink href={`/dashboard/transactions/${pageNumber}?tab=${currentTab}`}>
                  {pageNumber}
                </PaginationLink>
              </PaginationItem>
              {total > pageNumber * 10 ? (
                <PaginationItem className="border">
                  <PaginationNext href={`/dashboard/transactions/${pageNumber + 1}?tab=${currentTab}`} />
                </PaginationItem>
              ) : (
                ""
              )}
            </PaginationContent>
          </Pagination>
        ) : (
          ""
        )}
      </div>
    </div>
  );
};

export default DayTab;
