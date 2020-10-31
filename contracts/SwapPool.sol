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


}
