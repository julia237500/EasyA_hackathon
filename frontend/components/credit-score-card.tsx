// components/credit-score-card.tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function CreditScoreCard() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Credit Score</CardTitle>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          className="h-4 w-4 text-muted-foreground"
        >
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">742</div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-muted-foreground">Good</span>
          <span className="text-xs text-muted-foreground">800</span>
        </div>
        <Progress value={92.75} className="h-2 mt-1" />
        <p className="text-xs text-muted-foreground mt-2">+15 points from last month</p>
      </CardContent>
    </Card>
  );
}