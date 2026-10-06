'use client';

import { useState } from 'react';
import { User, Lock } from 'lucide-react';
import { EmployeeLoginForm } from './EmployeeLoginForm';
import { AnonymousLoginTab } from './AnonymousLoginTab';

type Tab = 'employee' | 'anonymous';

export function LoginForm() {
  const [tab, setTab] = useState<Tab>('employee');

  return (
    <div className="space-y-5">
      {/* Tab switcher */}
      <div className="flex rounded-lg border border-gray-200 bg-gray-50 p-1">
        <button
          type="button"
          onClick={() => setTab('employee')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition ${
            tab === 'employee'
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <User className="h-4 w-4" />
          Employee
        </button>
        <button
          type="button"
          onClick={() => setTab('anonymous')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition ${
            tab === 'anonymous'
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Lock className="h-4 w-4" />
          Anonymous
        </button>
      </div>

      {/* Tab content */}
      {tab === 'employee' ? <EmployeeLoginForm /> : <AnonymousLoginTab />}
    </div>
  );
}