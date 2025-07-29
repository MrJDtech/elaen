"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

interface User {
  id: string
  email: string
  name: string
  avatar_url?: string
  profile?: {
    bio?: string
    joinDate: string
    coursesCompleted: number
    certificatesEarned: string[]
    friends: string[]
    skillLevel: string
    preferredSubjects: string[]
  }
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
    try {
      await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate network delay

      // Check if user exists in stored users
      const storedUsers = JSON.parse(localStorage.getItem("all-users") || "[]")
      const existingUser = storedUsers.find((u: User) => u.email === email)

      if (existingUser) {
        // For demo purposes, accept any password for existing users
        localStorage.setItem("local-user", JSON.stringify(existingUser))
        setUser(existingUser)
      } else {
        throw new Error("User not found. Please sign up first.")
      }
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, name: string) => {
    setLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate network delay

    // Check if user already exists
    const storedUsers = JSON.parse(localStorage.getItem("all-users") || "[]")
    const existingUser = storedUsers.find((u: User) => u.email === email)
    
    if (existingUser) {
      throw new Error("User already exists with this email")
    }

    // Create a new user with enhanced profile
    const newUser: User = {
      id: `user-${Date.now()}`,
      email: email,
      name: name,
      profile: {
        bio: "",
        joinDate: new Date().toISOString(),
        coursesCompleted: 0,
        certificatesEarned: [],
        friends: [],
        skillLevel: "Beginner",
        preferredSubjects: []
      }
    }
    
    // Store in users collection
    const updatedUsers = [...storedUsers, newUser]
    localStorage.setItem("all-users", JSON.stringify(updatedUsers))
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
