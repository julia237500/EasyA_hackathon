// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CreditLog {
    struct Loan {
        uint8 loanType; // bit 1 = loan
        uint256 amount; // in smallest units, e.g., wei or cents
        uint32 deadline;
        uint16 interestBps;
        bytes16 loanId;
        address sourceWallet;
        address destinationWallet;
    }

    struct Payment {
        uint8 paymentType; // bit 0 = payment
        uint256 amount;
        uint32 datePaid;
        bytes16 linkedLoanId;
        address payerWallet;
        address payeeWallet;
    }

    event LoanLogged(bytes16 loanId, address indexed borrower, uint256 amount);
    event PaymentLogged(bytes16 loanId, address indexed payer, uint256 amount);

    mapping(bytes16 => Loan) public loans;
    mapping(bytes16 => Payment[]) public payments;

    function logLoan(
        bytes16 loanId,
        uint256 amount,
        uint32 deadline,
        uint16 interestBps,
        address destinationWallet
    ) external {
        require(loans[loanId].sourceWallet == address(0), "Loan already logged");
        loans[loanId] = Loan({
            loanType: 1,
            amount: amount,
            deadline: deadline,
            interestBps: interestBps,
            loanId: loanId,
            sourceWallet: msg.sender,
            destinationWallet: destinationWallet
        });
        emit LoanLogged(loanId, msg.sender, amount);
    }

    function logPayment(
        bytes16 linkedLoanId,
        uint256 amount,
        uint32 datePaid
    ) external {
        require(loans[linkedLoanId].sourceWallet != address(0), "Loan not found");

        payments[linkedLoanId].push(Payment({
            paymentType: 0,
            amount: amount,
            datePaid: datePaid,
            linkedLoanId: linkedLoanId,
            payerWallet: msg.sender,
            payeeWallet: loans[linkedLoanId].destinationWallet
        }));

        emit PaymentLogged(linkedLoanId, msg.sender, amount);
    }
}
