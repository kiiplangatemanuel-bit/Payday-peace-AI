import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "Payday Peace AI", description: "A calmer way to plan every paycheck and bill." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
