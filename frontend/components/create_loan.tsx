"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"

import * as xrpl from "xrpl"

interface LoanToken {
  loanId: string
  amount: string
  currency: string
  date: string
  impact: string
  bankId: string
  tokenUrl: string
  metadata?: string
  txResult?: string
  nftId?: string
  repayments?: Repayment[]
  deadline?: string
}

interface Repayment {
  amount: string
  date: string
  remainingBalance: string
  nftId?: string
  txResult?: string
  metadata?: string
}

interface DashboardStats {
  totalLoans: number
  totalAmount: number
  repaymentsCompleted: number
  repaymentRate: number
  activeLoans: number
  completedLoans: number
  recentActivity: Activity[]
  repaymentTrends: { month: string; repayments: number; amount: number }[]
  loanDistribution: { bank: string; amount: number; count: number }[]
}

interface Activity {
  type: 'loan' | 'repayment'
  id: string
  amount: string
  currency: string
  date: string
  loanId?: string
}

interface ZKProofResult {
  proof: string
  publicInputs: string[]
  verificationResult: boolean
  loanId: string
  timestamp: string
}

export default function CreateLoanNFT() {
  const [result, setResult] = useState("")
  const [loanTokens, setLoanTokens] = useState<LoanToken[]>([])
  const [standbyWallet, setStandbyWallet] = useState<xrpl.Wallet | null>(null)
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalLoans: 0,
    totalAmount: 0,
    repaymentsCompleted: 0,
    repaymentRate: 0,
    activeLoans: 0,
    completedLoans: 0,
    recentActivity: [],
    repaymentTrends: [],
    loanDistribution: []
  })
  const [simulationDate, setSimulationDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [zkProofResults, setZkProofResults] = useState<ZKProofResult[]>([])
  const [zkLoanId, setZkLoanId] = useState<string>("")
  const [zkVerificationMessage, setZkVerificationMessage] = useState<string>("")

  const getNet = () => "wss://s.altnet.rippletest.net:51233"

  // Sample loan data with deadlines
  const sampleLoans: LoanToken[] = [
    {
      loanId: "LN-2025-001",
      amount: "50000",
      currency: "USD",
      date: "2025-05-15",
      impact: "15",
      bankId: "BANK-001",
      tokenUrl: "https://example.com/loans/LN-2023-001",
      repayments: [],
      deadline: "2025-05-15"
    },
    {
      loanId: "LN-2026-002",
      amount: "75000",
      currency: "EUR",
      date: "2026-06-20",
      impact: "20",
      bankId: "BANK-002",
      tokenUrl: "https://example.com/loans/LN-2023-002",
      repayments: [],
      deadline: "2026-06-20"
    },
    {
      loanId: "LN-2025-003",
      amount: "100000",
      currency: "GBP",
      date: "2025-06-08",
      impact: "25",
      bankId: "BANK-003",
      tokenUrl: "https://example.com/loans/LN-2023-003",
      repayments: [],
      deadline: "2025-06-08"
    }
  ]

  // Update dashboard stats whenever loans change
  useEffect(() => {
    const totalLoans = loanTokens.length
    const totalAmount = loanTokens.reduce((sum, loan) => sum + parseFloat(loan.amount), 0)
    const repaymentsCompleted = loanTokens.reduce((sum, loan) => sum + (loan.repayments?.length || 0), 0)
    
    const activeLoans = loanTokens.filter(loan => 
      parseFloat(loan.amount) > 0).length
    const completedLoans = totalLoans - activeLoans
    
    const repaymentRate = totalLoans > 0 ? 
      Math.round((repaymentsCompleted / (totalLoans * 12)) * 100) : 0
    
    const recentActivity: Activity[] = []
    
    loanTokens.forEach(loan => {
      recentActivity.push({
        type: 'loan',
        id: loan.loanId,
        amount: loan.amount,
        currency: loan.currency,
        date: loan.date
      })
      
      loan.repayments?.forEach(repayment => {
        recentActivity.push({
          type: 'repayment',
          id: repayment.nftId || '',
          amount: repayment.amount,
          currency: loan.currency,
          date: repayment.date,
          loanId: loan.loanId
        })
      })
    })
    
    recentActivity.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    
    const repaymentTrends = generateRepaymentTrends(loanTokens)
    const loanDistribution = generateLoanDistribution(loanTokens)
    
    setDashboardStats({
      totalLoans,
      totalAmount,
      repaymentsCompleted,
      repaymentRate,
      activeLoans,
      completedLoans,
      recentActivity: recentActivity.slice(0, 5),
      repaymentTrends,
      loanDistribution
    })
  }, [loanTokens])

  const generateRepaymentTrends = (loans: LoanToken[]) => {
    const trends: { [key: string]: { repayments: number; amount: number } } = {}
    
    loans.forEach(loan => {
      loan.repayments?.forEach(repayment => {
        const date = new Date(repayment.date)
        const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`
        
        if (!trends[monthYear]) {
          trends[monthYear] = { repayments: 0, amount: 0 }
        }
        
        trends[monthYear].repayments += 1
        trends[monthYear].amount += parseFloat(repayment.amount)
      })
    })
    
    return Object.entries(trends)
      .map(([month, data]) => ({
        month,
        repayments: data.repayments,
        amount: data.amount
      }))
      .sort((a, b) => a.month.localeCompare(b.month))
  }

  const generateLoanDistribution = (loans: LoanToken[]) => {
    const distribution: { [key: string]: { amount: number; count: number } } = {}
    
    loans.forEach(loan => {
      if (!distribution[loan.bankId]) {
        distribution[loan.bankId] = { amount: 0, count: 0 }
      }
      
      distribution[loan.bankId].amount += parseFloat(loan.amount)
      distribution[loan.bankId].count += 1
    })
    
    return Object.entries(distribution)
      .map(([bank, data]) => ({
        bank,
        amount: data.amount,
        count: data.count
      }))
  }

  const runDeadlineSimulation = () => {
  const simDate = new Date(simulationDate);
  const updatedLoans = loanTokens.map(loan => {
    if (!loan.deadline) return loan;
    
    const deadlineDate = new Date(loan.deadline);
    const daysRemaining = Math.ceil((deadlineDate.getTime() - simDate.getTime()) / (1000 * 60 * 60 * 24));
    const isOverdue = daysRemaining < 0 && parseFloat(loan.amount) > 0;
    const isActive = parseFloat(loan.amount) > 0;
    
    const loanMetadata = loan.metadata ? JSON.parse(loan.metadata) : {};
    
    return {
      ...loan,
      metadata: JSON.stringify({
        ...loanMetadata,
        status: !isActive ? 'COMPLETED' : isOverdue ? 'OVERDUE' : 'ACTIVE',
        daysRemaining: isActive ? daysRemaining : 0,
        originalDeadline: loan.deadline,
        simulatedDate: simulationDate
      }, null, 2)
    };
  });

  setLoanTokens(updatedLoans);
  setResult(`Deadline simulation run for date: ${simulationDate}. ${updatedLoans.filter(l => JSON.parse(l.metadata || '{}').status === 'OVERDUE').length} loans marked as overdue.`);
};

  // Simulate ZK proof generation
  const generateZKProof = (loanId: string) => {
    if (!loanTokens.some(loan => loan.loanId === loanId)) {
      setZkVerificationMessage("Loan ID not found")
      return
    }

    // Simulate proof generation (in a real app, this would use a zk-SNARKs library)
    const proof = {
      a: ["0x" + Math.random().toString(16).substr(2, 16), "0x" + Math.random().toString(16).substr(2, 16)],
      b: [["0x" + Math.random().toString(16).substr(2, 16), "0x" + Math.random().toString(16).substr(2, 16)]], 
      c: ["0x" + Math.random().toString(16).substr(2, 16), "0x" + Math.random().toString(16).substr(2, 16)]
    }

    const publicInputs = [
      "0x" + Math.random().toString(16).substr(2, 16),
      "0x" + Math.random().toString(16).substr(2, 16)
    ]

    // Always verify successfully in this simulation
    const verificationResult = true

    const newProofResult: ZKProofResult = {
      proof: JSON.stringify(proof, null, 2),
      publicInputs,
      verificationResult,
      loanId,
      timestamp: new Date().toISOString()
    }

    setZkProofResults(prev => [newProofResult, ...prev])
    setZkVerificationMessage(`ZK proof generated for loan ${loanId} and verified successfully!`)
  }

  // Simulate ZK proof verification
  const verifyZKProof = (proof: ZKProofResult) => {
    // In this simulation, we just return the stored verification result
    setZkVerificationMessage(
      proof.verificationResult 
        ? `Proof for loan ${proof.loanId} verified successfully!`
        : `Proof for loan ${proof.loanId} verification failed!`
    )
  }

  const generateWallet = async () => {
    try {
      const client = new xrpl.Client(getNet())
      await client.connect()
      
      const wallet = await client.fundWallet()
      setStandbyWallet(wallet.wallet)
      
      setResult(`Generated new test wallet:\nAddress: ${wallet.wallet.address}\nSeed: ${wallet.wallet.seed}`)
      
      client.disconnect()
    } catch (err: any) {
      setResult("Error generating wallet: " + err.message)
    }
  }

  const createTokens = async () => {
    if (!standbyWallet) {
      setResult("Please generate a wallet first")
      return
    }

    try {
      const client = new xrpl.Client(getNet())

      let output = "Connecting to XRPL Testnet..."
      setResult(output)

      await client.connect()
      output += "\nConnected. Creating NFTs..."
      setResult(output)

      const createdTokens: LoanToken[] = []

      for (const loan of sampleLoans) {
        try {
          const metadata = {
            loanId: loan.loanId,
            amount: loan.amount,
            currency: loan.currency,
            date: new Date(loan.date).toISOString(),
            creditScoreImpact: loan.impact,
            bankId: loan.bankId,
            tokenUrlField: loan.tokenUrl,
            repayments: [],
            deadline: loan.deadline,
            status: 'ACTIVE'
          }

          const uri = xrpl.convertStringToHex(JSON.stringify(metadata))

          output += `\n\nMinting NFT for loan ${loan.loanId}...`
          setResult(output)

          const tx = await client.submitAndWait(
            {
              TransactionType: "NFTokenMint",
              Account: standbyWallet.address,
              URI: uri,
              Flags: 8,
              NFTokenTaxon: 0,
            },
            { wallet: standbyWallet }
          )

          const txResult = (tx.result.meta as xrpl.TransactionMetadata).TransactionResult
          const nftId = (tx.result as any).NFTokenID
          
          createdTokens.push({
            ...loan,
            metadata: JSON.stringify(metadata, null, 2),
            txResult: txResult,
            nftId: nftId,
            repayments: []
          })

          output += `\nSuccess! TX result: ${txResult}\nNFT ID: ${nftId}`
          setResult(output)
        } catch (err: any) {
          output += `\nError creating NFT for loan ${loan.loanId}: ${err.message}`
          setResult(output)
        }
      }

      setLoanTokens(createdTokens)
      output += "\n\nAll NFT minting operations completed."
      setResult(output)

      client.disconnect()
    } catch (err: any) {
      setResult("Error: " + err.message)
    }
  }

  const createRepayment = async (loanId: string) => {
    if (!standbyWallet) {
      setResult("Please generate a wallet first")
      return
    }

    const loan = loanTokens.find(loan => loan.loanId === loanId)
    if (!loan) {
      setResult("Loan not found")
      return
    }

    try {
      const client = new xrpl.Client(getNet())
      await client.connect()

      const repaymentAmount = (parseInt(loan.amount) * 0.1).toFixed(2)
      const remainingBalance = (parseInt(loan.amount) * 0.9).toFixed(2)
      const repaymentDate = new Date().toISOString()

      const metadata = {
        loanId: loan.loanId,
        repaymentAmount: repaymentAmount,
        currency: loan.currency,
        repaymentDate: repaymentDate,
        remainingBalance: remainingBalance,
        parentNFT: loan.nftId
      }

      const uri = xrpl.convertStringToHex(JSON.stringify(metadata))

      let output = `Creating repayment for loan ${loan.loanId}...`
      setResult(output)

      const tx = await client.submitAndWait(
        {
          TransactionType: "NFTokenMint",
          Account: standbyWallet.address,
          URI: uri,
          Flags: 8,
          NFTokenTaxon: 0,
        },
        { wallet: standbyWallet }
      )

      const txResult = (tx.result.meta as xrpl.TransactionMetadata).TransactionResult
      const nftId = (tx.result as any).NFTokenID

      const updatedLoans = loanTokens.map(l => {
        if (l.loanId === loanId) {
          const repayment: Repayment = {
            amount: repaymentAmount,
            date: repaymentDate,
            remainingBalance: remainingBalance,
            nftId: nftId,
            txResult: txResult,
            metadata: JSON.stringify(metadata, null, 2)
          }
          return {
            ...l,
            repayments: [...(l.repayments || []), repayment],
            amount: remainingBalance
          }
        }
        return l
      })

      setLoanTokens(updatedLoans)
      output += `\nRepayment created successfully!\nNFT ID: ${nftId}\nAmount: ${repaymentAmount} ${loan.currency}\nRemaining: ${remainingBalance}`
      setResult(output)

      client.disconnect()
    } catch (err: any) {
      setResult("Error creating repayment: " + err.message)
    }
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">U-PayMan Testbench</h3>
      <p className="text-muted-foreground">
        This testbench allows you to simulate the credit information creation & storage on the blockchain.
        You can generate a test wallet, create sample loans, and simulate ZK proofs and deadlines.
        Note: In actual application, loan information and payment history would be retrieved directly from Finverse to create Payment MPTokens
      </p>

      <div className="flex gap-2">
        <Button onClick={generateWallet}>Generate Test Wallet</Button>
        <Button onClick={createTokens} disabled={!standbyWallet}>
          Create Sample Loans
        </Button>
      </div>

      {result && (
        <div className="whitespace-pre-wrap bg-muted p-4 rounded border text-sm mt-4">
          {result}
        </div>
      )}

      {standbyWallet && (
        <div className="mt-4 p-4 bg-muted rounded border">
          <h4 className="font-medium">Current Wallet</h4>
          <p className="text-sm break-all">Address: {standbyWallet.address}</p>
          <p className="text-sm break-all">Seed: {standbyWallet.seed}</p>
        </div>
      )}

      {/* ZK Proof Section */}
      <Card>
        <CardHeader>
          <CardTitle>Zero-Knowledge Proof Simulation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-[300px] justify-start">
                  {zkLoanId ? (
                    loanTokens.find((loan) => loan.loanId === zkLoanId)?.loanId + 
                    " - " + 
                    loanTokens.find((loan) => loan.loanId === zkLoanId)?.amount + 
                    " " + 
                    loanTokens.find((loan) => loan.loanId === zkLoanId)?.currency
                  ) : (
                    "Select a Loan"
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[300px]">
                <DropdownMenuLabel>Available Loans</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {loanTokens.map((loan) => (
                  <DropdownMenuItem 
                    key={loan.loanId} 
                    onClick={() => setZkLoanId(loan.loanId)}
                  >
                    {loan.loanId} - {loan.amount} {loan.currency}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button 
              onClick={() => generateZKProof(zkLoanId)}
              disabled={!zkLoanId}
            >
              Generate Proof
            </Button>
          </div>
          {zkVerificationMessage && (
            <div className={`p-3 rounded ${
              zkVerificationMessage.includes("failed") 
                ? "bg-red-100 text-red-800" 
                : "bg-green-100 text-green-800"
            }`}>
              {zkVerificationMessage}
            </div>
          )}
          <div className="mt-4">
            <h4 className="font-medium mb-2">Generated Proofs</h4>
            <div className="space-y-2">
              {zkProofResults.length > 0 ? (
                zkProofResults.map((proof, index) => (
                  <div key={index} className="p-3 border rounded">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Loan: {proof.loanId}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(proof.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => verifyZKProof(proof)}
                      >
                        Verify Proof
                      </Button>
                    </div>
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm text-muted-foreground">
                        View Proof Details
                      </summary>
                      <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-auto">
                        {proof.proof}
                      </pre>
                    </details>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">No proofs generated yet</p>
              )}
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            This simulates generating and verifying zk-SNARK proofs for loan data privacy.
            In a real implementation, this would use a library like SnarkJS.
          </p>
        </CardContent>
      </Card>
      {/* Deadline Simulation */}
      <Card>
        <CardHeader>
          <CardTitle>Deadline Simulation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <input
              type="date"
              value={simulationDate}
              onChange={(e) => setSimulationDate(e.target.value)}
              className="p-2 border rounded"
            />
            <Button onClick={runDeadlineSimulation}>Run Simulation</Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Simulate future dates to check loan deadlines and overdue statuses.
          </p>
        </CardContent>
      </Card>

      {/* Real-time Dashboard */}
      {loanTokens.length > 0 && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <CardTitle>Total Loans</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardStats.totalLoans}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Total Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardStats.totalAmount.toLocaleString()} {loanTokens[0]?.currency || ''}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Repayment Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardStats.repaymentRate}%</div>
                <Progress value={dashboardStats.repaymentRate} className="h-2 mt-2" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Active Loans</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardStats.activeLoans} / {dashboardStats.totalLoans}
                </div>
                <Progress 
                  value={(dashboardStats.activeLoans / dashboardStats.totalLoans) * 100} 
                  className="h-2 mt-2" 
                />
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Repayment Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={dashboardStats.repaymentTrends}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="amount"
                        stroke="#8884d8"
                        activeDot={{ r: 8 }}
                        name="Amount Repaid"
                      />
                      <Line
                        type="monotone"
                        dataKey="repayments"
                        stroke="#82ca9d"
                        name="Repayment Count"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Loan Distribution by Bank</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={dashboardStats.loanDistribution}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="bank" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="amount"
                        fill="#8884d8"
                        name="Total Amount"
                      />
                      <Bar
                        dataKey="count"
                        fill="#82ca9d"
                        name="Loan Count"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Recent Activity */}
      {dashboardStats.recentActivity.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {dashboardStats.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${activity.type === 'loan' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                      {activity.type === 'loan' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className="font-medium">
                        {activity.type === 'loan' ? 'New Loan' : 'Repayment'}
                        {activity.loanId && (
                          <span className="text-muted-foreground text-xs ml-2">(Loan {activity.loanId})</span>
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(activity.date).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="font-medium">
                    {activity.amount} {activity.currency}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loan Portfolio */}
      {loanTokens.length > 0 && (
        <div className="mt-6">
          <h4 className="text-lg font-medium mb-3">Loan Portfolio</h4>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {loanTokens.map((token, index) => {
              const metadata = token.metadata ? JSON.parse(token.metadata) : {}
              const daysRemaining = metadata.daysRemaining
              const isOverdue = metadata.status === 'OVERDUE'
              
              return (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex justify-between items-start">
                      <span>Loan ID: {token.loanId}</span>
                      {token.deadline && (
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          isOverdue 
                            ? 'bg-red-100 text-red-800' 
                            : daysRemaining <= 30 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-green-100 text-green-800'
                        }`}>
                          {isOverdue 
                            ? 'OVERDUE' 
                            : `${daysRemaining} days left`}
                        </span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm space-y-2">
                      <p><span className="text-muted-foreground">Amount:</span> {token.amount} {token.currency}</p>
                      <p><span className="text-muted-foreground">Date:</span> {token.date}</p>
                      <p><span className="text-muted-foreground">Bank:</span> {token.bankId}</p>
                      <p><span className="text-muted-foreground">Impact:</span> {token.impact} pts</p>
                      {token.deadline && (
                        <p><span className="text-muted-foreground">Deadline:</span> {new Date(token.deadline).toLocaleDateString()}</p>
                      )}
                      <p><span className="text-muted-foreground">Status:</span> {token.txResult || "Pending"}</p>
                      <div className="mt-3">
                        <Button 
                          size="sm" 
                          onClick={() => createRepayment(token.loanId)}
                          disabled={!standbyWallet || parseFloat(token.amount) <= 0}
                        >
                          Record Monthly Repayment
                        </Button>
                      </div>
                    </div>
                    
                    {token.repayments && token.repayments.length > 0 && (
                      <div className="mt-4">
                        <h6 className="text-sm font-medium mb-2">Repayment History</h6>
                        <div className="space-y-2">
                          {token.repayments.map((repayment, idx) => (
                            <div key={idx} className="p-2 bg-muted rounded text-xs">
                              <p><span className="text-muted-foreground">Date:</span> {new Date(repayment.date).toLocaleDateString()}</p>
                              <p><span className="text-muted-foreground">Amount:</span> {repayment.amount} {token.currency}</p>
                              <p><span className="text-muted-foreground">Remaining:</span> {repayment.remainingBalance}</p>
                              {repayment.metadata && (
                                <details className="mt-1">
                                  <summary className="cursor-pointer text-muted-foreground">Details</summary>
                                  <pre className="mt-1 p-1 bg-background rounded overflow-auto">{repayment.metadata}</pre>
                                </details>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {token.metadata && (
                      <details className="mt-3 text-xs">
                        <summary className="cursor-pointer text-muted-foreground">Loan Metadata</summary>
                        <pre className="mt-1 p-2 bg-muted rounded overflow-auto">{token.metadata}</pre>
                      </details>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}