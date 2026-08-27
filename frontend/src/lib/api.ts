"use client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export const TOKEN_KEY = "guiasense_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  window.localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!response.ok) {
    let message = "Algo deu errado. Tente novamente.";
    try {
      const body = (await response.json()) as { message?: string; error?: string; details?: unknown };
      message = body.message ?? body.error ?? message;
      throw new ApiError(response.status, message, body.details);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(response.status, message);
    }
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

type AuthResponse = {
  token: string;
  user: PublicUser;
};

export type PublicUser = {
  id: string;
  name: string;
  email: string;
  accessStatus: "LIBERADO" | "PAGAMENTO_PENDENTE" | "BLOQUEADO" | "CANCELADO";
  role?: "USER" | "ADMIN";
  hasSeenWelcome: boolean;
  trialExpiresAt: string | null;
  createdAt: string;
};

export type TransactionType = "INCOME" | "EXPENSE";

export type Category = {
  id: string;
  name: string;
  type: TransactionType;
  icon: string;
  color: string;
  isDefault: boolean;
};

export type Transaction = {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  subcategory?: string | null;
  date: string;
  categoryId: string;
  category: Category;
  paid: boolean;
  paidAt?: string | null;
  seriesId?: string | null;
  seriesIndex?: number | null;
  seriesTotal?: number | null;
};

export type Alert = {
  id: string;
  type: string;
  severity: "INFO" | "WARNING" | "DANGER";
  message: string;
  status: "ACTIVE" | "READ" | "DISMISSED";
  createdAt: string;
};

export type Insight = {
  title: string;
  message: string;
  tone: "positive" | "neutral" | "attention";
};

export type UpcomingPayment = {
  id: string;
  date: string;
  subcategory: string | null;
  description: string;
  amount: number;
  overdue: boolean;
};

export type TopExpensesPeriod = "month" | "quarter" | "semester";

export type TopExpense = {
  categoryId: string;
  categoryName: string;
  icon: string;
  color: string;
  amount: number;
  percent: number;
};

export type Overview = {
  month: string;
  totals: {
    income: number;
    expense: number;
    balance: number;
    projectedBalance: number;
    receivedIncome: number;
    pendingIncome: number;
    paidExpense: number;
    pendingExpense: number;
  };
  topExpenses: TopExpense[];
  recent: Transaction[];
  series: { month: string; income: number; expense: number }[];
};

export const authApi = {
  register: (body: { name: string; email: string; password: string }) =>
    apiFetch<AuthResponse>("/auth/register", { method: "POST", body: JSON.stringify(body) }),
  login: (body: { email: string; password: string }) =>
    apiFetch<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  me: () => apiFetch<{ user: PublicUser }>("/auth/me"),
};

export const usersApi = {
  update: (body: { name: string }) =>
    apiFetch<{ user: PublicUser }>("/users/me", { method: "PATCH", body: JSON.stringify(body) }),
  cancelSubscription: () =>
    apiFetch<{ user: PublicUser }>("/users/cancel-subscription", { method: "POST" }),
  dismissWelcome: () =>
    apiFetch<{ user: { id: string; hasSeenWelcome: boolean } }>("/users/welcome", { method: "PATCH" }),
};

export type AdminOverview = {
  totals: {
    users: number;
    approvedPaymentsLast30d: number;
    newUsersLast30d: number;
    revenue: number;
    revenueCurrentMonth: number;
  };
  users: {
    total: number;
    byAccess: Record<string, number>;
    byRole: Record<string, number>;
  };
  payments: {
    byStatus: Record<string, number>;
  };
  recentUsers: {
    id: string;
    name: string;
    email: string;
    accessStatus: string;
    role: string;
    createdAt: string;
    transactions: number;
  }[];
  recentPayments: {
    id: string;
    status: string;
    plan: string;
    amountBRL: number;
    createdAt: string;
    userName: string | null;
  }[];
};

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  accessStatus: string;
  role: string;
  createdAt: string;
  trialExpiresAt: string | null;
  transactions: number;
  monthsHired: number;
  lastPayment: { status: string; plan: string; amountBRL: string; createdAt: string } | null;
};

export type AdminRevenueMonth = {
  month: string;
  amountBRL: number;
};

export type AdminUsersMonth = {
  month: string;
  newUsers: number;
  payingUsers: number;
};

export type AdminUserPayment = {
  id: string;
  status: string;
  plan: string;
  amountBRL: number;
  createdAt: string;
};

export type AdminUserDetail = {
  user: {
    id: string;
    name: string;
    email: string;
    accessStatus: string;
    role: string;
    createdAt: string;
    planExpiresAt: string | null;
    trialExpiresAt: string | null;
  };
  monthsHired: number;
  currentPlan: string | null;
  payments: AdminUserPayment[];
};

