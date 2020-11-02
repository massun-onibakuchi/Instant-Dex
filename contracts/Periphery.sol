// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.6.12;

import "./libraries/TransferHelper.sol";
import "./interfaces/IWETH.sol";
import "./rToken.sol";
import "./Factory.sol";
import "./SwapPool.sol";

contract Periphery {
    address public /* immutable */ WETH;
    address public /* immutable */ factory;

    constructor(address _WETH, address _factory) public {
        WETH = _WETH;
        factory = _factory;
    }

    // receive() external payable {
    //     // only accept ETH via fallback from the WETH contract
    //     assert(msg.sender == WETH);
    // }

    function addLiquidity(
        address token,
        address to,
        uint256 amount
    ) external returns ( uint256 liquidity) {
        address pool = IFactory(factory).getPool(token);
        require(pool != address(0), "INVALID_TOKEN_ADDRESS");

        TransferHelper.safeTransferFrom(token, msg.sender, pool, amount);
        liquidity = ISwapPool(pool).mint(to);
                emit Mint(msg.sender,amount);

    }

    function addLiquidityETH(
        address to
    ) external payable returns ( uint256 liquidity) {
        address pool = poolFor(factory, WETH);
        require(pool != address(0), "INVALID_TOKEN_ADDRESS");

        IWETH(WETH).deposit{value: msg.value}();
        assert(IWETH(WETH).transfer(pool, msg.value));

        liquidity = ISwapPool(pool).mint(to);
    }

    function removeLiquidity(address token,address to,address amount)
        external
        returns (uint liquidity)
    {
        address pool = poolFor(factory, token);
        require(pool != address(0), "INVALID_TOKEN_ADDRESS");

        ISwapPool(pool).trasferFrom(msg.sender, pool, amount);
        liquidity = ISwapPool(pool).burn(to);
    }

    function removeLiquidityETH(address to,address amountETH)
        external
        returns (uint liquidity)
    {
        address pool = poolFor(factory, WETH);
        require(pool != address(0), "INVALID_TOKEN_ADDRESS");

        IWETH(WETH).withdraw(amountETH);

        TransferHelper.safeTransferETH(to, amountETH);

        liquidity = ISwapPool(pool).burn(to);
    }

    function pairFor(address factory, address token) private pure returns (address pool) {
        pool = address(uint(keccak256(abi.encodePacked(
                hex'ff',
                factory,
                keccak256(token),
                hex'96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f' // init code hash
            ))));
    }

}
