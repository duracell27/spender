"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const DashBoardMenu = () => {
  const pathname = usePathname();
  return (
    <div className="flex flex-col gap-4 px-4">
      <Link href="/dashboard">
        <div
          className={`${
            pathname === "/dashboard"
              ? "bg-muted-foreground text-background"
              : "bg-accent"
          } flex  gap-2 items-center p-2 rounded-md hover:bg-foreground hover:text-background`}
        >
          Головна
        </div>
      </Link>
      <Link href="/dashboard/categories">
        <div
          className={`${
            pathname === "/dashboard/categories"
              ? "bg-muted-foreground text-background"
              : "bg-accent"
          } flex  gap-2 items-center p-2 rounded-md hover:bg-foreground hover:text-background`}
        >
          Категорії
        </div>
      </Link>
      <Link href="/dashboard/walets">
        <div
          className={`${
            pathname === "/dashboard/walets"
              ? "bg-muted-foreground text-background"
              : "bg-accent"
          } flex  gap-2 items-center p-2 rounded-md hover:bg-foreground hover:text-background`}
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
          } flex  gap-2 items-center p-2 rounded-md hover:bg-foreground hover:text-background`}
        >
          Валюти
        </div>
      </Link>
    </div>
  );
};

export default DashBoardMenu;
