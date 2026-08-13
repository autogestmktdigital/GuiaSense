import Link from "next/link";
import { Logo } from "@/components/ui/logo";

export function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-brand-50 via-white to-violet-50 p-4">
      <div className="mb-6">
        <Logo size="lg" />
      </div>
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">{title}</h1>
        <p className="mt-1 mb-6 text-sm text-slate-500">{subtitle}</p>
        {children}
      </div>
      <Link
        href="/"
        className="mt-6 text-sm font-medium text-slate-500 transition-colors hover:text-brand-600"
      >
        ← Voltar para a página inicial
      </Link>
    </div>
  );
}
