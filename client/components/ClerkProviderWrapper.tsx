// app/ClerkProviderWrapper.tsx
'use client';

import { ClerkProvider } from "@clerk/nextjs";

export default function ClerkProviderWrapper({ children }: { children: React.ReactNode }) {
  return <ClerkProvider>{children}</ClerkProvider>;
}