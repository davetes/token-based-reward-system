# Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
# Smart Contracts
cd contracts
npm install

# Backend
cd ../backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment Variables

#### Contracts (.env in contracts/)
```
PRIVATE_KEY=your_private_key_here
SEPOLIA_URL=https://sepolia.infura.io/v3/your_infura_key
```

#### Backend (.env in backend/)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/reward-system
RPC_URL=http://localhost:8545
PRIVATE_KEY=your_private_key_here
REWARD_TOKEN_ADDRESS=your_deployed_token_address
REWARD_SYSTEM_ADDRESS=your_deployed_system_address
```

#### Frontend (.env in frontend/)
```
REACT_APP_API_URL=http://localhost:5000/api
```

### 3. Deploy Smart Contracts

#### Option A: Local Development (Hardhat Node)

1. Start Hardhat node:
```bash
cd contracts
npx hardhat node
```

2. In another terminal, deploy contracts:
```bash
cd contracts
npx hardhat run scripts/deploy.js --network localhost
```

3. Copy the deployed addresses to your backend `.env` file.

#### Option B: Sepolia Testne

```bash
cd contracts
npx hardhat run scripts/deploy.js --network sepolia
```

### 4. Update Contract ABIs

After deploying contracts, you need to update the ABI files in the backend:

1. Compile contracts:
```bash
cd contracts
npx hardhat compile
```

2. Copy ABIs from compiled artifacts:
   - `contracts/artifacts/contracts/RewardToken.sol/RewardToken.json` → Copy the `abi` field to `backend/abis/RewardToken.json`
   - `contracts/artifacts/contracts/RewardSystem.sol/RewardSystem.json` → Copy the `abi` field to `backend/abis/RewardSystem.json`

**Note**: The placeholder ABI files are already created, but you should update them with the actual compiled ABIs for full functionality.

### 5. Start MongoDB

Make sure MongoDB is running:
```bash
# Windows
net start MongoDB

# macOS/Linux
mongod
```

Or use MongoDB Atlas (cloud) and update `MONGODB_URI` in backend `.env`.

### 6. Start Backend Server

```bash
cd backend
npm start
# or for development:
npm run dev
```

Server will run on `http://localhost:5000`

### 7. Start Frontend

```bash
cd frontend
npm start
```

Frontend will open at `http://localhost:3000`

## Testing the System

1. **Connect MetaMask**: 
   - Install MetaMask browser extension
   - Connect to the same network (localhost:8545 for local, or Sepolia for testnet)
   - Import an account with test ETH

2. **Connect Wallet**: Click "Connect MetaMask" in the app

3. **Claim Rewards**: Try claiming rewards for different actions

4. **View Transactions**: Check your transaction history

## Troubleshooting

### Contract Deployment Issues
- Ensure you have enough ETH/test ETH in your wallet
- Check that the RPC URL is correct
- Verify private key is set correctly

### Backend Connection Issues
- Ensure MongoDB is running
- Check that contract addresses in `.env` are correct
- Verify RPC_URL matches your network

### Frontend Issues
- Ensure backend is running on port 5000
- Check browser console for errors
- Verify MetaMask is installed and connected

### ABI Issues
- Make sure to update ABI files after contract compilation
- Verify ABI files are valid JSON
- Check that contract addresses match deployed contracts

## Next Steps

- Customize reward amounts in the smart contract
- Add more reward actions
- Implement additional features
- Deploy to mainnet (after thorough testing)

