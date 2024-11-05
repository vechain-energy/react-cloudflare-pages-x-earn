// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.23;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "./interfaces/IX2EarnRewardsPool.sol";

contract X2EarnApp is Initializable, AccessControlUpgradeable, UUPSUpgradeable {
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
    bytes32 public constant REWARDER_ROLE = keccak256("REWARDER_ROLE");

    IX2EarnRewardsPool public rewardsPool;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        address defaultAdmin,
        address upgrader,
        IX2EarnRewardsPool _rewardsPool
    ) public initializer {
        __AccessControl_init();
        __UUPSUpgradeable_init();

        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
        _grantRole(UPGRADER_ROLE, upgrader);

        rewardsPool = _rewardsPool;
    }

    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyRole(UPGRADER_ROLE) {}

    function reward() public {
        rewardsPool.distributeReward(bytes32(0), 1 ether, msg.sender, "");
    }

    function rewardTo(address receiver) public onlyRole(REWARDER_ROLE) {
        rewardsPool.distributeReward(bytes32(0), 2 ether, receiver, "");
    }
    function rewardAmountTo(
        uint256 amount,
        address receiver
    ) public onlyRole(REWARDER_ROLE) {
        rewardsPool.distributeReward(bytes32(0), amount, receiver, "");
    }

    function rewardAmountWithProofTo(
        uint256 amount,
        address receiver,
        string[] memory proofTypes, // link, photo, video, text, etc.
        string[] memory proofValues, // "https://...", "Qm...", etc.,
        string[] memory impactCodes, // carbon, water, etc.
        uint256[] memory impactValues, // 100, 200, etc.,
        string memory description
    ) public onlyRole(REWARDER_ROLE) {
        rewardsPool.distributeRewardWithProof(
            bytes32(0),
            amount,
            receiver,
            proofTypes,
            proofValues,
            impactCodes,
            impactValues,
            description
        );
    }
}
