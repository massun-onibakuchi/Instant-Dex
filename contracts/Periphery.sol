// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.6.9;

import "./rToken.sol";
import "./libraries/TransferHelper.sol";
import "./ReferenceStorage.sol";

contract Periphery {
    address public immutable WETH;
    address public immutable referenceStorage;

    constructor(address _WETH, address _swapPool) public {
        WETH = _WETH;
        swapPool = _swapPool;
    }

    receive() external payable {
        // only accept ETH via fallback from the WETH contract
        assert(msg.sender == WETH);
    }

    function _addLiquidity(
        address token,
        uint256 amountADesired,
        uint256 amountBDesired,
        uint256 amountAMin,
        uint256 amountBMin
    ) internal virtual returns (uint256 amountA, uint256 amountB) {
        require(
            IReferenceStorage(refereStorage).getPair(token) != address(0),
            "INVALID TOKEN ADDRESS"
        );

        (uint256 reserveA, uint256 reserveB) = UniswapV2Library.getReserves(
            factory,
            token
        );

    }

    function addLiquidityETH(address to)
        external
        payable
        returns (uint256 amountETH, uint256 amountToken)
    {}

    function removeLiquidityETH(address to)
        external
        returns (uint256 amountETH, uint256 amountToken)
    {}
}
