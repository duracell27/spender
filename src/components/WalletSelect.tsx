import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Wallet } from "@prisma/client";

const WalletSelect = async ({wallets}:{wallets: Wallet[]}) => {
  
  return (
    <div>
      <Select defaultValue={wallets[0].id}>
        <SelectTrigger className="w-[180px]"> 
          <SelectValue placeholder="Рахунок" />
        </SelectTrigger>
        <SelectContent>
            {wallets.map((wallet, index) => (
              <SelectItem key={index} value={wallet.id}>
                {wallet.name}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default WalletSelect;
