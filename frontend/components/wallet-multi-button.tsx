// components/wallet-multi-button.tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Wallet } from "lucide-react";

export function WalletMultiButton() {
  // In a real app, you would connect this to your wallet connection logic
  const connected = true;
  const address = "0x7f...3e2f";

  if (connected) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            <Wallet className="h-4 w-4 mr-2" />
            {address}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>View on Explorer</DropdownMenuItem>
          <DropdownMenuItem>Copy Address</DropdownMenuItem>
          <DropdownMenuItem className="text-red-600">Disconnect</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button>
      <Wallet className="h-4 w-4 mr-2" />
      Connect Wallet
    </Button>
  );
}