import type { Metadata } from "next";
import AuthProvider from "./providers/AuthProvider";

export const metadata: Metadata = { title: "FairBid", description: "Secure Online Auctions" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{maxWidth:900,margin:"0 auto",padding:"24px",fontFamily:"Inter, system-ui"}}>
        <header style={{display:"flex",justifyContent:"space-between",marginBottom:24}}>
          <h1 style={{fontWeight:700}}>FairBid</h1>
          <nav style={{display:"flex",gap:12}}>
            <a href="/">Auctions</a>
            <a href="/auction/create">Create</a>
            <a href="/login">Login</a>
          </nav>
        </header>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
