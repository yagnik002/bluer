import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import {
  storefrontApiRequest,
  PRODUCT_BY_HANDLE_QUERY,
  type ShopifyProduct,
} from "@/lib/shopify/api";
import { useCartStore } from "@/stores/cartStore";
import { useUiStore } from "@/stores/uiStore";

type ProductDetail = ShopifyProduct["node"];

async function fetchProduct(handle: string): Promise<ProductDetail | null> {
  const data = await storefrontApiRequest(PRODUCT_BY_HANDLE_QUERY, { handle });
  return data?.data?.product ?? null;
}

export const Route = createFileRoute("/product/$handle")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.handle.replace(/-/g, " ")} — BLUER` },
      { property: "og:title", content: `${params.handle} — BLUER` },
      { property: "og:url", content: `/product/${params.handle}` },
      { property: "og:type", content: "product" },
    ],
    links: [{ rel: "canonical", href: `/product/${params.handle}` }],
  }),
  component: ProductPage,
  notFoundComponent: () => (
    <div className="min-h-screen grid place-items-center text-center px-6">
      <div>
        <p className="font-display text-3xl mb-3">Product not found</p>
        <Link to="/" className="text-[11px] tracking-editorial uppercase underline">
          Back to home
        </Link>
      </div>
    </div>
  ),
});

function ProductPage() {
  const { handle } = Route.useParams();
  const addItem = useCartStore((s) => s.addItem);
  const isLoading = useCartStore((s) => s.isLoading);
  const showAdded = useUiStore((s) => s.showAdded);
  const openNotify = useUiStore((s) => s.openNotify);

  const { data: product, isLoading: loading } = useQuery({
    queryKey: ["product", handle],
    queryFn: () => fetchProduct(handle),
  });

  const [variantId, setVariantId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }
  if (!product) throw notFound();

  const selectedVariant =
    product.variants.edges.find((v) => v.node.id === variantId)?.node ??
    product.variants.edges[0]?.node;

  const handleAdd = async () => {
    if (!selectedVariant) return;
    if (!selectedVariant.availableForSale) {
      openNotify({ node: product });
      return;
    }
    await addItem({
      product: { node: product },
      variantId: selectedVariant.id,
      variantTitle: selectedVariant.title,
      price: selectedVariant.price,
      quantity: 1,
      selectedOptions: selectedVariant.selectedOptions ?? [],
    });
    showAdded({
      product: { node: product },
      variantId: selectedVariant.id,
      variantTitle: selectedVariant.title,
      price: selectedVariant.price,
      quantity: 1,
      selectedOptions: selectedVariant.selectedOptions ?? [],
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 px-6 md:px-10 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
          <div className="grid grid-cols-1 gap-px bg-border">
            {product.images.edges.map((img, i) => (
              <img
                key={i}
                src={img.node.url}
                alt={img.node.altText ?? product.title}
                loading={i === 0 ? "eager" : "lazy"}
                className="w-full object-cover bg-muted aspect-[4/5]"
              />
            ))}
          </div>
          <div className="md:sticky md:top-28 md:self-start space-y-6">
            <div>
              <h1 className="font-display text-3xl md:text-4xl tracking-[0.04em] leading-tight">
                {product.title}
              </h1>
              <p className="text-sm mt-3">
                {product.priceRange.minVariantPrice.currencyCode}{" "}
                {parseFloat(product.priceRange.minVariantPrice.amount).toFixed(2)}
              </p>
            </div>

            {product.variants.edges.length > 1 && (
              <div className="space-y-2">
                <p className="text-[11px] tracking-editorial uppercase">Variant</p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.edges.map((v) => {
                    const active = (variantId ?? selectedVariant?.id) === v.node.id;
                    return (
                      <button
                        key={v.node.id}
                        onClick={() => setVariantId(v.node.id)}
                        disabled={!v.node.availableForSale}
                        className={`px-3 py-2 text-[11px] tracking-editorial uppercase border ${
                          active ? "border-foreground bg-foreground text-background" : "border-border"
                        } disabled:opacity-30`}
                      >
                        {v.node.title}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <button
              onClick={handleAdd}
              disabled={isLoading}
              className="w-full bg-foreground text-background py-4 text-[11px] tracking-editorial uppercase hover:opacity-90 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mx-auto" />
              ) : selectedVariant?.availableForSale ? (
                "Add to Bag"
              ) : (
                "Get Notified"
              )}
            </button>

            {product.description && (
              <p className="text-sm text-muted-foreground leading-relaxed pt-4 border-t border-border">
                {product.description}
              </p>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
