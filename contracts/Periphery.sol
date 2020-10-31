// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.6.9;

import "./rToken.sol";
import "./libraries/TransferHelper.sol";

contract Periphery {
    address public immutable WETH;
    address public immutable swapPool;

    constructor(address _WETH, address _swapPool) public {
        WETH = _WETH;
        swapPool = _swapPool;
    }

    receive() external payable {
        // only accept ETH via fallback from the WETH contract
        assert(msg.sender == WETH);
    }

    function addLiquidityETH(address to)
        external
        payable
        returns (uint256 amountETH, uint256 liquidity)
    {

    }
}
