"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

interface User {
  id: string
  email: string
  name: string
  avatar_url?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string) => Promise<void>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load user from local storage on initial render
    const storedUser = localStorage.getItem("local-user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate network delay

    // Simple mock authentication: check for a hardcoded user or any input
    if (email === "test@example.com" && password === "password") {
      const mockUser: User = {
        id: "local-user-1",
        email: email,
        name: "Test User",
      }
      localStorage.setItem("local-user", JSON.stringify(mockUser))
      setUser(mockUser)
    } else {
      // For any other input, treat it as a successful sign-in for demo purposes
      // In a real app, you'd validate against stored users
      const mockUser: User = {
        id: `local-user-${Date.now()}`,
        email: email,
        name: email.split("@")[0] || "User",
      }
      localStorage.setItem("local-user", JSON.stringify(mockUser))
      setUser(mockUser)
    }
    setLoading(false)
  }

  const signUp = async (email: string, password: string, name: string) => {
    setLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate network delay

    // Create a new mock user and store in local storage
    const newUser: User = {
      id: `local-user-${Date.now()}`, // Unique ID for demo user
      email: email,
      name: name,
    }
    localStorage.setItem("local-user", JSON.stringify(newUser))
    setUser(newUser)
    setLoading(false)
  }

  const signOut = async () => {
    setLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 300)) // Simulate network delay
    localStorage.removeItem("local-user")
    setUser(null)
    setLoading(false)
  }

  return <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>{children}</AuthContext.Provider>
}
