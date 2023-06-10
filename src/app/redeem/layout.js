import { Providers } from "./providers";

export const metadata = {
  title: "Redeem | Dart",
};

export default function RootLayout({ children }) {
  return (
    <div>
      <Providers>{children}</Providers>
    </div>
  );
}
