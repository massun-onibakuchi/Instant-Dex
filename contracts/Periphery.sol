// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.6.9;

import './rToken.sol';
import './libraries/TransferHelper.sol';

contract Periphery {
    address public immutable  WETH;

    constructor( address _WETH) public {
        WETH = _WETH;
    }

    receive() external payable {
        // only accept ETH via fallback from the WETH contract
        assert(msg.sender == WETH); 
    }
}