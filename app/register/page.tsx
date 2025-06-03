"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import RegisterForm from "@/components/auth/register-form"

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem("postcraft_token")
    if (token) {
      router.push("/dashboard")
    } else {
      setIsLoading(false)
    }
  }, [router])

  const handleRegisterSuccess = (user: any, token: string) => {
    router.push("/dashboard")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-black"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <RegisterForm onSuccess={handleRegisterSuccess} />
    </div>
  )
}
