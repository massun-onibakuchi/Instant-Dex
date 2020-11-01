// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.6.9;

import "./rToken.sol";
import "./libraries/TransferHelper.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

contract SwapPool is rToken {
    using SafeMath for uint256;

    address public token;
    uint112 private reserve; // uses single storage slot, accessible via getReserves

    uint256 private unlocked = 1;
    modifier lock() {
        require(unlocked == 1, "UniswapV2: LOCKED");
        unlocked = 0;
        _;
        unlocked = 1;
    }

    function getReserve() public view returns (uint112 _reserve) {
        _reserve = reserve;
    }

    // update reserves
    function _update(uint256 balance, uint112 _reserve) private {
        require(balance <= uint112(-1), "UniswapV2: OVERFLOW");
        reserve = uint112(balance);
        emit Sync(reserve);
    }

    function mint(address to) external lock returns (uint256 liquidity) {
        uint112 _reserve = getReserves();
        uint256 balance = IERC20(token).balanceOf(address(this));
        uint256 amount = balance.sub(_reserve);
        /* 小数の計算 */
        liquidity = 20;
        _mint(to, liquidity);
        _update(balance, _reserve);
    }

    function burn(address to) external lock returns (uint256 liquidity) {}
}
