"use client";
import React from "react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import Link from "next/link";
import { usePathname } from "next/navigation";

const AdminMenu = () => {
  const pathname = usePathname();
  return (
    <div className="flex w-full justify-center my-2">
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem
            className={`${
              pathname === "/adminPanel/currency"
                ? "bg-foreground text-background"
                : "bg-border text-foreground"
            } p-1 px-2 rounded-md`}
          >
            <Link href="/adminPanel/currency" legacyBehavior passHref>
              <NavigationMenuLink>Валюти</NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem className={`${
              pathname === "/adminPanel/something"
                ? "bg-foreground text-background"
                : "bg-border text-foreground"
            } p-1 px-2 rounded-md`}>
            <Link href="/adminPanel/something" legacyBehavior passHref>
              <NavigationMenuLink>Шось ше</NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
};

export default AdminMenu;
