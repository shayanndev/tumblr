'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

function LoginForm() {
  const searchParams = useSearchParams()
  const registered = searchParams.get('registered')
  const confirm = searchParams.get('confirm')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      router.push('/')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Failed to login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-900 rounded-lg p-8 border border-gray-800">
          <h1 className="text-2xl font-bold mb-6 text-center">tumblR</h1>
          {registered && !confirm && (
            <div className="mb-4 p-3 bg-green-900/50 border border-green-700 rounded-lg text-sm text-green-400">
              Account created successfully! Please log in.
            </div>
          )}
          {confirm && (
            <div className="mb-4 p-3 bg-blue-900/50 border border-blue-700 rounded-lg text-sm text-blue-400">
              Please check your email and confirm your account before logging in.
            </div>
          )}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
              />
            </div>
            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg font-medium transition"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-400">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-blue-500 hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-black px-4">
        <div className="w-full max-w-md">
          <div className="bg-gray-900 rounded-lg p-8 border border-gray-800">
            <h1 className="text-2xl font-bold mb-6 text-center">tumblR</h1>
            <div className="text-center text-gray-400">Loading...</div>
          </div>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}


