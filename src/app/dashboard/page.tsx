import DashboardAreaChart from "@/components/charts/DashboardAreaChart";
import React from "react";
import { auth } from "../../../auth";
import { getMonthlyExpenses, getMonthlyExpensesByCategory, getMonthlyInfoData } from "@/actions/transactions";
import DashboardBarChart from "@/components/charts/BarChart";
import { prisma } from "../../../prisma/prisma";
import DashboardChartBlocks from "@/components/DashboardChartBlocks";
import { format } from "date-fns";
import { uk } from "date-fns/locale";

const DashboardPage = async () => {
  const today = new Date();
  // Вивести назву місяця
  const monthName = format(today, "LLLL", { locale: uk }); // "Січень"
  // Вивести номер місяця
  const monthNumber = parseInt(format(today, "M"), 10); // "1"
  // Вивести поточний рік
  const year = parseInt(format(today, "yyyy"), 10); // "2025"

  const session = await auth();
  if (!session?.user.id) return;

  const userSettings = await prisma.userSettings.findUnique({
    where: {
      userId: session.user.id,
    },
    include: {
      defaultCurrency: true,
    },
  });
  if (!userSettings?.id) return null;

  const data = await getMonthlyExpenses(session.user.id, monthNumber, year, userSettings.defaultCurrencyId);
  const dataBars = await getMonthlyExpensesByCategory(session.user.id, monthNumber, year, userSettings.defaultCurrencyId);
  const dataInfo = await getMonthlyInfoData(session.user.id, monthNumber, year);

  return (
    <div>
      <div className="flex flex-col gap-4 w-full justify-top h-screen">
        <h2 className="text-xl font-bold text-center">{monthName}, {year}</h2>
        <DashboardAreaChart data={data} color={"f34c38"} userSettings={userSettings} />
        {dataBars.length > 0 ? (
          <DashboardBarChart data={dataBars} color={"f34c38"} userSettings={userSettings} />
        ) : (
          <div className="my-5 text-center">
            Тут буде графік витрат по категоріях, як тільки вони у вас з`являться
          </div>
        )}
        <DashboardChartBlocks data={dataInfo} userSettings={userSettings} />
      </div>
    </div>
  );
};

export default DashboardPage;
