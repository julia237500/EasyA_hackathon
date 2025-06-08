// contracts/LoanRegistry.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract LoanRegistry {
    struct Loan {
        address borrower;
        address lender;
        uint256 amount;
        uint256 interestRate;
        uint256 term;
        uint256 startDate;
        uint256 nftId;
        string xrplTxHash;
    }

    struct Payment {
        uint256 loanId;
        uint256 amount;
        uint256 timestamp;
        bool verified;
    }

    mapping(uint256 => Loan) public loans;
    mapping(uint256 => Payment[]) public loanPayments;
    uint256 public loanCount;

    event LoanRegistered(uint256 indexed loanId, address indexed borrower, address indexed lender);
    event PaymentRecorded(uint256 indexed loanId, uint256 amount, uint256 timestamp);

    function registerLoan(
        address _lender,
        uint256 _amount,
        uint256 _interestRate,
        uint256 _term,
        uint256 _nftId,
        string memory _xrplTxHash
    ) external returns (uint256) {
        loanCount++;
        loans[loanCount] = Loan({
            borrower: msg.sender,
            lender: _lender,
            amount: _amount,
            interestRate: _interestRate,
            term: _term,
            startDate: block.timestamp,
            nftId: _nftId,
            xrplTxHash: _xrplTxHash
        });

        emit LoanRegistered(loanCount, msg.sender, _lender);
        return loanCount;
    }

    function recordPayment(
        uint256 _loanId,
        uint256 _amount
    ) external {
        require(_loanId <= loanCount, "Loan does not exist");
        require(loans[_loanId].borrower == msg.sender, "Not the borrower");

        loanPayments[_loanId].push(Payment({
            loanId: _loanId,
            amount: _amount,
            timestamp: block.timestamp,
            verified: false
        }));

        emit PaymentRecorded(_loanId, _amount, block.timestamp);
    }

    function verifyPayment(
        uint256 _loanId,
        uint256 _paymentIndex
    ) external {
        require(msg.sender == loans[_loanId].lender, "Only lender can verify");
        loanPayments[_loanId][_paymentIndex].verified = true;
    }

    function getLoanPayments(uint256 _loanId) external view returns (Payment[] memory) {
        return loanPayments[_loanId];
    }
}