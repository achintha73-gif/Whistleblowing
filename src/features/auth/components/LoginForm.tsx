'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, User, Lock, ArrowRight } from 'lucide-react';

type TabType = 'employee' | 'anonymous';

export function LoginForm() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('employee');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed');
        setLoading(false);
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 rounded-lg bg-gray-100 p-1">
        <button
          type="button"
          onClick={() => {
            setActiveTab('employee');
            setError(null);
          }}
          className={`flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition ${
            activeTab === 'employee'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <User className="h-4 w-4" />
          Employee
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab('anonymous');
            setError(null);
          }}
          className={`flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition ${
            activeTab === 'anonymous'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Lock className="h-4 w-4" />
          Anonymous
        </button>
      </div>

      {activeTab === 'employee' && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>

          <div className="text-center">
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Forgot password?
            </Link>
          </div>
        </form>
      )}

      {activeTab === 'anonymous' && (
        <div className="space-y-4">
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100">
                <Shield className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-blue-900">
                  Submit Anonymously
                </h3>
                <p className="mt-1 text-xs text-blue-800">
                  Your identity will be completely hidden. No login required.
                  You will receive a reference code to track your complaint.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2 text-xs text-gray-600">
            <div className="flex items-start gap-2">
              <span className="text-green-600">?</span>
              <span>No personal information required</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600">?</span>
              <span>Receive a reference code to track status</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600">?</span>
              <span>Add additional information later</span>
            </div>
          </div>

          <Link
            href="/anonymous"
            className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
          >
            Continue Anonymously
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {/* Track Complaint link - below tabs, always visible */}
      <div className="border-t border-gray-200 pt-3">
        <Link
          href="/anonymous/track"
          className="flex items-center justify-center gap-1.5 text-xs font-medium text-gray-600 hover:text-gray-900"
        >
          Already submitted anonymously? Track your complaint
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
