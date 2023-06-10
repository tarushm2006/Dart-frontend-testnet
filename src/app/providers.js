"use client";

import * as React from "react";
import { WagmiConfig } from "wagmi";

import { wagmiConfig } from "./wagmi";

export function Providers({ children }) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  return <WagmiConfig config={wagmiConfig}>{mounted && children}</WagmiConfig>;
}
