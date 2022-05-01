// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

interface IRewardsController {
    function claimAllRewards(address[] calldata assets, address to)
        external
        returns (address[] memory rewardsList, uint256[] memory claimedAmounts);
    function getAllUserRewards(address[] calldata assets, address user)
        external
        view
        returns (address[] memory rewardsList, uint256[] memory unclaimedAmounts);
}