// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.6.12;

interface IPeriphery {
    function addLiquidity(
        address token,
        address to,
        uint256 amount
    ) external returns (uint256 liquidity);
    
    function addLiquidityETH(address to)
        external
        payable
        returns (uint256 liquidity);

    function removeLiquidity(
        address token,
        address to,
        uint256 liquidity
    ) external returns (uint256 amount);

    function removeLiquidityETH(address to, uint256 liquidity)
        external
        returns (uint256 amountETH);

// function poolFor(address _factory, address _token)
//         private
//         pure
//         returns (address pool)
}
