"use client";

import { API_URL } from "./config";
import type { AuthUser } from "./types";

const TOKEN_KEY = "inzerv.token";
const USER_KEY = "inzerv.user";

export function getSession(): { token: string; user: AuthUser } | null {
  try {
    const token = sessionStorage.getItem(TOKEN_KEY);
    const user = sessionStorage.getItem(USER_KEY);
    return token && user ? { token, user: JSON.parse(user) } : null;
  } catch {
    return null;
  }
}

export function saveSession(token: string, user: AuthUser) {
  try {
    sessionStorage.setItem(TOKEN_KEY, token);
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    /* storage blocked: session lasts for this page only */
  }
}

export function clearSession() {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  } catch {
    /* ignore */
  }
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

async function request<T>(
  path: string,
  init: RequestInit & { token?: string } = {},
): Promise<T> {
  const { token, headers, ...rest } = init;
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...rest,
      headers: {
        ...(rest.body && !(rest.body instanceof FormData)
          ? { "Content-Type": "application/json" }
          : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
    });
  } catch {
    throw new ApiError("network", 0);
  }

  const text = await res.text();
  const data = text ? safeParse(text) : null;
  if (!res.ok) {
    const raw = (data as { message?: string | string[] } | null)?.message;
    const message = Array.isArray(raw) ? raw.join(", ") : (raw ?? `HTTP ${res.status}`);
    throw new ApiError(message, res.status);
  }
  return data as T;
}

function safeParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

type AuthResponse = { user: AuthUser; accessToken: string };

const realApi = {
  login: (email: string, password: string) =>
    request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  register: (body: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone: string;
    countryOfResidence?: string;
  }) => request<AuthResponse>("/auth/register", { method: "POST", body: JSON.stringify(body) }),

  createRequest: (
    token: string,
    body: {
      serviceId: string;
      requestFor: "myself" | "another_person";
      fieldValues: { fieldKey: string; value: string }[];
      numberOfCopies: number;
      deliveryDestinationId: string;
      recipientName: string;
      recipientPhone: string;
      deliveryCity: string;
      deliveryAddress: string;
      deliveryGovernorate?: string;
      deliveryPostalCode?: string;
    },
  ) =>
    request<{ id: string; referenceNumber: string; totalAmount: number | string }>("/requests", {
      method: "POST",
      token,
      body: JSON.stringify(body),
    }),

  uploadDocument: (token: string, requestId: string, key: string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return request<unknown>(`/requests/${requestId}/documents?key=${encodeURIComponent(key)}`, {
      method: "POST",
      token,
      body: form,
    });
  },

  pay: (token: string, requestId: string, paymentMethod: "card" | "wallet") =>
    request<{ transactionRef: string }>("/payments", {
      method: "POST",
      token,
      body: JSON.stringify({ requestId, paymentMethod }),
    }),
};

/**
 * Demo mode (NEXT_PUBLIC_CHECKOUT_DEMO=true): the checkout runs entirely in the browser.
 * Nothing is sent to the backend and no account, order or file is created.
 */
export const DEMO = process.env.NEXT_PUBLIC_CHECKOUT_DEMO === "true";

const pause = <T,>(value: T, ms = 500) => new Promise<T>((resolve) => setTimeout(() => resolve(value), ms));

const demoApi: typeof realApi = {
  login: (email) =>
    pause({ user: { id: "demo", email, firstName: "Demo", lastName: "User" }, accessToken: "demo" }),

  register: (body) =>
    pause({
      user: { id: "demo", email: body.email, firstName: body.firstName, lastName: body.lastName },
      accessToken: "demo",
    }),

  createRequest: () => {
    const d = new Date();
    const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
    const rand = Math.floor(1000 + Math.random() * 9000);
    return pause({ id: "demo", referenceNumber: `DEMO-${stamp}-${rand}`, totalAmount: 0 }, 700);
  },

  uploadDocument: () => pause({}, 300),

  pay: () => pause({ transactionRef: "DEMO" }, 700),
};

export const api = DEMO ? demoApi : realApi;
