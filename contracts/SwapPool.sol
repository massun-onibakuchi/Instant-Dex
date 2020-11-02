// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.6.12;

import "./rToken.sol";
import "./libraries/TransferHelper.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

interface ISwapPool {
    event Sync(uint112 reserve);
    event Mint(address indexed sender, uint256 amount);
    event Burn(address indexed sender, uint256 amount);

    function getReserve() public view returns (uint112 _reserve);

    function _update(uint256 balance, uint112 _reserve) private;

    function mint(address to) external lock returns (uint256 liquidity);

    function burn(address to) external lock returns (uint256 liquidity);

    function name() external pure returns (string memory);

    function symbol() external pure returns (string memory);

    function decimals() external pure returns (uint8);

    function totalSupply() external view returns (uint256);

    function balanceOf(address _owner) external view returns (uint256 balance);

    function transfer(address _to, uint256 _value)
        external
        returns (bool success);

    function transferFrom(
        address _from,
        address _to,
        uint256 _value
    ) external returns (bool success);

    function approve(address _spender, uint256 _value)
        external
        returns (bool success);

    function allowance(address _owner, address _spender)
        external
        view
        returns (uint256 remaining);

    event Transfer(address indexed _from, address indexed _to, uint256 _value);
    event Approval(
        address indexed _owner,
        address indexed _spender,
        uint256 _value
    );
}

contract SwapPool is ISwapPool, rToken {
    using SafeMath for uint256;

    address public token;
    uint112 private reserve; // uses single storage slot, accessible via getReserves

    uint256 private unlocked = 1;
    modifier lock() {
        require(unlocked == 1, "LOCKED");
        unlocked = 0;
        _;
        unlocked = 1;
    }

    event Sync(uint112 reserve);
    event Mint(address indexed sender, uint256 amount);
    event Burn(address indexed sender, uint256 amount);

    function getReserve() public view returns (uint112 _reserve) {
        _reserve = reserve;
    }

    // update reserves
    function _update(uint256 balance, uint112 _reserve) private {
        require(balance <= uint112(-1), "OVERFLOW");
        reserve = uint112(balance);
        emit Sync(reserve);
    }

    function mint(address to) external lock returns (uint256 liquidity) {
        uint112 _reserve = getReserves();
        uint256 balance = IERC20(token).balanceOf(address(this));
        uint256 amount = balance.sub(_reserve);

        /* 小数の計算 */
        //ここではliquidity =  amount とする
        liquidity = amount;
        require(liquidity > 0, "UniswapV2: INSUFFICIENT_LIQUIDITY_MINTED");

        _mint(to, liquidity);
        _update(balance, _reserve);
        emit Mint(msg.sender, amount);
    }

    function burn(address to) external lock returns (uint256 amount) {
        uint112 _reserve = getReserves();
        address _token = token; // gas savings

        uint256 balance = IERC20(_token).balanceOf(address(this));
        uint256 liquidity = balanceOf(address(this));

        /* 小数の計算 */

        amount = liquidity;
        require(amount > 0, "UniswapV2: INSUFFICIENT_LIQUIDITY_BURNED");
        _burn(address(this), liquidity);
        _safeTransfer(token, to, amount);
        balance = IERC20(_token).balanceOf(address(this));

        _update(balance, _reserve);
        emit Burn(msg.sender, amount);
    }
}
