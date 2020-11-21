// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.6.12;

import "./libraries/TransferHelper.sol";
import "./interfaces/IWETH.sol";
import "./interfaces/IFactory.sol";
import "./interfaces/ISwapPool.sol";
import "./SwapPool.sol";
import "./RToken.sol";

contract Periphery {
    address public immutable WETH;
    address public immutable factory;

    constructor(address _WETH, address _factory) public {
        WETH = _WETH;
        factory = _factory;
    }

    receive() external payable {
        // only accept ETH via fallback from the WETH contract
        assert(msg.sender == WETH);
    }

    /**
     * Add liquidity to pool.
     * @param token ERC20-compatible token address
     * @param to recipient of the liquidity token
     * @param amount amounts of token that caller wants to add
     */
    function addLiquidity(
        address token,
        address to,
        uint256 amount
    ) external returns (uint256 liquidity) {
        // address pool = IFactory(factory).getPool(token);
        address pool = poolFor(factory, token);
        require(pool != address(0), "INVALID_TOKEN_ADDRESS");

        TransferHelper.safeTransferFrom(token, msg.sender, pool, amount);
        liquidity = ISwapPool(pool).mint(to);
    }

    /**
     * Add liquidity to ETH pool.
     * Specify amount of ETH in msg.value
     * @param to recipient of the liquidity token
     */
    function addLiquidityETH(address to)
        external
        payable
        returns (uint256 liquidity)
    {
        address pool = poolFor(factory, WETH);
        require(pool != address(0), "INVALID_TOKEN_ADDRESS");

        IWETH(WETH).deposit{value: msg.value}();
        assert(IWETH(WETH).transfer(pool, msg.value));

        liquidity = ISwapPool(pool).mint(to);
    }

    /**
     * Remove liquidity and return token to a specified address
     * @param token ERC20-compatible token address
     * @param to recipient of the removed liquidity
     * @param liquidity amount of removed liquidity
     */
    function removeLiquidity(
        address token,
        address to,
        uint256 liquidity
    ) public returns (uint256 amount) {
        address pool = poolFor(factory, token);
        require(pool != address(0), "INVALID_TOKEN_ADDRESS");

        ISwapPool(pool).transferFrom(msg.sender, pool, liquidity);
        amount = ISwapPool(pool).burn(to);
    }

    /**
     * Remove ETH liqudity (WETH) and return ETH to a specified address
     * @param to recipient of the removed liquidity
     * @param liquidity amount of removed liquidity
     */
    function removeLiquidityETH(address to, uint256 liquidity)
        external
        returns (uint256 amountETH)
    {
        amountETH = removeLiquidity(WETH, address(this), liquidity);
        IWETH(WETH).withdraw(amountETH);
        TransferHelper.safeTransferETH(to, amountETH);
    }

    /**
     * Calculate pool address with create2Address
     * @param _factory factory contract address
     * @param _token ERC20 address
     */
    function poolFor(address _factory, address _token)
        private
        pure
        returns (address pool)
    {
        pool = address(
            uint256(
                keccak256(
                    abi.encodePacked(
                        hex"ff",
                        _factory,
                        keccak256(abi.encodePacked(_token)),
                        keccak256(abi.encodePacked(type(SwapPool).creationCode))
                    )
                )
            )
        );
    }
}
