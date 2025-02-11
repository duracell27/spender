import { getInfoAdminDashboard } from "@/actions/user";
import React from "react";

const adminPanel = async () => {
  const info: getInfoAdminDashboard | null = await getInfoAdminDashboard();
  if (info===null) return;

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="flex gap-3 flex-wrap items-center justify-center">
        <div className="p-3 px-4 bg-blue-500 rounded-md">Всього користувачів: <span className="text-3xl text-white"> {info.totalUsers}</span></div>
        <div className="p-3 px-4 bg-blue-500 rounded-md">Користувачів за місяць: <span className="text-3xl text-white"> {info.usersThisMonth}</span></div>
        <div className="p-3 px-4 bg-blue-500 rounded-md">Всього транзакцій: <span className="text-3xl text-white"> {info.totalTransactions}</span></div>
        <div className="p-3 px-4 bg-blue-500 rounded-md">Транзакцій за місяць: <span className="text-3xl text-white"> {info.transactionsThisMonth}</span></div>
        {/* some widgets later */}
      </div>
    </div>
  );
};

export default adminPanel;
