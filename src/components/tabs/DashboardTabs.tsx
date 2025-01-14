import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DayTab from "./DayTab";
import WeekTab from "./WeekTab";
import MonthTab from "./MonthTab";
import YearTab from "./YearTab";
import { Category, Currency, ExchangeRate, UserSettings, Wallet } from "@prisma/client";

const DashboardTabs = ({wallets, categories, userSettings, exchangeRates, pageNumber}: {wallets: Wallet[], categories: Category[], userSettings: UserSettings & {defaultCurrency: Currency}, exchangeRates: ExchangeRate[], pageNumber?:number}) => {
  
  return (
    <div className="flex justify-center ">
      <Tabs defaultValue={userSettings.defaultPeriod} className="flex-1">
        <TabsList className="flex gap-2">
          <TabsTrigger value="DAY">День</TabsTrigger>
          <TabsTrigger value="WEEK">Тиждень</TabsTrigger>
          <TabsTrigger value="MONTH">Місяць</TabsTrigger>
          <TabsTrigger value="YEAR">Рік</TabsTrigger>
        </TabsList>

        

        <TabsContent value="DAY">
          <DayTab wallets={wallets} categories={categories} userSettings={userSettings} exchangeRates={exchangeRates}/>
        </TabsContent>
        <TabsContent value="WEEK">
          <WeekTab wallets={wallets} categories={categories} userSettings={userSettings} exchangeRates={exchangeRates}/>
        </TabsContent>
        <TabsContent value="MONTH">
          <MonthTab wallets={wallets} categories={categories} userSettings={userSettings} exchangeRates={exchangeRates}/>
        </TabsContent>
        <TabsContent value="YEAR">
          <YearTab wallets={wallets} categories={categories} userSettings={userSettings} exchangeRates={exchangeRates} pageNumber={pageNumber}/>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardTabs;
