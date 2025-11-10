"use client"

import { ethers } from "ethers"

export interface WalletState {
  address: string | null
  balance: string
  connected: boolean
  chainId: number | null
}

export class WalletConnection {
  private provider: ethers.BrowserProvider | null = null
  private signer: ethers.Signer | null = null

  async connect(): Promise<WalletState> {
    if (typeof window === "undefined" || !window.ethereum) {
      throw new Error("MetaMask not installed")
    }

    try {
      this.provider = new ethers.BrowserProvider(window.ethereum)
      await this.provider.send("eth_requestAccounts", [])
      this.signer = await this.provider.getSigner()
      const address = await this.signer.getAddress()
      const balance = await this.provider.getBalance(address)
      const network = await this.provider.getNetwork()

      return {
        address,
        balance: ethers.formatEther(balance),
        connected: true,
        chainId: Number(network.chainId),
      }
    } catch (error) {
      console.error("Wallet connection failed:", error)
      throw error
    }
  }

  async disconnect(): Promise<void> {
    this.provider = null
    this.signer = null
  }

  async getTokenBalance(tokenAddress: string, walletAddress: string): Promise<string> {
    if (!this.provider) throw new Error("Provider not initialized")

    const contract = new ethers.Contract(
      tokenAddress,
      ["function balanceOf(address) view returns (uint256)"],
      this.provider,
    )

    const balance = await contract.balanceOf(walletAddress)
    return ethers.formatEther(balance)
  }

  async burnTokens(tokenAddress: string, amount: string): Promise<string> {
    if (!this.signer) throw new Error("Signer not initialized")

    const contract = new ethers.Contract(tokenAddress, ["function burn(uint256 amount) returns (bool)"], this.signer)

    const tx = await contract.burn(ethers.parseEther(amount))
    await tx.wait()
    return tx.hash
  }

  getProvider() {
    return this.provider
  }

  getSigner() {
    return this.signer
  }
}

export const walletConnection = new WalletConnection()
