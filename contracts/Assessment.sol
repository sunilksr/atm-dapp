// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Assessment {
    address payable public owner;
    uint256 public balance;
    bool public locked;
    uint256 public pin;

    event Deposit(uint256 amount);
    event Withdraw(uint256 amount);
    event LockStatusChanged(bool newStatus);
    event PinChanged(uint256 newPin);

    modifier onlyOwner() {
        require(msg.sender == owner, "You are not the owner of this account");
        _;
    }

    modifier notLocked() {
        require(!locked, "Contract is locked");
        _;
    }

    constructor(uint initBalance) payable {
        owner = payable(msg.sender);
        balance = initBalance;
        locked = false;
        pin = 6436; // Default pin
    }

    function getBalance() public view returns(uint256){
        return balance;
    }

    function deposit(uint256 _amount) public payable notLocked {
        // perform transaction
        balance += _amount;

        // emit the event
        emit Deposit(_amount);
    }

    // custom error
    error InsufficientBalance(uint256 balance, uint256 withdrawAmount);

    function withdraw(uint256 _withdrawAmount) public onlyOwner notLocked {
        if (balance < _withdrawAmount) {
            revert InsufficientBalance({
                balance: balance,
                withdrawAmount: _withdrawAmount
            });
        }

        // withdraw the given amount
        balance -= _withdrawAmount;

        // emit the event
        emit Withdraw(_withdrawAmount);
    }

    function toggleLock() public onlyOwner {
        locked = !locked;
        emit LockStatusChanged(locked);
    }

    function changePin(uint256 _newPin) public onlyOwner {
        pin = _newPin;
        emit PinChanged(_newPin);
    }
}
