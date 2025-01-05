"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const DashBoardMenu = () => {
  const pathname = usePathname();
  return (
    <div className="flex sm:flex-col flex-row  gap-2 px-4 flex-wrap text-xs sm:text-sm">
      <Link href="/dashboard">
        <div
          className={`${
            pathname === "/dashboard"
              ? "bg-muted-foreground text-background"
              : "bg-accent"
          } flex  gap-2 items-center p-1 rounded-md hover:bg-foreground hover:text-background`}
        >
          Головна
        </div>
      </Link>
      <Link href="/dashboard/transactions">
        <div
          className={`${
            pathname === "/dashboard/transactions"
              ? "bg-muted-foreground text-background"
              : "bg-accent"
          } flex  gap-2 items-center p-1 rounded-md hover:bg-foreground hover:text-background`}
        >
          Транзакції
        </div>
      </Link>
      <Link href="/dashboard/categories">
        <div
          className={`${
            pathname === "/dashboard/categories"
              ? "bg-muted-foreground text-background"
              : "bg-accent"
          } flex  gap-2 items-center p-1 rounded-md hover:bg-foreground hover:text-background`}
        >
          Категорії
        </div>
      </Link>
      <Link href="/dashboard/wallets">
        <div
          className={`${
            pathname === "/dashboard/wallets"
              ? "bg-muted-foreground text-background"
              : "bg-accent"
          } flex  gap-2 items-center p-1 rounded-md hover:bg-foreground hover:text-background`}
        >
          Рахунки
        </div>
      </Link>
      <Link href="/dashboard/currencies">
        <div
          className={`${
            pathname === "/dashboard/currencies"
              ? "bg-muted-foreground text-background"
              : "bg-accent"
          } flex  gap-2 items-center p-1 rounded-md hover:bg-foreground hover:text-background`}
        >
          Валюти
        </div>
      </Link>
    </div>
  );
};

export default DashBoardMenu;
