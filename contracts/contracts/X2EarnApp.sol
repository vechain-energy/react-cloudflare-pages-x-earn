// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.20;

import "./interfaces/IX2EarnRewardsPool.sol";

contract X2EarnApp {
    IX2EarnRewardsPool public rewardsPool;
    constructor(IX2EarnRewardsPool _rewardsPool) {
        rewardsPool = _rewardsPool;
    }

    function reward() public {
        rewardsPool.distributeReward(bytes32(0), 1, msg.sender, "");
    }
}
