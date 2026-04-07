const ASAAS_API_KEY = process.env.ASAAS_API_KEY!;
const ASAAS_BASE_URL = process.env.ASAAS_BASE_URL || "https://api-sandbox.asaas.com/v3";

interface AsaasCustomer {
  id: string;
  name: string;
  email: string;
  cpfCnpj: string;
}

interface AsaasSubscription {
  id: string;
  customer: string;
  billingType: string;
  value: number;
  nextDueDate: string;
  cycle: string;
  status: string;
  dateCreated: string;
}

async function asaasFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${ASAAS_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      access_token: ASAAS_API_KEY,
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    let detail = body;
    try {
      const parsed = JSON.parse(body);
      if (parsed.errors?.length) {
        detail = parsed.errors.map((e: { description?: string; code?: string }) => e.description || e.code).join("; ");
      }
    } catch { /* keep raw body */ }
    throw new Error(`Asaas API error ${res.status}: ${detail}`);
  }

  return res.json();
}

export async function createCustomer(data: {
  name: string;
  email: string;
  cpfCnpj: string;
  phone?: string;
}): Promise<AsaasCustomer> {
  return asaasFetch<AsaasCustomer>("/customers", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function findCustomerByEmail(email: string): Promise<AsaasCustomer | null> {
  const res = await asaasFetch<{ data: AsaasCustomer[] }>(`/customers?email=${encodeURIComponent(email)}`);
  return res.data?.[0] ?? null;
}

export async function createSubscription(data: {
  customer: string;
  billingType: "BOLETO" | "CREDIT_CARD" | "PIX" | "UNDEFINED";
  value: number;
  nextDueDate: string;
  cycle: "MONTHLY";
  description: string;
  externalReference?: string;
}): Promise<AsaasSubscription> {
  return asaasFetch<AsaasSubscription>("/subscriptions", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getSubscription(subscriptionId: string): Promise<AsaasSubscription> {
  return asaasFetch<AsaasSubscription>(`/subscriptions/${subscriptionId}`);
}

interface AsaasPayment {
  id: string;
  status: string;
  invoiceUrl: string;
  bankSlipUrl?: string;
  value: number;
  dueDate: string;
  externalReference?: string;
}

export async function getSubscriptionPayments(subscriptionId: string): Promise<AsaasPayment[]> {
  const res = await asaasFetch<{ data: AsaasPayment[] }>(`/subscriptions/${subscriptionId}/payments`);
  return res.data ?? [];
}

export async function updateSubscription(
  subscriptionId: string,
  data: { value?: number; nextDueDate?: string; billingType?: string; externalReference?: string }
): Promise<AsaasSubscription> {
  return asaasFetch<AsaasSubscription>(`/subscriptions/${subscriptionId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function cancelSubscription(subscriptionId: string): Promise<{ deleted: boolean }> {
  return asaasFetch<{ deleted: boolean }>(`/subscriptions/${subscriptionId}`, {
    method: "DELETE",
  });
}
