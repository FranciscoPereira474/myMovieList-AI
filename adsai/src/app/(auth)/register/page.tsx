import type { Metadata } from "next";
import { AuthForm } from "../_components/auth-form";

export const metadata: Metadata = {
  title: "Sign Up | CineLog",
  description: "Create your CineLog account to start tracking movies and connecting with movie lovers.",
};

/**
 * * Registers a new user with the provided authentication form.
 *  *
 *  * @param {object} props - The component's properties
 *  * @param {string} props.mode - The registration mode (e.g. "register", "login")
 *  *
 *  * @returns {JSX.Element} The AuthForm component rendered in register mode
 */
export default function RegisterPage() {
  return <AuthForm mode="register" />;
}
