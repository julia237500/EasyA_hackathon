// components/on-chain-activity.tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const activities = [
  {
    txHash: "0x4a7b...3e2f",
    type: "Payment",
    amount: "$1,200.00",
    loanId: "L-1001",
    timestamp: "2023-06-15 10:30:45",
    chain: "XRPL",
    status: "confirmed",
  },
  {
    txHash: "0x8c2d...7f1a",
    type: "Payment",
    amount: "$350.00",
    loanId: "L-1003",
    timestamp: "2023-06-14 09:15:22",
    chain: "EVM Sidechain",
    status: "confirmed",
  },
  {
    txHash: "0x1f3e...9b2c",
    type: "Loan",
    amount: "$15,000.00",
    loanId: "L-1003",
    timestamp: "2023-01-10 14:45:18",
    chain: "XRPL",
    status: "confirmed",
  },
  {
    txHash: "0x5d7a...4c1e",
    type: "Payment",
    amount: "$750.00",
    loanId: "L-1002",
    timestamp: "2023-06-10 16:20:33",
    chain: "EVM Sidechain",
    status: "confirmed",
  },
];

export function OnChainActivity() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>On-Chain Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction Hash</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Loan ID</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Chain</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activities.map((activity) => (
                <TableRow key={activity.txHash}>
                  <TableCell className="font-mono text-sm">
                    {activity.txHash}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{activity.type}</Badge>
                  </TableCell>
                  <TableCell>{activity.amount}</TableCell>
                  <TableCell>{activity.loanId}</TableCell>
                  <TableCell>{activity.timestamp}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{activity.chain}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="default">{activity.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}