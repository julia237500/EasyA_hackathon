// components/create-loan-form.tsx
"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function CreateLoanForm() {
  const [formData, setFormData] = useState({
    source: "",
    destination: "",
    amount: "",
    description: "",
    interest: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const loanData = {
      ...formData,
      date: new Date().toISOString(), // Auto-generate timestamp
    };

    console.log("Submitting loan:", loanData);
    // TODO: Replace with actual API call or transaction logic
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a New Loan</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Source (Lender Wallet)</label>
            <input
              type="text"
              name="source"
              value={formData.source}
              onChange={handleChange}
              required
              placeholder="rLenderAddress..."
              className="mt-1 w-full border p-2 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Destination (Borrower Wallet)</label>
            <input
              type="text"
              name="destination"
              value={formData.destination}
              onChange={handleChange}
              required
              placeholder="rBorrowerAddress..."
              className="mt-1 w-full border p-2 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Amount (XRP)</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              required
              className="mt-1 w-full border p-2 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Interest Rate (%)</label>
            <input
              type="number"
              name="interest"
              value={formData.interest}
              onChange={handleChange}
              required
              step="0.01"
              className="mt-1 w-full border p-2 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              className="mt-1 w-full border p-2 rounded-md"
              rows={3}
              placeholder="Describe the purpose of the loan..."
            />
          </div>
          <Button type="submit">Submit Loan</Button>
        </form>
      </CardContent>
    </Card>
  );
}
