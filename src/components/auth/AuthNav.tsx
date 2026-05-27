import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { UserMenu } from "./UserMenu";

/**
 * Server component that picks between "Sign in / Sign up" CTAs and the user
 * dropdown based on session presence. Drop into any header.
 */
export async function AuthNav() {
	const user = await getCurrentUser();

	if (!user) {
		return (
			<div className="flex items-center gap-2">
				<Link
					href="/login"
					className="h-9 inline-flex items-center px-3 rounded-full text-[13px] text-white/70 hover:text-white hover:bg-white/[0.05] transition-colors"
				>
					Sign in
				</Link>
				<Link
					href="/signup"
					className="h-9 inline-flex items-center px-3.5 rounded-full text-[13px] font-medium bg-[var(--color-accent)] text-ink-950 hover:bg-[var(--color-accent-soft)] transition-colors"
				>
					Sign up
				</Link>
			</div>
		);
	}

	return (
		<UserMenu
			email={user.email}
			displayName={user.displayName}
			avatarUrl={user.avatarUrl}
		/>
	);
}
