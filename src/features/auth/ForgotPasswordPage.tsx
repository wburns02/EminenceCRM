import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ArrowLeft, Mail } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    // TODO: Call API endpoint
    setSubmitted(true)
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
          <p className="text-primary-light text-sm mt-1">Reset Your Password</p>
        </div>

        {/* Form */}
        <div className="bg-bg-card rounded-b-xl border border-t-0 border-border shadow-lg px-8 py-8">
          {submitted ? (
            <div className="text-center py-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-success/10 mb-4">
                <Mail className="h-6 w-6 text-success" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">Check your email</h3>
              <p className="text-sm text-text-secondary mb-6">
                If an account with that email exists, we sent password reset instructions.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm text-accent-gold hover:text-accent-gold/80"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <p className="text-sm text-text-secondary">
                Enter the email associated with your account and we will send a link to reset your password.
              </p>

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
                  autoFocus
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-accent-gold hover:bg-accent-gold/90 text-primary-dark font-semibold"
                size="lg"
              >
                Send Reset Link
              </Button>

              <div className="text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
