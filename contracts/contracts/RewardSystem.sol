// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./RewardToken.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title RewardSystem
 * @dev Smart contract for managing reward distribution
 */
contract RewardSystem is Ownable, ReentrancyGuard {
    RewardToken public rewardToken;
    
    // Mapping to track reward amounts for different actions
    mapping(string => uint256) public actionRewards;
    
    // Mapping to track user rewards and prevent double claiming
    mapping(address => mapping(string => bool)) public claimedRewards;
    
    // Mapping to track total rewards per user
    mapping(address => uint256) public userTotalRewards;
    
    // Events
    event RewardDistributed(address indexed user, string action, uint256 amount);
    event ActionRewardSet(string action, uint256 amount);
    event RewardClaimed(address indexed user, string action, uint256 amount);
    
    constructor(address _rewardTokenAddress) Ownable(msg.sender) {
        rewardToken = RewardToken(_rewardTokenAddress);
    }
    
    /**
     * @dev Set reward amount for a specific action
     * @param action The action identifier
     * @param amount The reward amount in tokens
     */
    function setActionReward(string memory action, uint256 amount) public onlyOwner {
        actionRewards[action] = amount;
        emit ActionRewardSet(action, amount);
    }
    
    /**
     * @dev Distribute reward to a user for completing an action
     * @param user The address of the user to reward
     * @param action The action identifier
     */
    function distributeReward(address user, string memory action) public onlyOwner nonReentrant {
        require(!claimedRewards[user][action], "RewardSystem: reward already claimed");
        require(actionRewards[action] > 0, "RewardSystem: invalid action");
        
        uint256 rewardAmount = actionRewards[action];
        
        // Mark as claimed
        claimedRewards[user][action] = true;
        
        // Update user total rewards
        userTotalRewards[user] += rewardAmount;
        
        // Mint tokens to user
        rewardToken.mint(user, rewardAmount);
        
        emit RewardDistributed(user, action, rewardAmount);
    }
    
    /**
     * @dev Batch distribute rewards to multiple users
     * @param users Array of user addresses
     * @param action The action identifier
     */
    function batchDistributeReward(address[] memory users, string memory action) public onlyOwner {
        require(actionRewards[action] > 0, "RewardSystem: invalid action");
        
        uint256 rewardAmount = actionRewards[action];
        
        for (uint256 i = 0; i < users.length; i++) {
            if (!claimedRewards[users[i]][action]) {
                claimedRewards[users[i]][action] = true;
                userTotalRewards[users[i]] += rewardAmount;
                rewardToken.mint(users[i], rewardAmount);
                emit RewardDistributed(users[i], action, rewardAmount);
            }
        }
    }
    
    /**
     * @dev Get user's total rewards
     * @param user The user address
     * @return The total rewards earned by the user
     */
    function getUserTotalRewards(address user) public view returns (uint256) {
        return userTotalRewards[user];
    }
    
    /**
     * @dev Check if user has claimed reward for an action
     * @param user The user address
     * @param action The action identifier
     * @return Whether the reward has been claimed
     */
    function hasClaimedReward(address user, string memory action) public view returns (bool) {
        return claimedRewards[user][action];
    }
}

