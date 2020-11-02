// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.6.12;

import "./SwapPool.sol";

interface IFactory {
    function createPool(address _token) external returns (address pool);
    function getPool(address _token) external view returns (address pair);
}

contract Factory is IFactory {
    mapping(address => address) private tokenToPool;
    
    constructor() public {}

    function createPool(address _token) external returns (address pool) {
        require(tokenToPool[_token] != address(0), "POOL_EXIST");
        bytes memory bytecode = type(SwapPool).creationCode;
        bytes32 salt = keccak256(_token);
        assembly {
            pool := create2(0, add(bytecode, 32), mload(bytecode), salt)
        }
        ISwapPool(pool).initialize(_token);
        tokenToPool[_token] = pool;
    }

    function getPool(address _token) external view returns (address pool) {
        pool = tokenToPool[_token];
    }
}
