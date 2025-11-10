"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { ethers, BrowserProvider } from "ethers"
import { TOKEN_CONFIG } from "@/lib/token-config"

interface WalletContextType {
  address: string | null
  isConnected: boolean
  connect: () => Promise<void>
  disconnect: () => void
  balance: string
  tokenBalance: string
  provider: BrowserProvider | null
  refreshBalance: () => Promise<void>
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null)
  const [balance, setBalance] = useState("0")
  const [tokenBalance, setTokenBalance] = useState("0")
  const [provider, setProvider] = useState<BrowserProvider | null>(null)

  const fetchTokenBalance = async (addr: string, prov: BrowserProvider) => {
    try {
      const contract = new ethers.Contract(TOKEN_CONFIG.address, TOKEN_CONFIG.abi, prov)
      const bal = await contract.balanceOf(addr)
      const formatted = ethers.formatUnits(bal, TOKEN_CONFIG.decimals)
      setTokenBalance(formatted)
    } catch (error) {
      console.error("[v0] Error fetching token balance:", error)
      setTokenBalance("0")
    }
  }

  const refreshBalance = async () => {
    if (address && provider) {
      try {
        const bal = await provider.getBalance(address)
        setBalance(ethers.formatEther(bal))
        await fetchTokenBalance(address, provider)
      } catch (error) {
        console.error("[v0] Error refreshing balance:", error)
      }
    }
  }

  const connect = async () => {
    if (typeof window.ethereum === "undefined") {
      alert("Please install MetaMask to use this feature")
      return
    }

    try {
      const browserProvider = new BrowserProvider(window.ethereum)
      setProvider(browserProvider)

      const accounts = await browserProvider.send("eth_requestAccounts", [])
      const connectedAddress = accounts[0]
      setAddress(connectedAddress)

      const bal = await browserProvider.getBalance(connectedAddress)
      setBalance(ethers.formatEther(bal))

      await fetchTokenBalance(connectedAddress, browserProvider)
    } catch (error) {
      console.error("[v0] Error connecting wallet:", error)
      alert("Failed to connect wallet. Please try again.")
    }
  }

  const disconnect = () => {
    setAddress(null)
    setBalance("0")
    setTokenBalance("0")
    setProvider(null)
  }

  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnect()
        } else {
          setAddress(accounts[0])
          if (provider) {
            fetchTokenBalance(accounts[0], provider)
          }
        }
      })

      window.ethereum.on("chainChanged", () => {
        window.location.reload()
      })
    }

    return () => {
      if (typeof window.ethereum !== "undefined") {
        window.ethereum.removeAllListeners("accountsChanged")
        window.ethereum.removeAllListeners("chainChanged")
      }
    }
  }, [provider])

  useEffect(() => {
    if (!address || !provider) return

    const interval = setInterval(() => {
      refreshBalance()
    }, 10000)

    return () => clearInterval(interval)
  }, [address, provider])

  return (
    <WalletContext.Provider
      value={{
        address,
        isConnected: !!address,
        connect,
        disconnect,
        balance,
        tokenBalance,
        provider,
        refreshBalance,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider")
  }
  return context
}
