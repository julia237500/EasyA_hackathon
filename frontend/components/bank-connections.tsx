// components/bank-connections.tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Banknote, Plus } from "lucide-react";

const banks = [
  {
    id: "bank-1",
    name: "Chase",
    logo: "/chase-logo.png",
    accounts: 2,
    status: "connected",
    lastSynced: "2023-06-15 10:30 AM",
  },
  {
    id: "bank-2",
    name: "Bank of America",
    logo: "/boa-logo.png",
    accounts: 1,
    status: "connected",
    lastSynced: "2023-06-14 09:15 AM",
  },
  {
    id: "bank-3",
    name: "Wells Fargo",
    logo: "/wells-logo.png",
    accounts: 1,
    status: "connected",
    lastSynced: "2023-06-14 02:45 PM",
  },
  {
    id: "bank-4",
    name: "Citi",
    logo: "/citi-logo.png",
    accounts: 0,
    status: "disconnected",
    lastSynced: "2023-05-20 11:20 AM",
  },
];

export function BankConnections() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Finverse Authentications</CardTitle>
          <Button size="sm" className="h-8 gap-1">
            <Plus className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Connect Bank
            </span>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <p>[PROTOTYPE] The following page shows how connections can be made to a Finverse API. 
            Clicking on "Connect Bank" in the actual application will trigger an OAuth with Finverse to authenticate connection to individual bank accounts. </p>
            {banks.map((bank) => (
              <Card key={bank.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Banknote className="h-4 w-4 text-muted-foreground" />
                    {bank.name}
                  </CardTitle>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    bank.status === "connected" 
                      ? "bg-green-100 text-green-800" 
                      : "bg-yellow-100 text-yellow-800"
                  }`}>
                    {bank.status}
                  </span>
                </CardHeader>
                <CardContent>
                  <div className="text-sm">
                    <p>Accounts: {bank.accounts}</p>
                    <p className="text-muted-foreground">
                      Last synced: {bank.lastSynced}
                    </p>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" size="sm">
                      Refresh
                    </Button>
                    {bank.status === "connected" ? (
                      <Button variant="destructive" size="sm">
                        Disconnect
                      </Button>
                    ) : (
                      <Button size="sm">Reconnect</Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
