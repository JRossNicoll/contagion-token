# Remix Deployment Guide - Contagion Token

## Step 1: Prepare Remix IDE

1. Go to https://remix.ethereum.org
2. Create a new workspace or use the default one
3. In the File Explorer, create a new file: `ContagionToken.sol`
4. Copy and paste the entire contract code from `contracts/ContagionToken.sol`

## Step 2: Install OpenZeppelin Dependencies

Since the contract imports OpenZeppelin contracts, Remix needs to download them:

1. The contract has these imports:
```solidity
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
