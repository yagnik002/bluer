import { create } from "zustand";
import type { ShopifyProduct } from "@/lib/shopify/api";

export interface AddedSummary {
  product: ShopifyProduct;
  variantId: string;
  variantTitle: string;
  selectedOptions: Array<{ name: string; value: string }>;
  price: { amount: string; currencyCode: string };
  quantity: number;
}

interface UiStore {
  addedToBag: AddedSummary | null;
  notifyProduct: ShopifyProduct | null;
  showAdded: (summary: AddedSummary) => void;
  closeAdded: () => void;
  openNotify: (product: ShopifyProduct) => void;
  closeNotify: () => void;
}

export const useUiStore = create<UiStore>((set) => ({
  addedToBag: null,
  notifyProduct: null,
  showAdded: (addedToBag) => set({ addedToBag }),
  closeAdded: () => set({ addedToBag: null }),
  openNotify: (notifyProduct) => set({ notifyProduct }),
  closeNotify: () => set({ notifyProduct: null }),
}));
