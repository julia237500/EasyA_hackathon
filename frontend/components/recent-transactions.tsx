// components/recent-transactions.tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const transactions = [
  {
    id: "TXN-001",
    amount: "$1,200.00",
    bank: "Chase",
    date: "2023-06-15",
    status: "completed",
    type: "Loan Payment",
  },
  {
    id: "TXN-002",
    amount: "$350.00",
    bank: "Bank of America",
    date: "2023-06-14",
    status: "completed",
    type: "Credit Card",
  },
  {
    id: "TXN-003",
    amount: "$750.00",
    bank: "Wells Fargo",
    date: "2023-06-10",
    status: "completed",
    type: "Auto Loan",
  },
  {
    id: "TXN-004",
    amount: "$1,850.00",
    bank: "Chase",
    date: "2023-06-05",
    status: "completed",
    type: "Mortgage",
  },
  {
    id: "TXN-005",
    amount: "$120.00",
    bank: "Citi",
    date: "2023-06-01",
    status: "completed",
    type: "Personal Loan",
  },
];

export function RecentTransactions() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Transaction</TableHead>
          <TableHead>Bank</TableHead>
          <TableHead>Type</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((transaction) => (
          <TableRow key={transaction.id}>
            <TableCell>
              <div className="font-medium">{transaction.id}</div>
              <div className="hidden text-sm text-muted-foreground md:inline">
                {transaction.date}
              </div>
            </TableCell>
            <TableCell>{transaction.bank}</TableCell>
            <TableCell>
              <Badge variant="outline">{transaction.type}</Badge>
            </TableCell>
            <TableCell className="text-right">{transaction.amount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}