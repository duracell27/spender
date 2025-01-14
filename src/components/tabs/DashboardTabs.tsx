import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DayTab from "./DayTab";
import WeekTab from "./WeekTab";
import MonthTab from "./MonthTab";
import YearTab from "./YearTab";
import { Category, Currency, ExchangeRate, UserSettings, Wallet } from "@prisma/client";
import Link from "next/link";

const DashboardTabs = ({
  wallets,
  categories,
  userSettings,
  exchangeRates,
  pageNumber,
  searchParam,
}: {
  wallets: Wallet[];
  categories: Category[];
  userSettings: UserSettings & { defaultCurrency: Currency };
  exchangeRates: ExchangeRate[];
  pageNumber: number;
  searchParam?: string;
}) => {
  const currentTab = searchParam || userSettings.defaultPeriod;
  return (
    <div className="flex justify-center ">
      <Tabs
        value={currentTab}
        className="flex-1"
      >
        <TabsList className="flex gap-2">
          <Link href="/dashboard/transactions?tab=DAY" passHref>
            <TabsTrigger value="DAY">День</TabsTrigger>
          </Link>
          <Link href="/dashboard/transactions?tab=WEEK" passHref>
            <TabsTrigger value="WEEK">Тиждень</TabsTrigger>
          </Link>
          <Link href="/dashboard/transactions?tab=MONTH" passHref>
            <TabsTrigger value="MONTH">Місяць</TabsTrigger>
          </Link>
          <Link href="/dashboard/transactions?tab=YEAR" passHref>
            <TabsTrigger value="YEAR">Рік</TabsTrigger>
          </Link>
        </TabsList>

        <TabsContent value="DAY">
          <DayTab
            wallets={wallets}
            categories={categories}
            userSettings={userSettings}
            exchangeRates={exchangeRates}
            pageNumber={pageNumber}
            currentTab={currentTab}
          />
        </TabsContent>
        <TabsContent value="WEEK">
          <WeekTab
            wallets={wallets}
            categories={categories}
            userSettings={userSettings}
            exchangeRates={exchangeRates}
            pageNumber={pageNumber}
            currentTab={currentTab}
          />
        </TabsContent>
        <TabsContent value="MONTH">
          <MonthTab
            wallets={wallets}
            categories={categories}
            userSettings={userSettings}
            exchangeRates={exchangeRates}
            pageNumber={pageNumber}
            currentTab={currentTab}
          />
        </TabsContent>
        <TabsContent value="YEAR">
          <YearTab
            wallets={wallets}
            categories={categories}
            userSettings={userSettings}
            exchangeRates={exchangeRates}
            pageNumber={pageNumber}
            currentTab={currentTab}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardTabs;
