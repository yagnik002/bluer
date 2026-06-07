import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import aboutImg from "@/assets/about-foundation.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — BLUER" },
      {
        name: "description",
        content:
          "BLUER was born in 2022 from a simple but powerful realization — quality denim made for the modern wardrobe.",
      },
      { property: "og:title", content: "About — BLUER" },
      {
        property: "og:description",
        content: "The foundation behind BLUER — quality denim, considered design.",
      },
      { property: "og:image", content: aboutImg },
      { name: "twitter:image", content: aboutImg },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: AboutPage,
});

const FOUNDATION_COPY = `Bluer was born in 2022 from a simple but powerful realization: finding good-quality denim on the indian high street wasn't easy. trends came and went, but true quality was rare, and the few options that did exist often came with a heavy price tag. this challenge soon revealed a larger gap and an opportunity for our founder to create something meaningful.`;

function AboutPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Desktop layout: copy block left, large image right.
            Mobile layout: image first, then copy — matches Figma. */}
        <section className="px-6 md:px-10 pt-10 md:pt-16 pb-10 md:pb-20">
          {/* Mobile-only: image first */}
          <div className="md:hidden -mx-6 mb-10">
            <img
              src={aboutImg}
              alt="BLUER editorial — woman in teddy jacket against blue door"
              className="w-full h-auto object-cover"
              width={1536}
              height={1024}
            />
          </div>

          {/* Mobile-only heading + body */}
          <div className="md:hidden">
            <h1 className="text-[13px] tracking-editorial uppercase font-medium">
              The Foundation
            </h1>
            <p className="mt-5 text-[14px] leading-[1.65] text-foreground/85">
              {FOUNDATION_COPY}
            </p>
          </div>

          {/* Desktop layout */}
          <div className="hidden md:grid md:grid-cols-12 md:gap-10 lg:gap-16">
            <div className="md:col-span-5 lg:col-span-4 md:pt-2">
              <h1 className="text-[12px] tracking-editorial uppercase font-medium">
                The Foundation
              </h1>
              <p className="mt-6 text-[13px] leading-[1.75] text-foreground/85 max-w-md">
                {FOUNDATION_COPY}
              </p>
              <p className="mt-10 text-[13px] leading-[1.75] text-foreground/85 max-w-md">
                {FOUNDATION_COPY}
              </p>
            </div>

            <div className="md:col-span-7 lg:col-span-8">
              <img
                src={aboutImg}
                alt="BLUER editorial — woman in white vest and denim against blue doors"
                className="w-full h-auto object-cover"
                width={1536}
                height={1024}
              />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
