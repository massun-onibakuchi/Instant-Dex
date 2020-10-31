//SPDX-License-Identifier: Unlicense
pragma solidity ^0.6.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// Example class - a mock class using delivering from ERC20
contract BasicToken is ERC20 {
  constructor(uint256 initialBalance) ERC20("Basic", "BSC") public {
      _mint(msg.sender, initialBalance);
  }
}