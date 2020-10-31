// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.6.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract rToken is ERC20 {

    constructor() public ERC20("rToken", "rTKN") {}
    
}
