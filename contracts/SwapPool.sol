// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.6.12;

import "./RToken.sol";
import "./libraries/TransferHelper.sol";
import "./interfaces/ISwapPool.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

contract SwapPool is ISwapPool, RToken {
    using SafeMath for uint256;

    uint112 private reserve; // uses single storage slot, accessible via getReserve
    address public token;
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
    function _update(uint256 balance) private {
        require(balance <= uint112(-1), "OVERFLOW");
        reserve = uint112(balance);
        emit Sync(reserve);
    }

    function _safeTransfer(
        address _token,
        address to,
        uint256 value
    ) private {
        (bool success, bytes memory data) = _token.call(
            abi.encodeWithSelector(SELECTOR, to, value)
        );
        require(
            success && (data.length == 0 || abi.decode(data, (bool))),
            "TRANSFER_FAILED"
        );
    }

    function getReserve() public override view returns (uint112 _reserve) {
        _reserve = reserve;
    }

    function initialize(address _token) external override {
        require(msg.sender == factory, "ONLY_FACTORY");
        token = _token;
    }

    /**
     * mint loquidity token to specified address.
     * this function don't check sufficiently
     * @param to recipient of the liquidity token
     */
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
        liquidity = amount;
        require(liquidity > 0, "INSUFFICIENT_LIQUIDITY_MINTED");

        _mint(to, liquidity);
        _update(balance);
        emit Mint(msg.sender, amount);
    }

    /**
     * burn loquidity token and send asset to specified address.
     * this function don't check sufficiently
     * @param to recipient of the asset.
     */
    function burn(address to) external override lock returns (uint256 amount) {
        // uint112 _reserve = getReserve();
        address _token = token; // gas savings

        uint256 balance = IERC20(_token).balanceOf(address(this));
        uint256 liquidity = balanceOf(address(this));

        /* 小数の計算 */
        amount = liquidity;

        require(amount > 0, "INSUFFICIENT_LIQUIDITY_BURNED");
        _burn(address(this), liquidity);
        _safeTransfer(token, to, amount);
        balance = IERC20(_token).balanceOf(address(this));

        _update(balance);
        emit Burn(msg.sender, amount);
    }
}
