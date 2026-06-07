import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { storefrontApiRequest, STOREFRONT_PRODUCTS_QUERY, type ShopifyProduct } from "@/lib/shopify/api";

async function fetchProducts(): Promise<ShopifyProduct[]> {
  const data = await storefrontApiRequest(STOREFRONT_PRODUCTS_QUERY, { first: 12, query: null });
  return data?.data?.products?.edges ?? [];
}

export function ProductGrid({ heading = "NEW ARRIVALS" }: { heading?: string }) {
  const { data: products, isLoading } = useQuery({
    queryKey: ["bluer-products"],
    queryFn: fetchProducts,
  });

  return (
    <section className="px-0 md:px-0 mt-16 md:mt-24">
      <div className="px-6 md:px-10 mb-6 flex items-center justify-between">
        <h2 className="text-[11px] tracking-editorial uppercase">{heading}</h2>
        <span className="text-[11px] tracking-editorial uppercase text-muted-foreground">
          Filters
        </span>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] bg-muted animate-pulse" />
          ))}
        </div>
      ) : !products || products.length === 0 ? (
        <div className="px-6 md:px-10 py-20 text-center border-y border-border">
          <p className="text-[11px] tracking-editorial uppercase text-muted-foreground">
            No products found
          </p>
          <p className="text-xs text-muted-foreground mt-3 max-w-md mx-auto">
            Tell me what you'd like to sell — name and price — and I'll add it to your Shopify
            store.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border">
          {products.map((p) => {
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
      )}
    </section>
  );
}
