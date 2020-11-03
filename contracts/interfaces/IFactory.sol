// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.6.12;

import "../SwapPool.sol";

interface IFactory {
    function createPool(address _token) external returns (address pool);
    function getPool(address _token) external view returns (address pair);
}