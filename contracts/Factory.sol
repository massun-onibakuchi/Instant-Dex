// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.6.12;

import "./SwapPool.sol";
import "./interfaces/ISwapPool.sol";
import "./interfaces/IFactory.sol";

contract Factory is IFactory {
    mapping(address => address) private tokenToPool;

    event PoolCreated(address indexed token, address indexed pool);

    // https://solidity.readthedocs.io/en/v0.6.12/control-structures.html#creating-contracts-via-new
    function createPool(address _token)
        external
        override
        returns (address pool)
    {
        require(tokenToPool[_token] == address(0), "POOL_EXIST");
        bytes32 salt = keccak256(abi.encodePacked(_token));
        pool = address(new SwapPool{salt: salt}());
        ISwapPool(pool).initialize(_token);
        tokenToPool[_token] = pool;
        emit PoolCreated(_token, pool);
    }

    function getPool(address _token)
        external
        override
        view
        returns (address pool)
    {
        pool = tokenToPool[_token];
    }
}
