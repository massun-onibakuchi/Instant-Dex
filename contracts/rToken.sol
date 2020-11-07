// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.6.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract RToken is ERC20("RToken", "rTKN") {

    event Mint(address indexed sender,uint amount);
    event Burn(address indexed sender,uint amount);

}
