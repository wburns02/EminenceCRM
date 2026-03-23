import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './useAuth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login, isLoggingIn, loginError } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    try {
      await login({ email, password })
      navigate('/')
    } catch {
      // error is captured by loginError
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-body">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="bg-primary-dark rounded-t-xl px-8 py-10 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent-gold text-primary-dark text-2xl font-bold mb-4">
            E
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">EMINENCE</h1>
          <p className="text-primary-light text-sm mt-1">M&A Deal Management Platform</p>
        </div>

        {/* Form */}
        <div className="bg-bg-card rounded-b-xl border border-t-0 border-border shadow-lg px-8 py-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {loginError && (
              <div className="bg-danger/5 border border-danger/20 text-danger text-sm rounded-lg px-4 py-3">
                Invalid email or password. Please try again.
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-medium text-text-primary">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-text-primary">
                  Password
                </label>
                <a
                  href="/forgot-password"
                  className="text-sm text-accent-gold hover:text-accent-gold/80 transition-colors"
                >
                  Forgot password?
                </a>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
              />
            </div>

            <Button
              type="submit"
              loading={isLoggingIn}
              className="w-full bg-accent-gold hover:bg-accent-gold/90 text-primary-dark font-semibold"
              size="lg"
            >
              Sign In
            </Button>
          </form>

          <p className="text-center text-xs text-text-muted mt-6">
            Eminence M&A CRM &mdash; Confidential
          </p>
        </div>
      </div>
    </div>
  )
}
