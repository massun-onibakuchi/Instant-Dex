// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.6.12;

interface IFactory {
    event PoolCreated(address indexed token, address indexed pool);

    function createPool(address _token) external returns (address pool);

    function getPool(address _token) external view returns (address pair);

    function getCreationCode(address _token) external view returns (bytes memory  bytecode, bytes32 salt);
}
