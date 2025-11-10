import { ethers } from "ethers"

// Replace these with YOUR ACTUAL deployment values
const constructorArgs = [
  "Contagion Token", // name
  "CONTAGION", // symbol
  "0xYOUR_REFLECTION_POOL_ADDRESS", // _reflectionPool
  "0xYOUR_GAS_POOL_ADDRESS", // _gasPool
  "0xYOUR_DEX_ROUTER_ADDRESS", // _dexRouter
]

// ABI for the constructor
const constructorABI = [
  "constructor(string name, string symbol, address _reflectionPool, address _gasPool, address _dexRouter)",
]

// Encode the constructor arguments
const iface = new ethers.Interface(constructorABI)
const encodedArgs = iface.encodeDeploy(constructorArgs).slice(2) // Remove 0x prefix

console.log("\n=== CONSTRUCTOR ARGUMENTS (ABI-ENCODED) ===\n")
console.log(encodedArgs)
console.log("\n=== Copy this and paste into BSCScan verification ===\n")
