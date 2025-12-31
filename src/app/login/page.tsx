import { AuthForms } from "@/components/AuthForms";
import { AnimatedGlobe } from "@/components/AnimatedGlobe";

export default function LoginPage() {
    return (
        <main className="relative min-h-screen flex items-center justify-center p-6">
            <AnimatedGlobe />
            <AuthForms mode="login" />
        </main>
    );
}
