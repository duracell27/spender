import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DayTab from "./DayTab";
import WeekTab from "./WeekTab";
import MonthTab from "./MonthTab";
import YearTab from "./YearTab";
import { Category, UserSettings, Wallet } from "@prisma/client";

const DashboardTabs = ({wallets, categories, userSettings}: {wallets: Wallet[], categories: Category[], userSettings: UserSettings}) => {
  return (
    <div>
      <Tabs defaultValue="month" className="w-[400px]">
        <TabsList >
          <TabsTrigger value="day">День</TabsTrigger>
          <TabsTrigger value="week">Тиждень</TabsTrigger>
          <TabsTrigger value="month">Місяць</TabsTrigger>
          <TabsTrigger value="year">Рік</TabsTrigger>
        </TabsList>
        <TabsContent value="day">
          <DayTab wallets={wallets} categories={categories} userSettings={userSettings}/>
        </TabsContent>
        <TabsContent value="week">
          <WeekTab wallets={wallets} categories={categories} userSettings={userSettings}/>
        </TabsContent>
        <TabsContent value="month">
          <MonthTab wallets={wallets} categories={categories} userSettings={userSettings}/>
        </TabsContent>
        <TabsContent value="year">
          <YearTab wallets={wallets} categories={categories} userSettings={userSettings}/>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardTabs;
