import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
	subsets: ["latin"],
	variable: "--font-inter",
	display: "swap",
});

const mono = JetBrains_Mono({
	subsets: ["latin"],
	variable: "--font-jetbrains",
	display: "swap",
});

export const metadata: Metadata = {
	title: "PasteCV — Resume to portfolio in 12 seconds",
	description:
		"Paste your resume. Get a clean, shareable portfolio link. No accounts. No fluff.",
	metadataBase: new URL(
		process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000",
	),
	openGraph: {
		title: "PasteCV — Resume to portfolio in 12 seconds",
		description:
			"Paste your resume. Get a clean, shareable portfolio link. No accounts. No fluff.",
		type: "website",
	},
};

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="en" className={`${inter.variable} ${mono.variable}`}>
			<body className="font-sans antialiased min-h-screen bg-ink-950 text-white">
				{children}
			</body>
		</html>
	);
}
