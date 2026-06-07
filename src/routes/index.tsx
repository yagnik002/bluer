import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { ProductGrid } from "@/components/site/ProductGrid";

import heroCrafte from "@/assets/hero-crafte.jpg";
import deckChair from "@/assets/editorial-deckchair.jpg";
import whiteTop from "@/assets/editorial-white-top.jpg";
import blackTank from "@/assets/editorial-black-tank.jpg";
import summer from "@/assets/editorial-summer.jpg";
import denim from "@/assets/editorial-denim.jpg";
import shirt from "@/assets/editorial-shirt.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BLUER — Modern editorial fashion" },
      {
        name: "description",
        content:
          "BLUER is a contemporary fashion label — denim, jumpsuits, tops, and tailored separates designed for everyday wear.",
      },
      { property: "og:title", content: "BLUER — Modern editorial fashion" },
      { property: "og:description", content: "Contemporary fashion. Crafted in small editions." },
      { property: "og:url", content: "/" },
      { property: "og:image", content: heroCrafte },
      { name: "twitter:image", content: heroCrafte },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: HomePage,
});

function EditorialLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] tracking-editorial uppercase text-background/90 mix-blend-difference">
      {children}
    </p>
  );
}

function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* HERO — CRAFTE */}
        <section className="relative">
          <img
            src={heroCrafte}
            alt="BLUER CRAFTE collection"
            width={1600}
            height={1100}
            className="w-full h-[78vh] md:h-[88vh] object-cover"
          />
          <h1
            className="absolute inset-0 grid place-items-center font-display text-white text-5xl md:text-8xl tracking-[0.08em] pointer-events-none"
            aria-label="BLUER"
          >
            BLUER
          </h1>
          <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10">
            <EditorialLabel>CRAFTE</EditorialLabel>
          </div>
        </section>

        {/* DECK CHAIR — NEW ARRIVALS */}
        <section className="relative mt-px">
          <img
            src={deckChair}
            alt="New arrivals — floral printed top and white trousers"
            width={1920}
            height={900}
            loading="lazy"
            className="w-full h-[60vh] md:h-[88vh] object-cover"
          />
          <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10">
            <EditorialLabel>NEW ARRIVALS</EditorialLabel>
          </div>
        </section>

        {/* TWO-COLUMN STUDIO */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border mt-px">
          <img
            src={whiteTop}
            alt="White silk top, long black skirt"
            width={960}
            height={1200}
            loading="lazy"
            className="w-full h-full object-cover aspect-[4/5]"
          />
          <img
            src={blackTank}
            alt="Embroidered black tank, grey trousers"
            width={960}
            height={1200}
            loading="lazy"
            className="w-full h-full object-cover aspect-[4/5]"
          />
        </section>

        {/* SUMMER '26 */}
        <section className="relative mt-px">
          <img
            src={summer}
            alt="Summer 2026 — white tank and brown linen trousers"
            width={1400}
            height={1100}
            loading="lazy"
            className="w-full h-[70vh] md:h-[90vh] object-cover"
          />
          <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10">
            <EditorialLabel>SUMMER '26</EditorialLabel>
          </div>
        </section>

        {/* TWO-COLUMN DENIM */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border mt-px">
          <img
            src={denim}
            alt="Smocked top and dark denim"
            width={960}
            height={1300}
            loading="lazy"
            className="w-full h-full object-cover aspect-[4/5]"
          />
          <img
            src={shirt}
            alt="White linen shirt and wide-leg jeans"
            width={960}
            height={1300}
            loading="lazy"
            className="w-full h-full object-cover aspect-[4/5]"
          />
        </section>

        {/* SHOPIFY PRODUCTS */}
        <ProductGrid heading="SHOP THE EDIT" />
      </main>
      <Footer />
    </div>
  );
}
