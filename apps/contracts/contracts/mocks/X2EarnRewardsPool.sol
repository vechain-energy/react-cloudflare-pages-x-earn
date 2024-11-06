// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {IERC1155Receiver} from "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";
import {IERC721Receiver} from "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./B3TR.sol";

/**
 * Mock contract forked from vebetterdao-contracts.
 *
 * @title X2EarnRewardsPool
 * @dev This contract is used by x2Earn apps to reward users that performed sustainable actions.
 * The XAllocationPool contract or other contracts/users can deposit funds into this contract by specifying the app
 * that can access the funds.
 * Admins of x2EarnApps can withdraw funds from the rewards pool, whihch are sent to the team wallet.
 * Reward distributors of a x2Earn app can distribute rewards to users that performed sustainable actions or withdraw funds
 * to the team wallet.
 */
contract X2EarnRewardsPoolMock {
    B3TRMock public b3tr;

    event RewardDistributed(uint256 amount, bytes32 indexed appId, address indexed receiver, string proof, address indexed distributor);

    constructor(B3TRMock _b3tr) {
        b3tr = _b3tr;
    }

    /**
     * @dev See {IX2EarnRewardsPool-distributeReward}
     */
    function distributeReward(
        bytes32 appId,
        uint256 amount,
        address receiver,
        string memory
    ) external {
        _distributeReward(appId, amount, receiver);
        _emitProof(
            appId,
            amount,
            receiver,
            new string[](0),
            new string[](0),
            new string[](0),
            new uint256[](0),
            ""
        );
    }

    /**
     * @dev See {IX2EarnRewardsPool-distributeRewardWithProof}
     */
    function distributeRewardWithProof(
        bytes32 appId,
        uint256 amount,
        address receiver,
        string[] memory proofTypes, // link, photo, video, text, etc.
        string[] memory proofValues, // "https://...", "Qm...", etc.,
        string[] memory impactCodes, // carbon, water, etc.
        uint256[] memory impactValues, // 100, 200, etc.,
        string memory description
    ) public {
        _distributeReward(appId, amount, receiver);
        _emitProof(
            appId,
            amount,
            receiver,
            proofTypes,
            proofValues,
            impactCodes,
            impactValues,
            description
        );
    }

    function _distributeReward(
        bytes32 appId,
        uint256 amount,
        address receiver
    ) internal {
        b3tr.mint(address(this), amount);
        b3tr.transfer(receiver, amount);
    }

    /**
     * @dev Emits the RewardDistributed event with the provided proofs and impacts.
     */
    function _emitProof(
        bytes32 appId,
        uint256 amount,
        address receiver,
        string[] memory proofTypes,
        string[] memory proofValues,
        string[] memory impactCodes,
        uint256[] memory impactValues,
        string memory description
    ) internal {
        // Build the JSON proof string from the proof and impact data
        string memory jsonProof = buildProof(
            proofTypes,
            proofValues,
            impactCodes,
            impactValues,
            description
        );

        // emit event
        emit RewardDistributed(amount, appId, receiver, jsonProof, msg.sender);
    }

    /**
     * @dev see {IX2EarnRewardsPool-buildProof}
     */
    function buildProof(
        string[] memory proofTypes,
        string[] memory proofValues,
        string[] memory impactCodes,
        uint256[] memory impactValues,
        string memory description
    ) public view virtual returns (string memory) {
        bool hasProof = proofTypes.length > 0 && proofValues.length > 0;
        bool hasImpact = impactCodes.length > 0 && impactValues.length > 0;
        bool hasDescription = bytes(description).length > 0;

        // If neither proof nor impact is provided, return an empty string
        if (!hasProof && !hasImpact) {
            return "";
        }

        // Initialize an empty JSON bytes array with version
        bytes memory json = abi.encodePacked('{"version": 2');

        // Add description if available
        if (hasDescription) {
            json = abi.encodePacked(
                json,
                ',"description": "',
                description,
                '"'
            );
        }

        // Add proof if available
        if (hasProof) {
            bytes memory jsonProof = _buildProofJson(proofTypes, proofValues);

            json = abi.encodePacked(json, ',"proof": ', jsonProof);
        }

        // Add impact if available
        if (hasImpact) {
            bytes memory jsonImpact = _buildImpactJson(
                impactCodes,
                impactValues
            );

            json = abi.encodePacked(json, ',"impact": ', jsonImpact);
        }

        // Close the JSON object
        json = abi.encodePacked(json, "}");

        return string(json);
    }

    /**
     * @dev Builds the proof JSON string from the proof data.
     * @param proofTypes the proof types
     * @param proofValues the proof values
     */
    function _buildProofJson(
        string[] memory proofTypes,
        string[] memory proofValues
    ) internal pure returns (bytes memory) {
        require(
            proofTypes.length == proofValues.length,
            "X2EarnRewardsPool: Mismatched input lengths for Proof"
        );

        bytes memory json = abi.encodePacked("{");

        for (uint256 i; i < proofTypes.length; i++) {
            json = abi.encodePacked(
                json,
                '"',
                proofTypes[i],
                '":',
                '"',
                proofValues[i],
                '"'
            );
            if (i < proofTypes.length - 1) {
                json = abi.encodePacked(json, ",");
            }
        }

        json = abi.encodePacked(json, "}");

        return json;
    }

    /**
     * @dev Builds the impact JSON string from the impact data.
     *
     * @param impactCodes the impact codes
     * @param impactValues the impact values
     */
    function _buildImpactJson(
        string[] memory impactCodes,
        uint256[] memory impactValues
    ) internal pure returns (bytes memory) {
        require(
            impactCodes.length == impactValues.length,
            "X2EarnRewardsPool: Mismatched input lengths for Impact"
        );

        bytes memory json = abi.encodePacked("{");

        for (uint256 i; i < impactValues.length; i++) {
            json = abi.encodePacked(
                json,
                '"',
                impactCodes[i],
                '":',
                Strings.toString(impactValues[i])
            );
            if (i < impactValues.length - 1) {
                json = abi.encodePacked(json, ",");
            }
        }

        json = abi.encodePacked(json, "}");

        return json;
    }
}
