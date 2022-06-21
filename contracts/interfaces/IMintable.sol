// SPDX-License-Identifier: MIT
pragma solidity >=0.5.0;

interface IMintable {
    function mint(address to, uint256 amount) external;
}
