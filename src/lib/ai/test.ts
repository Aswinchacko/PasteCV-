import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { extractResume } from "./extractor";

function loadEnvFile(fileName: string): void {
	try {
		const envPath = resolve(process.cwd(), fileName);
		const raw = readFileSync(envPath, "utf8");
		for (const line of raw.split(/\r?\n/)) {
			const trimmed = line.trim();
			if (!trimmed || trimmed.startsWith("#")) continue;
			const eq = trimmed.indexOf("=");
			if (eq === -1) continue;
			const key = trimmed.slice(0, eq).trim();
			let value = trimmed.slice(eq + 1).trim();
			if (
				(value.startsWith('"') && value.endsWith('"')) ||
				(value.startsWith("'") && value.endsWith("'"))
			) {
				value = value.slice(1, -1);
			}
			if (!(key in process.env)) process.env[key] = value;
		}
	} catch {
		// Env files are optional; rely on the shell env if they're missing.
	}
}

loadEnvFile(".env");
loadEnvFile(".env.local");

const SAMPLE_RESUME = `
John Doe
Software Engineer | john@example.com | github.com/johndoe

Summary:
Full-stack developer with 4 years of experience building web apps with React and Node.

Experience:
Acme Corp — Senior Frontend Engineer (2022–Present)
- Built reusable component library used by 5 teams
- Reduced bundle size by 40% through code splitting

StartupXYZ — Full Stack Developer (2020–2022)
- Developed REST APIs with Node.js and PostgreSQL
- Shipped mobile-responsive React app from scratch

Education:
B.Tech Computer Science — NIT Calicut, 2020

Skills: React, Node.js, TypeScript, PostgreSQL, Docker, AWS

Projects:
DevBoard — developer portfolio generator
https://devboard.app
Lets developers paste their resume and get a live portfolio page.
`.trim();

const SPARSE_RESUME = `
Jane Smith
jane@example.com

Worked at Foo Inc 2023-present as a designer.
`.trim();

async function runCase(label: string, text: string): Promise<void> {
	console.log(`\n=== ${label} ===`);
	try {
		const result = await extractResume(text);
		console.log("✓ Extraction successful:\n");
		console.log(JSON.stringify(result, null, 2));
	} catch (err) {
		console.error("✗ Extraction failed:", err);
	}
}

async function main(): Promise<void> {
	console.log("Testing Groq extraction...");
	await runCase("Dense resume (John Doe)", SAMPLE_RESUME);
	await runCase("Sparse resume (Jane Smith)", SPARSE_RESUME);

	console.log("\n=== Empty input (should throw cleanly) ===");
	try {
		await extractResume("");
		console.error("✗ Expected an error for empty input but got none");
	} catch (err) {
		console.log("✓ Threw as expected:", (err as Error).message);
	}
}

main();
