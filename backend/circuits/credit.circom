pragma circom 2.0.0;

template CreditProof() {
    signal input totalLoans;
    signal input onTimePayments;
    signal input latePayments;
    signal input creditUtilization;
    
    signal output creditScore;

    // Simple credit score calculation
    creditScore <== 300 + (onTimePayments * 5) - (latePayments * 10) - (creditUtilization / 2);
}

component main = CreditProof();