export const adminApi = {
  overview: () => apiFetch<AdminOverview>("/admin/overview"),
  users: () => apiFetch<{ users: AdminUser[] }>("/admin/users"),
  revenue: () => apiFetch<{ months: AdminRevenueMonth[] }>("/admin/revenue"),
  usersByMonth: () => apiFetch<{ months: AdminUsersMonth[] }>("/admin/users-by-month"),
  userDetail: (userId: string) => apiFetch<AdminUserDetail>(`/admin/users/${userId}`),
  setUserRole: (userId: string, role: "ADMIN" | "USER", code?: string) =>
    apiFetch<{ user: { id: string; email: string; role: string } }>(`/admin/users/${userId}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role, code }),
    }),
  grantBonus: (userId: string, days: number) =>
    apiFetch<{
      user: {
        id: string;
        name: string;
        email: string;
        accessStatus: string;
        planExpiresAt: string | null;
      };
    }>(`/admin/users/${userId}/bonus`, {
      method: "POST",
      body: JSON.stringify({ days }),
    }),
};

export const categoriesApi = {
  list: (type?: TransactionType) =>
    apiFetch<{ categories: Category[] }>(`/categories${type ? `?type=${type}` : ""}`),
  create: (body: { name: string; type: TransactionType; icon?: string; color?: string }) =>
    apiFetch<{ category: Category }>("/categories", { method: "POST", body: JSON.stringify(body) }),
};

export const transactionsApi = {
  list: (month?: string) =>
    apiFetch<{ transactions: Transaction[] }>(`/transactions${month ? `?month=${month}` : ""}`),
  create: (body: { type: TransactionType; amount: number; description: string; subcategory?: string; date: string; categoryId: string; paid?: boolean; repetitions?: number }) =>
    apiFetch<{ transaction: Transaction; created?: number }>("/transactions", { method: "POST", body: JSON.stringify(body) }),
  update: (id: string, body: Partial<{ type: TransactionType; amount: number; description: string; subcategory?: string; date: string; categoryId: string; paid?: boolean; paidAt?: string }>) =>
    apiFetch<{ transaction: Transaction }>(`/transactions/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  remove: (id: string) => apiFetch<{ ok: boolean }>(`/transactions/${id}`, { method: "DELETE" }),
};

export const alertsApi = {
  list: (status?: string) =>
    apiFetch<{ alerts: Alert[] }>(`/alerts${status ? `?status=${status}` : ""}`),
  markRead: (id: string) => apiFetch<{ alert: Alert }>(`/alerts/${id}/read`, { method: "PATCH" }),
  dismiss: (id: string) => apiFetch<{ alert: Alert }>(`/alerts/${id}/dismiss`, { method: "PATCH" }),
};

export const dashboardApi = {
  overview: () => apiFetch<{ overview: Overview }>("/dashboard/overview"),
  topExpenses: (month: string, period: TopExpensesPeriod) =>
    apiFetch<{ month: string; period: TopExpensesPeriod; total: number; topExpenses: TopExpense[] }>(
      `/dashboard/top-expenses?month=${month}&period=${period}`,
    ),
  categoryExpenses: (month: string, period: TopExpensesPeriod, categoryId: string) =>
    apiFetch<{
      month: string;
      period: TopExpensesPeriod;
      categoryId: string;
      categoryName: string;
      icon: string;
      color: string;
      total: number;
      items: { id: string; description: string | null; subcategory: string | null; amount: number; paid: boolean; date: string }[];
    }>(`/dashboard/category-expenses?month=${month}&period=${period}&categoryId=${categoryId}`),
  upcomingPayments: () => apiFetch<{ total: number; items: UpcomingPayment[] }>("/dashboard/upcoming-payments"),
};

export const insightsApi = {
  list: () => apiFetch<{ insights: Insight[] }>("/insights"),
};

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

export type PaymentStatusResponse = {
  accessStatus: PublicUser["accessStatus"];
  paymentStatus: string | null;
  planExpiresAt: string | null;
  trialExpiresAt: string | null;
  lastPayment: { id: string; status: string; plan: string; amountBRL: string; createdAt: string } | null;
};

export const paymentsApi = {
  plans: () => apiFetch<{ plans: Plan[] }>("/payments/plans"),
  status: () => apiFetch<PaymentStatusResponse>("/payments/status"),
  checkout: (plan: PlanId) =>
    apiFetch<{ mode: "simulated" | "mercadopago"; paymentId: string; initPoint?: string }>(
      "/payments/checkout",
      { method: "POST", body: JSON.stringify({ plan }) },
    ),
  simulate: (paymentId: string) =>
    apiFetch<{ ok: boolean }>(`/payments/simulate/${paymentId}`, { method: "POST", body: JSON.stringify({}) }),
};
