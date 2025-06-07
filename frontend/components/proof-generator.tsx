// components/proof-generator.tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export function ProofGenerator() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Generate ZK Proof</CardTitle>
          <CardDescription>
            Create a zero-knowledge proof of your creditworthiness without revealing sensitive data.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="proof-type">Proof Type</Label>
            <Select>
              <SelectTrigger id="proof-type">
                <SelectValue placeholder="Select proof type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="payment-history">On-Time Payment History</SelectItem>
                <SelectItem value="credit-utilization">Credit Utilization</SelectItem>
                <SelectItem value="loan-balance">Total Loan Balance</SelectItem>
                <SelectItem value="credit-score">Credit Score Range</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="time-period">Time Period</Label>
            <Select>
              <SelectTrigger id="time-period">
                <SelectValue placeholder="Select time period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">Last 30 Days</SelectItem>
                <SelectItem value="90">Last 90 Days</SelectItem>
                <SelectItem value="365">Last 12 Months</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="recipient">Recient Wallet (optional)</Label>
            <Input id="recipient" placeholder="0x..." />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline">Cancel</Button>
          <Button>Generate Proof</Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Your Generated Proofs</CardTitle>
          <CardDescription>
            Previously generated proofs that you can share with verifiers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">On-Time Payments (12 Months)</h4>
                  <p className="text-sm text-muted-foreground">Generated: 2023-06-10</p>
                </div>
                <Badge variant="secondary">XRPL</Badge>
              </div>
              <div className="mt-3 flex gap-2">
                <Button variant="outline" size="sm">View</Button>
                <Button variant="outline" size="sm">Share</Button>
                <Button variant="outline" size="sm">Verify</Button>
              </div>
            </div>
            
            <div className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">Credit Score Range</h4>
                  <p className="text-sm text-muted-foreground">Generated: 2023-05-15</p>
                </div>
                <Badge variant="secondary">EVM</Badge>
              </div>
              <div className="mt-3 flex gap-2">
                <Button variant="outline" size="sm">View</Button>
                <Button variant="outline" size="sm">Share</Button>
                <Button variant="outline" size="sm">Verify</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}