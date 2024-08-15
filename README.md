# DeFi Script: Uniswap and Aave Integration

## Overview of Script

This DeFi script builds upon a basic token swap on Uniswap and introduces additional functionalities by integrating Aave. The script performs the following operations:

1. **Token Swap on Uniswap**: 
    - The user initiates a token swap, exchanging USDC for LINK using Uniswap V3.
    - The script retrieves the necessary pool information from the Uniswap Factory contract, approves the swap router to spend USDC, and then executes the swap.
    - After the swap, the user receives LINK in their wallet.

2. **Supply LINK to Aave**:
    - The script automatically deposits the LINK acquired from the swap into Aave’s lending pool.
    - The user must approve the Aave lending pool to access their LINK.
    - Once deposited, the LINK begins accruing interest within Aave, adding an extra layer of functionality to the basic swap.

### Workflow

- **Step 1**: The user initiates the process by requesting a token swap from USDC to LINK on Uniswap.
- **Step 2**: The Uniswap Router requests approval from the user's wallet to spend USDC.
- **Step 3**: The script retrieves pool information (such as token pair addresses and fee tier) from the Uniswap Factory contract.
- **Step 4**: The Uniswap Router executes the swap, transferring the equivalent amount of LINK to the user's wallet.
- **Step 5**: The user then deposits the LINK into the Aave lending pool, which starts earning interest.

## Diagram Illustration

The diagram below illustrates the sequence of steps and interactions between the protocols, highlighting the flow of assets and operations between Uniswap and Aave:

![DeFi Script Workflow](./Defiscript.drawio.png)

### Components Involved:

- **User**: Initiates the swap and deposit operations.
- **Uniswap Router**: Manages the token swap on Uniswap.
- **Uniswap Factory**: Provides pool information required for the swap.
- **Uniswap Pool**: Executes the swap and transfers LINK to the user.
- **Aave Lending Pool**: Accepts the LINK deposit and manages it within Aave.
- **Aave Protocol**: Handles the accumulation of interest on the deposited LINK.

This diagram captures the complete process and the interaction between multiple DeFi protocols, showcasing the composability and integration potential in the DeFi space.



# Code Explanation

This document provides a comprehensive explanation of the code, detailing the key functions, logic, and how the interactions with Uniswap and Aave are managed.

## Overview

The script is designed to perform a token swap on Uniswap and then automatically deposit the swapped tokens into Aave for earning interest. Below is a breakdown of the major components and functions within the script:

### 1. Setting Up the Environment

The script begins by setting up the environment, including importing necessary libraries and initializing key variables. The `.env` file is used to store sensitive information such as the RPC URL and the user's private key.

### 2. `approveToken` Function

```javascript
async function approveToken(tokenAddress, tokenABI, amount, wallet) {
  const tokenContract = new ethers.Contract(tokenAddress, tokenABI, wallet);
  const approveAmount = ethers.parseUnits(amount.toString(), USDC.decimals);
  const approveTransaction = await tokenContract.approve.populateTransaction(
    SWAP_ROUTER_CONTRACT_ADDRESS,
    approveAmount
  );
  const transactionResponse = await wallet.sendTransaction(
    approveTransaction
  );
  const receipt = await transactionResponse.wait();
}

