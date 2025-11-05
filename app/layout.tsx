import "./globals.css";
import Providers from "@/components/Providers";
import AppHeader from "@/components/AppHeader";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv">
      <body>
        <Providers>
          <AppHeader />
          <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
        </Providers>
      </body>
    </html>
  );
}