// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.6.12;

import "../RToken.sol";
import "../libraries/TransferHelper.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface ISwapPool is IERC20 {
    event Sync(uint112 reserve);
    event Mint(address indexed sender, uint256 amount);
    event Burn(address indexed sender, uint256 amount);

    function getReserve() external view returns (uint112 _reserve);

    function mint(address to) external returns (uint256 liquidity);

    function burn(address to) external returns (uint256 liquidity);

    function initialize(address _token) external;

    // function _update(uint256 balance) private;
    
    // function _safeTransfer(
    //     address token,
    //     address to,
    //     uint256 value
    // ) private;
}
