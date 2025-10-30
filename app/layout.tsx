import "./globals.css";
import { UserProvider } from "@/contexts/user";

export const metadata = { title: "Bnb", description: "Bnb app" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv">
      <body>
        <UserProvider>{children}</UserProvider>
      </body>
    </html>
  );
}