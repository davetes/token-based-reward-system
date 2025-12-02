# Token Based Reward System

A blockchain-powered reward system using Solidity and Ethereum ERC-20 tokens. This project integrates smart contracts with a React and Node.js web application to automatically reward users for completing actions.

## Features

- ✅ **ERC-20 Token Contract**: Custom token with minting capabilities
- ✅ **Reward System Contract**: Smart contract for managing reward distribution
- ✅ **Wallet Integration**: MetaMask wallet connection and interaction
- ✅ **Transaction Tracking**: Complete transaction history with blockchain verification
- ✅ **User-Friendly Interface**: Modern, responsive React frontend
- ✅ **Secure Backend API**: Node.js/Express API for reward management
- ✅ **Action-Based Rewards**: Configurable rewards for different user actions

## Project Structure

```
Token Based Reward System/
├── contracts/              # Smart contracts (Solidity)
│   ├── RewardToken.sol    # ERC-20 token contract
│   ├── RewardSystem.sol   # Reward distribution contract
│   ├── scripts/           # Deployment scripts
│   └── hardhat.config.js  # Hardhat configuration
├── backend/               # Node.js backend
│   ├── routes/            # API routes
│   ├── models/            # Database models
│   └── server.js          # Express server
└── frontend/              # React frontend
    ├── src/
    │   ├── components/    # React components
    │   └── App.js         # Main app component
    └── public/
```

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MetaMask browser extension
- MongoDB (for transaction tracking)
- Hardhat (for smart contract development)

## Installation

### 1. Smart Contracts Setup

```bash
cd contracts
npm install
```

Create a `.env` file in the `contracts` directory:
```
PRIVATE_KEY=your_private_key_here
SEPOLIA_URL=https://sepolia.infura.io/v3/your_infura_key
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/reward-system
RPC_URL=http://localhost:8545
PRIVATE_KEY=your_private_key_here
REWARD_TOKEN_ADDRESS=your_deployed_token_address
REWARD_SYSTEM_ADDRESS=your_deployed_system_address
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` directory:
```
REACT_APP_API_URL=http://localhost:5000/api
```

## Deployment

### Deploy Smart Contracts

1. Start a local Hardhat node (for testing):
```bash
cd contracts
npx hardhat node
```

2. Deploy contracts to local network:
```bash
npx hardhat run scripts/deploy.js --network localhost
```

3. Or deploy to Sepolia testnet:
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

4. Copy the deployed contract addresses to your backend `.env` file.

### Generate Contract ABIs

After compiling contracts, copy the ABI files to the backend:
```bash
# From contracts/artifacts/contracts/RewardToken.sol/RewardToken.json
# Copy the "abi" field to backend/abis/RewardToken.json

# From contracts/artifacts/contracts/RewardSystem.sol/RewardSystem.json
# Copy the "abi" field to backend/abis/RewardSystem.json
```

### Run Backend

```bash
cd backend
npm start
# or for development with auto-reload:
npm run dev
```

### Run Frontend

```bash
cd frontend
npm start
```

The application will open at `http://localhost:3000`

## Usage

1. **Connect Wallet**: Click "Connect MetaMask" and approve the connection
2. **View Balance**: See your current token balance
3. **Claim Rewards**: Complete actions and claim rewards:
   - Sign Up
   - Daily Login
   - Refer a Friend
   - Complete Tasks
4. **View Transactions**: Check your complete transaction history

## Available Actions

The system supports the following reward actions (configurable in the smart contract):

- **signup**: 100 RWD tokens
- **login**: 10 RWD tokens
- **referral**: 50 RWD tokens
- **task_complete**: 25 RWD tokens

## API Endpoints

### Rewards
- `GET /api/rewards/balance/:address` - Get token balance
- `POST /api/rewards/distribute` - Distribute reward to user
- `GET /api/rewards/user/:address` - Get user reward history
- `GET /api/rewards/actions` - Get available actions

### Transactions
- `GET /api/transactions/:address` - Get user transactions
- `GET /api/transactions` - Get all transactions (paginated)
- `GET /api/transactions/hash/:hash` - Get transaction by hash

## Smart Contract Functions

### RewardToken
- `mint(address to, uint256 amount)` - Mint tokens to address
- `batchMint(address[] recipients, uint256[] amounts)` - Batch mint tokens

### RewardSystem
- `setActionReward(string action, uint256 amount)` - Set reward for action
- `distributeReward(address user, string action)` - Distribute reward
- `batchDistributeReward(address[] users, string action)` - Batch distribute
- `getUserTotalRewards(address user)` - Get user's total rewards
- `hasClaimedReward(address user, string action)` - Check if reward claimed

## Security Features

- ReentrancyGuard protection
- Access control with Ownable
- Double-claim prevention
- Secure wallet integration
- Transaction verification

## Technologies Used

- **Smart Contracts**: Solidity, Hardhat, OpenZeppelin
- **Backend**: Node.js, Express, MongoDB, Ethers.js
- **Frontend**: React, Ethers.js, Axios
- **Blockchain**: Ethereum (Sepolia testnet or local)

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and questions, please open an issue on the repository.

