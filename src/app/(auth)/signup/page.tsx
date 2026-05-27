import { Suspense } from "react";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata = {
	title: "Sign up · pastecv",
};

export default function SignupPage() {
	return (
		<Suspense fallback={null}>
			<AuthForm mode="signup" />
		</Suspense>
	);
}
