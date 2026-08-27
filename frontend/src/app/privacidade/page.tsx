import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Logo } from "@/components/ui/logo";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-100 bg-white">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-4 sm:px-6">
          <Logo size="sm" />
          <Link href="/" className="text-sm font-medium text-brand-600 hover:underline">
            Voltar
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
        <div className="mb-6 flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-brand-600" />
          <h1 className="text-2xl font-bold text-slate-900">Política de Privacidade</h1>
        </div>
        <p className="text-sm text-slate-500">GuiaSense · DevCerto Tecnologia LTDA</p>

        <div className="prose mt-6 space-y-6 text-sm leading-relaxed text-slate-700">
          <section>
            <h2 className="mb-2 text-lg font-semibold text-slate-900">1. Responsável pelo tratamento</h2>
            <p>
              A <strong>DevCerto Tecnologia LTDA</strong>, CNPJ 68.827.410/0001-44, é a
              controladora dos dados pessoais tratados pelo aplicativo <strong>GuiaSense</strong>.
              Para questões de privacidade, fale conosco em <strong>lgpd@devcerto.com</strong>.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-slate-900">2. Dados que coletamos</h2>
            <ul className="list-inside list-disc space-y-1">
              <li>Nome, e-mail e senha (acesso).</li>
              <li>CPF ou CNPJ.</li>
              <li>Endereço de cobrança (CEP, logradouro, número, complemento, bairro, cidade e UF).</li>
              <li>Dados financeiros informados por você (movimentações, categorias, orçamentos).</li>
              <li>Dados de pagamento são processados diretamente pelo Mercado Pago — <strong>não armazenamos dados de cartão</strong>.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-slate-900">3. Para que usamos</h2>
            <ul className="list-inside list-disc space-y-1">
              <li>Prestar o serviço e operar sua conta.</li>
              <li>Cumprir obrigações fiscais, incluindo a <strong>emissão de nota fiscal (NFS-e)</strong>.</li>
              <li>Cobrança e gestão de assinaturas.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-slate-900">4. Base legal (LGPD)</h2>
            <ul className="list-inside list-disc space-y-1">
              <li>Execução de contrato (art. 7º, V).</li>
              <li>Cumprimento de obrigação legal/tributária (art. 7º, II).</li>
              <li>Consentimento, conforme registrado no cadastro.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-slate-900">5. Compartilhamento e segurança</h2>
            <p>
              Seus dados não são vendidos. Compartilhamos apenas com o provedor de pagamento
              (Mercado Pago) e, quando exigido, com as autoridades fiscais. Adotamos criptografia
              para dados sensíveis (dados fiscais cifrados no armazenamento) e conexão segura (HTTPS).
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-slate-900">6. Retenção</h2>
            <p>
              Os dados são mantidos enquanto sua conta estiver ativa. Dados fiscais (CPF/CNPJ e
              endereço) são retidos pelo prazo exigido pela legislação tributária para fins de
              auditoria e emissão/quebra de notas fiscais.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-slate-900">7. Seus direitos (LGPD art. 18)</h2>
            <p>Você pode solicitar, a qualquer momento:</p>
            <ul className="list-inside list-disc space-y-1">
              <li>Confirmação e acesso aos seus dados.</li>
              <li>Correção de dados incompletos ou desatualizados.</li>
              <li>Anonimização, bloqueio ou eliminação de dados desnecessários.</li>
              <li>Portabilidade (quando aplicável).</li>
              <li>Informações sobre compartilhamento.</li>
            </ul>
            <p className="mt-2">
              Para exercer seus direitos, envie e-mail para <strong>lgpd@devcerto.com</strong>.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-slate-900">8. Contato do Encarregado (DPO)</h2>
            <p>
              Encarregado de Proteção de Dados: <strong>Peterson Ribeiro</strong> —{" "}
              <strong>lgpd@devcerto.com</strong>.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}