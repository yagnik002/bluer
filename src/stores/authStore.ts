import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface Address {
  id: string;
  fullName: string;
  address: string;
  landmark?: string;
  pincode: string;
  city: string;
  state: string;
  country: string;
  phone: string;
}

export interface AuthUser {
  fullName: string;
  email: string;
  phoneCountry: string; // e.g. "+91"
  phone: string;
  marketingOptIn: boolean;
  rewardPoints: number;
  rewardGoal: number;
  addresses: Address[];
}

interface AuthState {
  user: AuthUser | null;
  pendingPhone: { country: string; number: string } | null;
  setPendingPhone: (country: string, number: string) => void;
  completeSignup: (input: { fullName: string; email: string; marketingOptIn: boolean }) => void;
  updateUser: (patch: Partial<AuthUser>) => void;
  addAddress: (addr: Omit<Address, "id">) => void;
  removeAddress: (id: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      pendingPhone: null,
      setPendingPhone: (country, number) =>
        set({ pendingPhone: { country, number } }),
      completeSignup: ({ fullName, email, marketingOptIn }) => {
        const pending = get().pendingPhone;
        set({
          user: {
            fullName,
            email,
            phoneCountry: pending?.country ?? "+91",
            phone: pending?.number ?? "",
            marketingOptIn,
            rewardPoints: 60,
            rewardGoal: 800,
            addresses: [],
          },
          pendingPhone: null,
        });
      },
      updateUser: (patch) =>
        set((s) => (s.user ? { user: { ...s.user, ...patch } } : s)),
      addAddress: (addr) =>
        set((s) =>
          s.user
            ? {
                user: {
                  ...s.user,
                  addresses: [
                    ...s.user.addresses,
                    { ...addr, id: crypto.randomUUID() },
                  ],
                },
              }
            : s,
        ),
      removeAddress: (id) =>
        set((s) =>
          s.user
            ? {
                user: {
                  ...s.user,
                  addresses: s.user.addresses.filter((a) => a.id !== id),
                },
              }
            : s,
        ),
      logout: () => set({ user: null, pendingPhone: null }),
    }),
    {
      name: "bluer-auth",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? window.localStorage : (undefined as never),
      ),
    },
  ),
);
