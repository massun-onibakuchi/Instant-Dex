// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.6.0;

import "./SwapPool.sol";
import "./interfaces/IFactory.sol";

contract Factory is IFactory {
    mapping(address => address) private tokenToPool;
    
    constructor() public {}

    function createPool(address _token) external override returns (address pool) {
        require(tokenToPool[_token] != address(0), "POOL_EXIST");
        bytes memory bytecode = type(SwapPool).creationCode;
        bytes32 salt = keccak256(abi.encodePacked(_token));
        assembly {
            pool := create2(0, add(bytecode, 32), mload(bytecode), salt)
        }
        ISwapPool(pool).initialize(_token);
        tokenToPool[_token] = pool;
    }

    function getPool(address _token) external override view returns (address pool) {
        pool = tokenToPool[_token];
    }
}