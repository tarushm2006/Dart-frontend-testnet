import { Providers } from "./providers";

export const metadata = {
  title: "Profile | Dart",
};

export default function RootLayout({ children }) {
  return (
    <div>
      <Providers>{children}</Providers>
    </div>
  );
}
