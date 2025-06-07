// components/loan-summary.tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";

interface Loan {
  id: string;
  type: string;
  bank: string;
  amount: string;
  remaining: string;
  interest: string;
  nextPayment: string;
  status: "active" | "paid";
}

const loans: Loan[] = [
  {
    id: "L-1001",
    type: "Mortgage",
    bank: "Chase",
    amount: "$250,000",
    remaining: "$195,500",
    interest: "3.75%",
    nextPayment: "2023-07-01",
    status: "active",
  },
  {
    id: "L-1002",
    type: "Auto Loan",
    bank: "Wells Fargo",
    amount: "$35,000",
    remaining: "$12,750",
    interest: "4.25%",
    nextPayment: "2023-07-15",
    status: "active",
  },
  {
    id: "L-1003",
    type: "Personal Loan",
    bank: "Citi",
    amount: "$15,000",
    remaining: "$3,200",
    interest: "7.50%",
    nextPayment: "2023-06-25",
    status: "active",
  },
  {
    id: "L-1004",
    type: "Student Loan",
    bank: "Sallie Mae",
    amount: "$42,000",
    remaining: "$0",
    interest: "5.25%",
    nextPayment: "N/A",
    status: "paid",
  },
];

// Helper function to parse currency strings to numbers
const parseCurrency = (value: string): number => {
  return parseFloat(value.replace(/[^0-9.-]+/g, ''));
};

export function LoanSummary() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Your Loans</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Loan ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Bank</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Remaining</TableHead>
                <TableHead>Interest</TableHead>
                <TableHead>Next Payment</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loans.map((loan) => {
                const amount = parseCurrency(loan.amount);
                const remaining = parseCurrency(loan.remaining);
                const progressValue = amount > 0 ? ((amount - remaining) / amount) * 100 : 0;

                return (
                  <TableRow key={loan.id}>
                    <TableCell className="font-medium">{loan.id}</TableCell>
                    <TableCell>{loan.type}</TableCell>
                    <TableCell>{loan.bank}</TableCell>
                    <TableCell>{loan.amount}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {loan.remaining}
                        {loan.status === "active" && (
                          <Progress 
                            value={progressValue} 
                            className="h-2 w-20"
                          />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{loan.interest}</TableCell>
                    <TableCell>{loan.nextPayment}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        loan.status === "active" 
                          ? "bg-green-100 text-green-800" 
                          : "bg-purple-100 text-purple-800"
                      }`}>
                        {loan.status}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}