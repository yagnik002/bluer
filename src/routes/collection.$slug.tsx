import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import {
  storefrontApiRequest,
  STOREFRONT_PRODUCTS_QUERY,
  type ShopifyProduct,
} from "@/lib/shopify/api";
import { ArrowLeft, Plus } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { useUiStore } from "@/stores/uiStore";

// Maps a /collection/$slug to a Shopify product search query
const SLUG_QUERIES: Record<string, { label: string; query: string | null }> = {
  "new-arrivals": { label: "New Arrivals", query: null },
  bestseller: { label: "Bestseller", query: "tag:bestseller" },
  jeans: { label: "Jeans", query: "product_type:Jeans OR title:jean*" },
  "co-ord-sets": { label: "Co-ord Sets", query: "tag:co-ord OR title:co-ord*" },
  tops: { label: "Tops | Waistcoats", query: "product_type:Tops OR title:top OR title:waistcoat*" },
  dresses: { label: "Dresses", query: "product_type:Dresses OR title:dress*" },
  jackets: { label: "Jackets | Jumpsuits", query: "title:jacket* OR title:jumpsuit*" },
  shirts: { label: "Shirts", query: "title:shirt*" },
  "t-shirts": { label: "T-Shirts", query: "title:t-shirt OR title:tee" },
  trousers: { label: "Trousers", query: "title:trouser* OR title:pant*" },
  shorts: { label: "Shorts | Skorts", query: "title:short* OR title:skort*" },
  "ss-26": { label: "SS'26", query: "tag:ss26" },
  crafte: { label: "Crafte", query: "tag:crafte" },
  afterhours: { label: "Afterhours", query: "tag:afterhours" },
};

async function fetchCollection(query: string | null): Promise<ShopifyProduct[]> {
  const data = await storefrontApiRequest(STOREFRONT_PRODUCTS_QUERY, { first: 24, query });
  return data?.data?.products?.edges ?? [];
}

export const Route = createFileRoute("/collection/$slug")({
  head: ({ params }) => {
    const meta = SLUG_QUERIES[params.slug] ?? { label: params.slug, query: null };
    return {
      meta: [
        { title: `${meta.label} — BLUER` },
        { name: "description", content: `Shop ${meta.label} at BLUER.` },
        { property: "og:title", content: `${meta.label} — BLUER` },
      ],
    };
  },
  component: CollectionPage,
});

function CollectionPage() {
  const { slug } = Route.useParams();
  const meta = SLUG_QUERIES[slug] ?? { label: slug.replace(/-/g, " "), query: null };
  const addItem = useCartStore((s) => s.addItem);
  const openNotify = useUiStore((s) => s.openNotify);
  const showAdded = useUiStore((s) => s.showAdded);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sort, setSort] = useState<"featured" | "price-asc" | "price-desc">("featured");

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["collection", slug],
    queryFn: () => fetchCollection(meta.query),
  });

  const sorted = [...products].sort((a, b) => {
    if (sort === "featured") return 0;
    const pa = parseFloat(a.node.priceRange.minVariantPrice.amount);
    const pb = parseFloat(b.node.priceRange.minVariantPrice.amount);
    return sort === "price-asc" ? pa - pb : pb - pa;
  });

  const quickAdd = async (p: ShopifyProduct) => {
    const variant = p.node.variants.edges.find((v) => v.node.availableForSale)?.node;
    if (!variant) {
      openNotify(p);
      return;
    }
    await addItem({
      product: p,
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity: 1,
      selectedOptions: variant.selectedOptions ?? [],
    });
    showAdded({
      product: p,
      variantId: variant.id,
      variantTitle: variant.title,
      selectedOptions: variant.selectedOptions ?? [],
      price: variant.price,
      quantity: 1,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <div className="bg-foreground text-background text-center py-2 text-[11px] tracking-editorial uppercase">
        Free shipping on prepaid orders above ₹1,990
      </div>
      <main className="flex-1">
        <div className="flex items-center justify-between px-6 md:px-10 py-5">
          <Link to="/" aria-label="Back" className="inline-flex">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-[11px] tracking-editorial uppercase hidden md:block">
            {meta.label}
          </h1>
          <button
            onClick={() => setFiltersOpen((o) => !o)}
            className="text-[11px] tracking-editorial uppercase flex items-center gap-2"
          >
            Filters
            <span className="inline-block w-4 h-4 border border-foreground" />
          </button>
        </div>

        {filtersOpen && (
          <div className="px-6 md:px-10 pb-5 flex flex-wrap gap-3 border-b border-border">
            {(["featured", "price-asc", "price-desc"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSort(s)}
                className={`px-3 py-2 text-[11px] tracking-editorial uppercase border ${
                  sort === s ? "border-foreground bg-foreground text-background" : "border-border"
                }`}
              >
                {s === "featured" ? "Featured" : s === "price-asc" ? "Price ↑" : "Price ↓"}
              </button>
            ))}
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-border">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-muted animate-pulse" />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="px-6 md:px-10 py-32 text-center border-y border-border">
            <p className="text-[11px] tracking-editorial uppercase text-muted-foreground">
              No products found
            </p>
            <p className="text-xs text-muted-foreground mt-3 max-w-md mx-auto">
              Tell me what you'd like to sell — name and price — and I'll add it to your
              Shopify store.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-border">
            {sorted.map((p) => {
              const img = p.node.images.edges[0]?.node;
              const price = p.node.priceRange.minVariantPrice;
              const soldOut = !p.node.variants.edges.some((v) => v.node.availableForSale);
              return (
                <div key={p.node.id} className="bg-background group relative">
                  <Link
                    to="/product/$handle"
                    params={{ handle: p.node.handle }}
                    className="block relative"
                  >
                    <div className="aspect-[3/4] bg-muted overflow-hidden relative">
                      {img && (
                        <img
                          src={img.url}
                          alt={img.altText ?? p.node.title}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
                        />
                      )}
                      {soldOut && (
                        <div className="absolute inset-0 grid place-items-center bg-background/40">
                          <span className="text-background bg-foreground/70 px-3 py-1 text-[11px] tracking-editorial uppercase">
                            Sold Out
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>
                  <button
                    onClick={() => quickAdd(p)}
                    aria-label={soldOut ? "Get notified" : "Quick add"}
                    className="absolute bottom-[68px] right-3 w-8 h-8 grid place-items-center bg-background/90 border border-border hover:bg-foreground hover:text-background transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <div className="px-3 md:px-4 py-3">
                    <p className="text-[11px] tracking-editorial uppercase truncate">
                      {p.node.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      {price.currencyCode} {parseFloat(price.amount).toFixed(2)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
