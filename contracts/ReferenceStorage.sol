// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.6.9;

contract ReferenceStorage is IReferenceStorage {
    address public immutable WETH;
    address public immutable swapPool;

    constructor(address _WETH, address _swapPool) public {}

    function getPair(address _token) external view returns (address pair) {}
}

interface IReferenceStorage {
    function getPair(address _token) external view returns (address pair);
}
