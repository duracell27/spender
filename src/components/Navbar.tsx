import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import UserAvatar from "./UserAvatar";
import Link from "next/link";
import { SignOut } from "./signout-button";
import { auth } from "../../auth";

import { Button } from "./ui/button";

const Navbar = async () => {
  const session = await auth();
  if (!session?.user) return null;
  console.log("user in session", session?.user.role);
  return (
    <div className="flex justify-between items-center p-4">
      <div className="">
        <h1>
          <Link href={"/"} className="font-bold">
            Spender
          </Link>
        </h1>
      </div>
      <div className="">
        {!session?.user ? (
          <>
            <Link href={"/sign-in"}>
              <Button>Вхід</Button>
            </Link>
          </>
        ) : (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <UserAvatar />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {session.user.role === "ADMIN" && (
                  <DropdownMenuLabel>
                    <Link href="/adminPanel">Панель адміністратора</Link>
                  </DropdownMenuLabel>
                )}
                <DropdownMenuLabel>
                  <Link href="/dashboard">Дашборд</Link>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <SignOut />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
      </div>
    </div>
  );
};

export default Navbar;
