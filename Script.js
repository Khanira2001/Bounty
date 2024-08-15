const { ethers } = require("ethers");
require("dotenv").config();

const {
  USDC_ABI,
  LINK_ABI,
  UNISWAP_FACTORY_ABI,
  UNISWAP_ROUTER_ABI,
  AAVE_LENDING_POOL_ABI,
} = require("./abis");

const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const UNISWAP_FACTORY_ADDRESS = "0x..."; // Sepolia Uniswap V3 Factory address
const UNISWAP_ROUTER_ADDRESS = "0x..."; // Sepolia Uniswap V3 Swap Router address
const AAVE_LENDING_POOL_ADDRESS = "0x..."; // Sepolia Aave Lending Pool address

const USDC = { address: "0x...", decimals: 6 };
const LINK = { address: "0x...", decimals: 18 };

async function approveToken(tokenAddress, tokenABI, spender, amount) {
  const tokenContract = new ethers.Contract(tokenAddress, tokenABI, wallet);
  const approveAmount = ethers.utils.parseUnits(amount.toString(), USDC.decimals);
  const approveTx = await tokenContract.approve(spender, approveAmount);
  await approveTx.wait();
}

async function getPoolInfo(factoryContract, tokenIn, tokenOut) {
  const poolAddress = await factoryContract.getPool(tokenIn.address, tokenOut.address, 3000);
  const poolContract = new ethers.Contract(poolAddress, UNISWAP_POOL_ABI, provider);
  return poolContract;
}

async function swapTokens() {
  const factoryContract = new ethers.Contract(UNISWAP_FACTORY_ADDRESS, UNISWAP_FACTORY_ABI, wallet);
  const swapRouter = new ethers.Contract(UNISWAP_ROUTER_ADDRESS, UNISWAP_ROUTER_ABI, wallet);

  const amountIn = ethers.utils.parseUnits("1", USDC.decimals); // Swap 1 USDC
  await approveToken(USDC.address, USDC_ABI, UNISWAP_ROUTER_ADDRESS, amountIn);

  const poolContract = await getPoolInfo(factoryContract, USDC, LINK);
  const params = {
    tokenIn: USDC.address,
    tokenOut: LINK.address,
    fee: await poolContract.fee(),
    recipient: wallet.address,
    amountIn: amountIn,
    amountOutMinimum: 0,
    sqrtPriceLimitX96: 0,
  };

  const transaction = await swapRouter.exactInputSingle(params);
  await transaction.wait();
  console.log("Swap complete: USDC -> LINK");
}

async function depositToAave(amountInLink) {
  const aaveContract = new ethers.Contract(AAVE_LENDING_POOL_ADDRESS, AAVE_LENDING_POOL_ABI, wallet);
  await approveToken(LINK.address, LINK_ABI, AAVE_LENDING_POOL_ADDRESS, amountInLink);
  const depositTx = await aaveContract.deposit(LINK.address, amountInLink, wallet.address, 0);
  await depositTx.wait();
  console.log("Deposit complete: LINK -> Aave");
}

async function main() {
  await swapTokens();
  const amountInLink = ethers.utils.parseUnits("0.1", LINK.decimals); // Example amount
  await depositToAave(amountInLink);
}

main().catch(console.error);
