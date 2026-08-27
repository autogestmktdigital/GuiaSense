"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Mail, Lock, UserPlus, CreditCard } from "lucide-react";
import { AuthLayout } from "@/components/auth/auth-layout";
import { Field, Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";

function maskDoc(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 14);
  if (digits.length <= 11) {
    return digits
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }
  return digits
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
}

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("A senha deve ter no mínimo 8 caracteres.");
      return;
    }
    const docDigits = cpfCnpj.replace(/\D/g, "");
    if (docDigits.length !== 11 && docDigits.length !== 14) {
      setError("Informe um CPF (11 dígitos) ou CNPJ (14 dígitos) válido.");
      return;
    }
    setLoading(true);
    try {
      await register(name, email, password, docDigits);
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível criar a conta.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Crie sua conta"
      subtitle="Comece a organizar suas finanças em poucos minutos."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Nome" htmlFor="name">
          <div className="relative">
            <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              id="name"
              required
              autoComplete="name"
              placeholder="Como devemos te chamar?"
              className="pl-10"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </Field>

        <Field label="E-mail" htmlFor="email">
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              id="email"
              type="email"
              required
              autoComplete="email"
              placeholder="voce@email.com"
              className="pl-10"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </Field>

        <Field
          label="CPF ou CNPJ"
          htmlFor="cpfCnpj"
          hint="Usado para emissão da nota fiscal."
        >
          <div className="relative">
            <CreditCard className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              id="cpfCnpj"
              required
              inputMode="numeric"
              autoComplete="off"
              placeholder="000.000.000-00"
              className="pl-10"
              value={cpfCnpj}
              onChange={(e) => setCpfCnpj(maskDoc(e.target.value))}
            />
          </div>
        </Field>

        <Field
          label="Senha"
          htmlFor="password"
          hint="Mínimo de 8 caracteres."
        >
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              id="password"
              type="password"
              required
              autoComplete="new-password"
              placeholder="Crie uma senha segura"
              className="pl-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </Field>

        {error && (
          <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm font-medium text-rose-600">{error}</p>
        )}

        <Button type="submit" fullWidth size="lg" loading={loading}>
          <UserPlus className="h-5 w-5" />
          Criar conta
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Já tem uma conta?{" "}
        <Link href="/login" className="font-semibold text-brand-600 hover:underline">
          Entrar
        </Link>
      </p>
    </AuthLayout>
  );
}
