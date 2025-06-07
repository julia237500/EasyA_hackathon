// app/page.tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Overview } from "@/components/overview";
import { RecentTransactions } from "@/components/recent-transactions";
import { CreditScoreCard } from "@/components/credit-score-card";
import { LoanSummary } from "@/components/loan-summary";
import { BankConnections } from "@/components/bank-connections";
import { OnChainActivity } from "@/components/on-chain-activity";
import { ProofGenerator } from "@/components/proof-generator";
import { Button } from "@/components/ui/button";
import { WalletMultiButton } from "@/components/wallet-multi-button";


// components/mint.tsx


import CreateLoanNFT from "@/components/create_loan"
import GetToken from "@/components/Get_Token";

import CreateOffer from "@/components/ui/create_offer";
import AcceptOffer from "@/components/accept_offer";
import GetAcceptedOffers from "@/components/get_accepted_offers";
import GetUnacceptedTokens from "@/components/get_unaccepted_tokens"









export default function DashboardPage() {
  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">CreditTrust Dashboard</h2>
          <div className="flex items-center space-x-2">
            <WalletMultiButton />
            <Button>Generate ZK Proof</Button>
          </div>
        </div>
        
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="loans">Loans</TabsTrigger>
            <TabsTrigger value="connections">Bank Connections</TabsTrigger>
            <TabsTrigger value="onchain">On-Chain Activity</TabsTrigger>
            <TabsTrigger value="proofs">ZK Proofs</TabsTrigger>
          <TabsTrigger value="create-offer">Create Offer</TabsTrigger>
          <TabsTrigger value="unaccepted-tokens">Unaccepted Tokens</TabsTrigger>
          <TabsTrigger value="accept-offer">Accept Offer</TabsTrigger>
          <TabsTrigger value="accepted-offers">Accepted Offers</TabsTrigger>
           <TabsTrigger value="create-loan">Create Loan NFT</TabsTrigger>
            <TabsTrigger value="get-loan">Get Loan NFT</TabsTrigger>


          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <CreditScoreCard />
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Loans</CardTitle>
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
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$24,500</div>
                  <p className="text-xs text-muted-foreground">+12.1% from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">On-Time Payments</CardTitle>
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
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">98%</div>
                  <p className="text-xs text-muted-foreground">+2% from last quarter</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Credit Utilization</CardTitle>
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
                    <rect width="20" height="14" x="2" y="5" rx="2" />
                    <path d="M2 10h20" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">32%</div>
                  <p className="text-xs text-muted-foreground">-5% from last month</p>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Payment History</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                  <Overview />
                </CardContent>
              </Card>
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                  <CardDescription>Your most recent loan payments</CardDescription>
                </CardHeader>
                <CardContent>
                  <RecentTransactions />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="loans" className="space-y-4">
            <LoanSummary />
          </TabsContent>
          
          <TabsContent value="connections" className="space-y-4">
            <BankConnections />
          </TabsContent>
          
          <TabsContent value="onchain" className="space-y-4">
            <OnChainActivity />
          </TabsContent>
          
          <TabsContent value="proofs" className="space-y-4">
            <ProofGenerator />
          </TabsContent>

          <TabsContent value="create-offer" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Create NFT Offer</CardTitle>
              </CardHeader>
              <CardContent>
                <CreateOffer />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="accept-offer" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Accept NFT Offer</CardTitle>
              </CardHeader>
              <CardContent>
                <AcceptOffer />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="accepted-offers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Accepted Offers</CardTitle>
              </CardHeader>
              <CardContent>
                <GetAcceptedOffers />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="unaccepted-tokens" className="space-y-4">
            <GetUnacceptedTokens />
          </TabsContent>


          <TabsContent value="create-loan" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Create Loan NFT</CardTitle>
              </CardHeader>
              <CardContent>
                <CreateLoanNFT />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="get-loan" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Get Loan NFT</CardTitle>
              </CardHeader>
              <CardContent>
                <GetToken />
              </CardContent>
            </Card>
          </TabsContent>



        </Tabs>
      </div>
    </div>
  );
}