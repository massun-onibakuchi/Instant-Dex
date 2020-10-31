// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.6.9;

import "./rToken.sol";
import "./libraries/TransferHelper.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

contract SwapPool is rToken {
    using SafeMath for uint256;

    address public token0;
    address public token1;

    constructor(address _WETH) public {
        WETH = _WETH;
    }

    function mint(address to) {
        uint256 balance0 = IERC20(token0).balanceOf(address(this));
        uint256 balance1 = IERC20(token1).balanceOf(address(this));
    }

    function burn(address to) {
        
    }
}
