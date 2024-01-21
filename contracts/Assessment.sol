// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Assessment {
    address payable public owner;
    uint256 public balance;
    mapping(address => uint256) public cryptoHoldings;

    event Deposit(uint256 amount);
    event Withdraw(uint256 amount);
    event CreditScoreUpdated(address indexed account, uint256 newCreditScore);
    event DebitCardIssued(address indexed account, uint256 cardNumber);
    event CreditCardIssued(address indexed account, uint256 cardNumber);

    constructor(uint256 initBalance) payable {
        owner = payable(msg.sender);
        balance = initBalance;
    }

    function getBalance() public view returns(uint256) {
        return balance;
    }

    function deposit(uint256 _amount) public payable {
        require(msg.sender == owner, "You are not the owner of this account");
        balance += _amount;
        emit Deposit(_amount);
    }

    error InsufficientBalance(uint256 balance, uint256 withdrawAmount);

    function withdraw(uint256 _withdrawAmount) public {
        require(msg.sender == owner, "You are not the owner of this account");
        if (balance < _withdrawAmount) {
            revert InsufficientBalance({
                balance: balance,
                withdrawAmount: _withdrawAmount
            });
        }
        balance -= _withdrawAmount;
        emit Withdraw(_withdrawAmount);
    }

    function updateCreditScore(address _account, uint256 _newCreditScore) public {
        require(msg.sender == owner, "You are not authorized to update credit scores");
        cryptoHoldings[_account] = _newCreditScore;
        emit CreditScoreUpdated(_account, _newCreditScore);
    }

    function issueDebitCard(address _account) public {
        require(msg.sender == owner, "You are not authorized to issue debit cards");
        uint256 cardNumber = uint256(keccak256(abi.encodePacked(block.timestamp, _account))) % 10000000000000000;
        emit DebitCardIssued(_account, cardNumber);
    }

    function issueCreditCard(address _account) public {
        require(msg.sender == owner, "You are not authorized to issue credit cards");
        uint256 cardNumber = uint256(keccak256(abi.encodePacked(block.timestamp, _account))) % 10000000000000000;
        emit CreditCardIssued(_account, cardNumber);
    }
}
