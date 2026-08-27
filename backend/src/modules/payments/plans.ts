export type PlanId = "mensal" | "semestral" | "anual";

export type Plan = {
  id: PlanId;
  label: string;
  priceBRL: number;
  days: number;
  tagline: string;
  note: string;
  featured?: boolean;
};

export const PLANS: Plan[] = [
  {
    id: "mensal",
    label: "Mensal",
    priceBRL: 24.9,
    days: 30,
    tagline: "Flexibilidade para começar.",
    note: "Valido por 1 mês",
  },
  {
    id: "semestral",
    label: "Semestral",
    priceBRL: 139.0,
    days: 180,
    tagline: "Praticidade no uso, você economiza R$10,40",
    note: "6 meses de acesso.",
  },
  {
    id: "anual",
    label: "Anual",
    priceBRL: 249.0,
    days: 365,
    tagline: "2 meses por nossa conta, você economiza R$49,80",
    note: "12 meses pelo preço de 10.",
    featured: true,
  },
];

export const GRACE_DAYS = 10;
export const TRIAL_DAYS = 8;

export function getPlan(planId?: string): Plan {
  const plan = PLANS.find((item) => item.id === planId);
  if (!plan) {
    throw new Error("Plano inválido.");
  }
  return plan;
}

export function planExpiresFor(plan: Plan, from: Date = new Date()): Date {
  return new Date(from.getTime() + plan.days * 24 * 60 * 60 * 1000);
}