"use client";

import { API_URL } from "./config";
import type { AuthUser } from "./types";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

async function parse(res: Response) {
  const text = await res.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }
  if (!res.ok) {
    const raw = (data as { message?: string | string[] } | null)?.message;
    const message = Array.isArray(raw) ? raw.join(", ") : (raw ?? `HTTP ${res.status}`);
    throw new ApiError(message, res.status);
  }
  return data;
}

async function call<T>(url: string, init: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      ...init,
      headers: {
        ...(init.body && !(init.body instanceof FormData) ? { "Content-Type": "application/json" } : {}),
        ...init.headers,
      },
    });
  } catch {
    throw new ApiError("network", 0);
  }
  return (await parse(res)) as T;
}

const post = <T,>(url: string, body: unknown) => call<T>(url, { method: "POST", body: JSON.stringify(body) });

export const auth = {
  session: () => call<{ user: AuthUser | null }>("/api/auth/session"),
  login: (email: string, password: string) => post<{ user: AuthUser }>("/api/auth/login", { email, password }),
  register: (body: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone: string;
    countryOfResidence?: string;
  }) => post<{ user: AuthUser }>("/api/auth/register", body),
  logout: () => post<{ ok: true }>("/api/auth/logout", {}),
  forgotPassword: (email: string) => post<{ ok: true }>("/api/auth/forgot-password", { email }),
  verifyOtp: (email: string, otp: string) => post<{ resetToken: string }>("/api/auth/verify-otp", { email, otp }),
  resetPassword: (resetToken: string, newPassword: string) =>
    post<{ ok: true }>("/api/auth/reset-password", { resetToken, newPassword }),
};

export const orders = {
  create: (body: {
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
  }) => post<{ id: string; referenceNumber: string; totalAmount: number | string }>("/api/backend/requests", body),

  pay: (requestId: string, paymentMethod: "card" | "wallet") =>
    post<{ transactionRef: string }>("/api/backend/payments", { requestId, paymentMethod }),

  /** Files go straight to the backend (they can exceed the serverless body limit). */
  upload: async (requestId: string, key: string, file: File) => {
    const { token } = await call<{ token: string }>("/api/auth/token");
    const form = new FormData();
    form.append("file", file);
    let res: Response;
    try {
      res = await fetch(`${API_URL}/requests/${requestId}/documents?key=${encodeURIComponent(key)}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
    } catch {
      throw new ApiError("network", 0);
    }
    return parse(res);
  },
};

export type Profile = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  countryOfResidence: string;
  profilePhotoUrl: string | null;
};

async function withToken<T>(fn: (token: string) => Promise<T>): Promise<T> {
  const { token } = await call<{ token: string }>("/api/auth/token");
  return fn(token);
}

export const account = {
  profile: () => call<{ profile: Profile }>("/api/account/profile").then((r) => r.profile),
  update: (body: { firstName: string; lastName: string; phone: string; countryOfResidence: string }) =>
    call<{ profile: Profile }>("/api/account/profile", { method: "PATCH", body: JSON.stringify(body) }).then(
      (r) => r.profile,
    ),
  changePassword: (oldPassword: string, newPassword: string) =>
    post<{ ok: true }>("/api/account/change-password", { oldPassword, newPassword }),

  /** Photos go straight to the backend (up to 5 MB), like document uploads. */
  uploadPhoto: (file: File) =>
    withToken(async (token) => {
      const form = new FormData();
      form.append("photo", file);
      let res: Response;
      try {
        res = await fetch(`${API_URL}/users/profile/photo`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: form,
        });
      } catch {
        throw new ApiError("network", 0);
      }
      return (await parse(res)) as { profilePhotoUrl?: string | null };
    }),
  removePhoto: () =>
    withToken(async (token) => {
      let res: Response;
      try {
        res = await fetch(`${API_URL}/users/profile/photo`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      } catch {
        throw new ApiError("network", 0);
      }
      return parse(res);
    }),
};
