
import DashboardAreaChart from "@/components/charts/DashboardAreaChart";
import React from "react";
import { auth } from "../../../auth";
import { getMonthlyExpenses, getMonthlyExpensesByCategory } from "@/actions/transactions";
import DashboardBarChart from "@/components/charts/BarChart";

const DashboardPage = async () => {

  const session = await auth();
  if (!session?.user.id) return;

  const data = await getMonthlyExpenses(session.user.id, 1, 2025);
  const dataBars = await getMonthlyExpensesByCategory(session.user.id, 1, 2025);
 
  return (
    <div>
      
      <div className="flex flex-col gap-4 w-full justify-top h-screen">
        <h2 className="text-xl font-bold text-center">Січень, 2025</h2>
        <DashboardAreaChart data={data} color={"f34c38"} />
        <DashboardBarChart data={dataBars} color={"f34c38"}/>
      </div>
    </div>
  );
};

export default DashboardPage;
