import { Shield, Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-blue-100 via-purple-100 to-gray-100">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-blue-300/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-purple-300/30 blur-3xl" />

      <div className="relative z-10 flex flex-col items-center gap-4">
        {/* Logo */}
        <div className="relative">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-lg shadow-blue-500/30">
            <Shield className="h-8 w-8 text-white" strokeWidth={2.5} />
          </div>
          <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-white shadow-md">
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
          </div>
        </div>

        {/* Text */}
        <div className="text-center">
          <p className="text-sm font-semibold text-gray-900">Loading...</p>
          <p className="mt-0.5 text-xs text-gray-500">
            Please wait a moment
          </p>
        </div>

        {/* Skeleton dots */}
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400 [animation-delay:0ms]" />
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-400 [animation-delay:150ms]" />
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-purple-400 [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}