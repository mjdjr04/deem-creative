import { useState } from 'react'
import { Lock, Loader2 } from 'lucide-react'
import { useAdmin } from '../../context/AdminContext'
import { Button, TextInput, Field } from '../../components/admin/ui'

export default function Login() {
  const { signIn } = useAdmin()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await signIn(email.trim(), password)
    } catch (err) {
      setError(err.message || 'Sign-in failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen bg-hero-gradient flex items-center justify-center px-6">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-2xl bg-brand-mid border border-brand-border p-8"
      >
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-brand-navy border border-brand-accent/40 mx-auto mb-5">
          <Lock className="text-brand-light" size={22} />
        </div>
        <h1 className="text-xl font-bold text-white text-center mb-1">Deem Creative Admin</h1>
        <p className="text-white/55 text-sm text-center mb-6">Sign in to manage your site.</p>

        <Field label="Email">
          <TextInput
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="username"
            required
          />
        </Field>
        <Field label="Password">
          <TextInput
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            required
          />
        </Field>

        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        <Button type="submit" disabled={busy} className="w-full">
          {busy ? <Loader2 size={16} className="animate-spin" /> : null}
          {busy ? 'Signing in…' : 'Sign In'}
        </Button>
      </form>
    </div>
  )
}
