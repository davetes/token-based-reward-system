const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Deploy RewardToken
  const RewardToken = await hre.ethers.getContractFactory("RewardToken");
  const rewardToken = await RewardToken.deploy(
    "Reward Token",
    "RWD",
    hre.ethers.parseEther("1000000") // 1 million tokens cap
  );
  
  await rewardToken.waitForDeployment();
  const rewardTokenAddress = await rewardToken.getAddress();
  console.log("RewardToken deployed to:", rewardTokenAddress);

  // Deploy RewardSystem
  const RewardSystem = await hre.ethers.getContractFactory("RewardSystem");
  const rewardSystem = await RewardSystem.deploy(rewardTokenAddress);
  
  await rewardSystem.waitForDeployment();
  const rewardSystemAddress = await rewardSystem.getAddress();
  console.log("RewardSystem deployed to:", rewardSystemAddress);

  // Transfer ownership of RewardToken to RewardSystem
  await rewardToken.transferOwnership(rewardSystemAddress);
  console.log("RewardToken ownership transferred to RewardSystem");

  // Set initial action rewards
  const rewardSystemContract = await hre.ethers.getContractAt("RewardSystem", rewardSystemAddress);
  
  // Example actions with rewards (in tokens)
  await rewardSystemContract.setActionReward("signup", hre.ethers.parseEther("100"));
  await rewardSystemContract.setActionReward("login", hre.ethers.parseEther("10"));
  await rewardSystemContract.setActionReward("referral", hre.ethers.parseEther("50"));
  await rewardSystemContract.setActionReward("task_complete", hre.ethers.parseEther("25"));
  
  console.log("Initial action rewards set");

  console.log("\n=== Deployment Summary ===");
  console.log("RewardToken Address:", rewardTokenAddress);
  console.log("RewardSystem Address:", rewardSystemAddress);
  console.log("\nSave these addresses for your frontend and backend configuration!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

