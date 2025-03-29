// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

contract TestDeposit {

  mapping(address => uint256) public userBalances;//记录每个用户的存款金额

  // 合约上的总存款余额
  uint256 public totalBalance;

  address payable private owner;

  // 存款事件 - 用于记录谁存了多少钱
  event Deposit(address indexed _user,uint256 amount);
  // 提款事件 - 用于记录谁取了多少钱
  event Withdraw(address indexed _user,uint256 amount);

  constructor() {
    owner = payable(msg.sender);
  }

  function deposit() public payable {
    require(msg.value > 0, "Deposit amount must be greater than 0");
    userBalances[msg.sender] += msg.value;//记录每个用户的存款金额
    // msg.value 就是用转账过来的金额
    totalBalance += msg.value;

    // 触发存款事件
    emit Deposit(msg.sender, msg.value);

  }


  function withdraw(uint256 _num) public {
//        require(msg.sender == owner,"you are not the owner");
    require(totalBalance >= _num, "Insuffcient balance ");
    require(userBalances[msg.sender] >= _num, "Insuffcient balance ");
    userBalances[msg.sender] -= _num;//记录每个用户的存款金额
    totalBalance -= _num;

    payable(msg.sender).transfer(_num);

    emit Withdraw(msg.sender, _num);

  }

  function ownerWithdraw() public {
    /*
    //貔貅盘
    require(msg.sender == owner,"you are not the owner");
    payable(owner).transfer(totalBalance);
    totalBalance = 0;*/
    // 仅限存入资金的人提取所有资金
    uint256 amount = userBalances[msg.sender];
    require(amount > 0, "No balance to withdraw");
    userBalances[msg.sender] = 0;
    totalBalance-=amount;
    payable(msg.sender).transfer(amount);
    emit Withdraw(msg.sender, amount);//记录谁取了多少钱
  }

  function getBalance() public view returns(uint256){
    return userBalances[msg.sender];
  }

}