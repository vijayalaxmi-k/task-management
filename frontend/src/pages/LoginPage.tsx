import { useState } from 'react';
import type { FormEvent } from 'react';
import { login, register } from '../api/auth';

interface LoginPageProps {
  onLogin: () => void;
}

interface ApiValidationError {
  response?: {
    status?: number;
    data?: {
      message?: string;
      errors?: Record<string, string[]>;
    };
  };
}

function extractErrorMessage(err: unknown, fallback: string): string {
  const response = (err as ApiValidationError).response;
  const firstFieldError = response?.data?.errors
    ? Object.values(response.data.errors)[0]?.[0]
    : undefined;

  return firstFieldError ?? response?.data?.message ?? fallback;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function toggleMode() {
    setMode((current) => (current === 'login' ? 'register' : 'login'));
    setError('');
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response =
        mode === 'login'
          ? await login(email, password)
          : await register(name, email, password, passwordConfirmation);

      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));

      onLogin();
    } catch (err) {
      setError(
        extractErrorMessage(
          err,
          mode === 'login'
            ? 'Invalid email or password.'
            : 'Could not create account. Check your details and try again.',
        ),
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-layout">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Task Management</h1>
          <p className="auth-subtitle">
            {mode === 'login'
              ? 'Sign in to manage your tasks'
              : 'Create an account to get started'}
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {mode === 'register' && (
            <div className="field">
              <label htmlFor="name">Full name</label>
              <input
                id="name"
                type="text"
                className="input"
                placeholder="Jane Doe"
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoComplete="name"
                required
              />
            </div>
          )}

          <div className="field">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              className="input"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="input"
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete={
                mode === 'login' ? 'current-password' : 'new-password'
              }
              required
            />
          </div>

          {mode === 'register' && (
            <div className="field">
              <label htmlFor="password_confirmation">Confirm password</label>
              <input
                id="password_confirmation"
                type="password"
                className="input"
                placeholder="••••••••"
                value={passwordConfirmation}
                onChange={(event) =>
                  setPasswordConfirmation(event.target.value)
                }
                autoComplete="new-password"
                required
              />
            </div>
          )}

          {error && (
            <p className="alert alert-error" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading
              ? mode === 'login'
                ? 'Signing in…'
                : 'Creating account…'
              : mode === 'login'
                ? 'Sign in'
                : 'Create account'}
          </button>
        </form>

        <button type="button" className="auth-switch" onClick={toggleMode}>
          {mode === 'login'
            ? "Don't have an account? Sign up"
            : 'Already have an account? Sign in'}
        </button>
      </div>
    </main>
  );
}
