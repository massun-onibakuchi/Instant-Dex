// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.6.0;

import "./rToken.sol";
import "./libraries/TransferHelper.sol";
import "./interfaces/ISwapPool.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

contract SwapPool is ISwapPool, rToken {
    using SafeMath for uint256;

    address public token;
    uint112 private reserve; // uses single storage slot, accessible via getReserve
    address public factory;
    bytes4 private constant SELECTOR = bytes4(
        keccak256(bytes("transfer(address,uint256)"))
    );

    uint256 private unlocked = 1;
    modifier lock() {
        require(unlocked == 1, "LOCKED");
        unlocked = 0;
        _;
        unlocked = 1;
    }

    constructor() public {
        factory = msg.sender;
    }

    event Sync(uint112 reserve);
    event Mint(address indexed sender, uint256 amount);
    event Burn(address indexed sender, uint256 amount);

    // update reserves
    function _update(uint256 balance) private override {
        require(balance <= uint112(-1), "OVERFLOW");
        reserve = uint112(balance);
        emit Sync(reserve);
    }

    function _safeTransfer(
        address token,
        address to,
        uint256 value
    ) private override {
        (bool success, bytes memory data) = token.call(
            abi.encodeWithSelector(SELECTOR, to, value)
        );
        require(
            success && (data.length == 0 || abi.decode(data, (bool))),
            "UniswapV2: TRANSFER_FAILED"
        );
    }

    function getReserve() public override view returns (uint112 _reserve) {
        _reserve = reserve;
    }

    function initialize(address _token) external override {
        require(msg.sender == factory, "UniswapV2: FORBIDDEN");
        token = _token;
    }

    function mint(address to)
        external
        override
        lock
        returns (uint256 liquidity)
    {
        uint112 _reserve = getReserve();
        uint256 balance = IERC20(token).balanceOf(address(this));
        uint256 amount = balance.sub(_reserve);

        /* 小数の計算 */
        //ここではliquidity =  amount とする
        liquidity = amount;
        require(liquidity > 0, "UniswapV2: INSUFFICIENT_LIQUIDITY_MINTED");

        _mint(to, liquidity);
        _update(balance);
        emit Mint(msg.sender, amount);
    }

    function burn(address to) external override lock returns (uint256 amount) {
        // uint112 _reserve = getReserve();
        address _token = token; // gas savings

        uint256 balance = IERC20(_token).balanceOf(address(this));
        uint256 liquidity = balanceOf(address(this));

        /* 小数の計算 */

        amount = liquidity;
        require(amount > 0, "UniswapV2: INSUFFICIENT_LIQUIDITY_BURNED");
        _burn(address(this), liquidity);
        _safeTransfer(token, to, amount);
        balance = IERC20(_token).balanceOf(address(this));

        _update(balance);
        emit Burn(msg.sender, amount);
    }
}
