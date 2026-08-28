"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";

type FaqItem = {
  question: string;
  answer: React.ReactNode;
};

const faqItems: FaqItem[] = [
  {
    question: "Preciso cadastrar cartão de crédito para testar?",
    answer:
      "Não. Você pode usar o GuiaSense gratuitamente por 8 dias sem cadastrar cartão de crédito.",
  },
  {
    question: "Vou ser cobrado automaticamente depois dos 8 dias?",
    answer:
      "Não. Ao final do período gratuito, você só paga se decidir contratar um dos planos do GuiaSense.",
  },
  {
    question: "O que acontece quando terminam os 8 dias grátis?",
    answer:
      "Se você quiser continuar utilizando o GuiaSense, poderá escolher um dos planos disponíveis. Caso não contrate um plano, seu acesso será interrompido após o período gratuito, sem cobrança automática.",
  },
  {
    question: "Preciso conectar minha conta bancária?",
    answer:
      "Não. O GuiaSense não precisa acessar sua conta bancária. Você registra as movimentações e informações financeiras que deseja acompanhar.",
  },
  {
    question: "Preciso entender de finanças para usar?",
    answer:
      "Não. O GuiaSense foi criado para ser simples. Você registra suas entradas, saídas e contas do dia a dia, e acompanha tudo de forma visual, com alertas e orientações quando algo merece sua atenção.",
  },
  {
    question: "Os planos Mensal, Semestral e Anual têm recursos diferentes?",
    answer:
      "Não. Todos os planos dão acesso completo ao GuiaSense. O que muda é apenas o período contratado e o valor.",
  },
  {
    question: "Posso usar o GuiaSense pelo celular?",
    answer:
      "Sim. O GuiaSense pode ser utilizado pelo celular, computador ou tablet através do navegador.",
  },
  {
    question: "Como meus dados são tratados?",
    answer: (
      <span>
        O GuiaSense utiliza os dados necessários para prestar o serviço de acordo com sua{" "}
        <Link
          href="/privacidade"
          className="rounded-sm font-semibold text-brand-600 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
        >
          Política de Privacidade
        </Link>
        . Você pode consultar a política completa a qualquer momento.
      </span>
    ),
  },
];

export function LandingFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Ficou alguma{" "}
          <span className="bg-gradient-to-r from-brand-600 to-violet-600 bg-clip-text text-transparent">
            dúvida
          </span>
          ?
        </h2>
        <p className="mt-3 text-lg text-slate-600">As principais respostas antes de você começar.</p>
      </div>

      <div className="mx-auto mt-10 max-w-3xl">
        <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
          {faqItems.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={item.question} className="border-b border-slate-100 last:border-b-0">
                <h3>
                  <button
                    type="button"
                    id={`faq-trigger-${index}`}
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${index}`}
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left transition-colors hover:bg-slate-50/80 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-600 sm:px-6"
                  >
                    <span className="text-base font-semibold text-slate-900 sm:text-lg">
                      {item.question}
                    </span>
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors ${
                        isOpen ? "bg-brand-50 text-brand-600" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      <Plus
                        className={`h-4 w-4 transition-transform duration-200 ${
                          isOpen ? "rotate-45" : ""
                        }`}
                      />
                    </span>
                  </button>
                </h3>
                <div
                  id={`faq-panel-${index}`}
                  role="region"
                  aria-labelledby={`faq-trigger-${index}`}
                  inert={!isOpen}
                  className={`grid transition-[grid-template-rows] duration-200 ease-out ${
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-5 pb-5 sm:px-6">
                      <p className="text-base leading-relaxed text-slate-600">{item.answer}</p>
                      {index === faqItems.length - 1 && (
                        <Link
                          href="/privacidade"
                          className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
                        >
                          Ver Política de Privacidade
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}