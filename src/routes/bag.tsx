import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { useCartStore } from "@/stores/cartStore";
import {
  storefrontApiRequest,
  STOREFRONT_PRODUCTS_QUERY,
  type ShopifyProduct,
} from "@/lib/shopify/api";
import { ArrowLeft, Minus, Plus, Trash2, Loader2, ChevronDown } from "lucide-react";

export const Route = createFileRoute("/bag")({
  head: () => ({
    meta: [
      { title: "Your Bag — BLUER" },
      { name: "description", content: "Review your bag and proceed to checkout." },
    ],
  }),
  component: BagPage,
});

async function fetchFeatured(): Promise<ShopifyProduct[]> {
  const data = await storefrontApiRequest(STOREFRONT_PRODUCTS_QUERY, {
    first: 8,
    query: null,
  });
  return data?.data?.products?.edges ?? [];
}

function BagPage() {
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const getCheckoutUrl = useCartStore((s) => s.getCheckoutUrl);
  const isLoading = useCartStore((s) => s.isLoading);
  const [tab, setTab] = useState<"bag" | "wishlist">("bag");

  const { data: featured = [] } = useQuery({
    queryKey: ["featured-bag"],
    queryFn: fetchFeatured,
  });

  const subtotal = items.reduce(
    (s, i) => s + parseFloat(i.price.amount) * i.quantity,
    0,
  );
  const currency = items[0]?.price.currencyCode ?? "";

  const handleCheckout = () => {
    const url = getCheckoutUrl();
    if (url) window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="flex items-center px-6 md:px-10 py-6 relative">
          <Link to="/" aria-label="Back">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1 flex justify-center md:justify-end gap-6 text-[12px] tracking-editorial uppercase">
            <button
              onClick={() => setTab("bag")}
              className={`pb-1 border-b ${
                tab === "bag" ? "border-foreground font-semibold" : "border-transparent text-muted-foreground"
              }`}
            >
              Your Bag [{items.length}]
            </button>
            <button
              onClick={() => setTab("wishlist")}
              className={`pb-1 border-b ${
                tab === "wishlist"
                  ? "border-foreground font-semibold"
                  : "border-transparent text-muted-foreground"
              }`}
            >
              Wishlist
            </button>
          </div>
        </div>

        {tab === "wishlist" ? (
          <div className="px-6 md:px-10 py-32 text-center text-sm text-muted-foreground">
            Your wishlist is empty.
          </div>
        ) : items.length === 0 ? (
          <div className="px-6 md:px-10 py-32 text-center">
            <p className="text-[12px] tracking-editorial uppercase">Your bag is empty</p>
            <Link
              to="/"
              className="inline-block mt-6 bg-foreground text-background px-8 py-3 text-[11px] tracking-editorial uppercase"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr] gap-10 md:gap-16 px-6 md:px-10 pb-16">
            <div className="space-y-10">
              {items.map((item) => {
                const color = item.selectedOptions.find((o) => /color|colour/i.test(o.name));
                const size = item.selectedOptions.find((o) => /size/i.test(o.name));
                return (
                  <div key={item.variantId} className="grid grid-cols-[140px_1fr] gap-6">
                    <Link
                      to="/product/$handle"
                      params={{ handle: item.product.node.handle }}
                      className="block aspect-[3/4] bg-muted overflow-hidden"
                    >
                      {item.product.node.images.edges[0]?.node && (
                        <img
                          src={item.product.node.images.edges[0].node.url}
                          alt={item.product.node.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </Link>
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-[12px] tracking-editorial uppercase">
                            {item.product.node.title}
                          </p>
                          <p className="text-[12px] mt-1">
                            {item.price.currencyCode}{" "}
                            {parseFloat(item.price.amount).toFixed(2)}
                          </p>
                        </div>
                        <button
                          onClick={() => removeItem(item.variantId)}
                          aria-label="Remove"
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      {color && <p className="text-sm">{color.value}</p>}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center bg-muted">
                          <button
                            onClick={() =>
                              updateQuantity(item.variantId, item.quantity - 1)
                            }
                            className="w-9 h-9 grid place-items-center"
                            aria-label="Decrease"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-sm">{item.quantity}</span>
                          <button
                            onClick={() =>
                              updateQuantity(item.variantId, item.quantity + 1)
                            }
                            className="w-9 h-9 grid place-items-center"
                            aria-label="Increase"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        {size && (
                          <div className="flex items-center bg-muted px-3 h-9 gap-2 text-sm">
                            <span>{size.value}</span>
                            <ChevronDown className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <aside className="md:sticky md:top-28 md:self-start space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>
                    {currency} {subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Delivery</span>
                  <span>Calculated at checkout</span>
                </div>
              </div>
              <div className="border-t border-border pt-4 space-y-1">
                <div className="flex justify-between font-semibold">
                  <span className="text-[12px] tracking-editorial uppercase">Total</span>
                  <span>
                    {currency} {subtotal.toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">MRP inclusive of all taxes</p>
              </div>
              <button
                onClick={handleCheckout}
                disabled={isLoading}
                className="w-full bg-foreground text-background py-4 text-[11px] tracking-editorial uppercase flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Proceed to Checkout"}
              </button>
            </aside>
          </div>
        )}

        {featured.length > 0 && (
          <section className="px-6 md:px-10 pb-20">
            <h2 className="text-[11px] tracking-editorial uppercase mb-5">Featured Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border">
              {featured.slice(0, 4).map((p) => {
                const img = p.node.images.edges[0]?.node;
                const price = p.node.priceRange.minVariantPrice;
                return (
                  <Link
                    key={p.node.id}
                    to="/product/$handle"
                    params={{ handle: p.node.handle }}
                    className="bg-background group"
                  >
                    <div className="aspect-[3/4] bg-muted overflow-hidden">
                      {img && (
                        <img
                          src={img.url}
                          alt={img.altText ?? p.node.title}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
                        />
                      )}
                    </div>
                    <div className="px-3 md:px-4 py-3">
                      <p className="text-[11px] tracking-editorial uppercase truncate">
                        {p.node.title}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        {price.currencyCode} {parseFloat(price.amount).toFixed(2)}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
