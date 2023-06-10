import { Providers } from "./providers";

export const metadata = {
  title: "Mint | Dart",
};

export default function RootLayout({ children }) {
  return (
    <div>
      <Providers>{children}</Providers>
    </div>
  );
}
