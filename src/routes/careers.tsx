import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import editorial from "@/assets/editorial-deckchair.jpg";
import { ArrowLeft } from "lucide-react";

const ROLES = [
  { title: "Media Buying Executive", location: "Work from home, Mumbai", type: "Full-Time" },
  { title: "Human Resource Executive", location: "Work from home, Mumbai", type: "Full-Time" },
  { title: "Marketing Executive", location: "Work from home, Mumbai", type: "Full-Time" },
  { title: "Graphic Designer", location: "Work from home, Mumbai", type: "Full-Time" },
];

export const Route = createFileRoute("/careers")({
  head: () => ({
    meta: [
      { title: "Careers — BLUER" },
      {
        name: "description",
        content:
          "Join BLUER. We're looking for individuals who think differently and want their work to matter.",
      },
      { property: "og:title", content: "Careers — BLUER" },
      {
        property: "og:description",
        content: "Inspiring bold ideas. Join the team moving fashion forward.",
      },
    ],
  }),
  component: CareersPage,
});

function CareersPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="md:hidden px-6 pt-6">
          <Link to="/" aria-label="Back" className="inline-flex">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_1.2fr] gap-10 md:gap-16 px-6 md:px-10 pt-10 md:pt-20 pb-20">
          <div className="hidden md:block">
            <img
              src={editorial}
              alt="BLUER team"
              className="w-full aspect-[3/4] object-cover bg-muted"
            />
          </div>

          <div className="space-y-16">
            <section>
              <h1 className="text-[14px] tracking-editorial uppercase font-semibold">
                Inspiring Bold Ideas
              </h1>
              <p className="mt-5 text-sm leading-relaxed max-w-xl text-foreground/80">
                Bluer is built on purpose, creativity, and a drive to move fashion forward.
                We're not here to follow trends — we're here to set them. That takes people
                who think differently and want their work to matter. We're looking for
                individuals who can help bring our vision to life. We celebrate collaboration
                and growth, creating an environment where ideas thrive.
              </p>
            </section>

            <section>
              <h2 className="text-[14px] tracking-editorial uppercase font-semibold mb-8">
                Join Us
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-10">
                {ROLES.map((r) => (
                  <div key={r.title} className="space-y-4">
                    <div>
                      <p className="text-[12px] tracking-editorial uppercase font-semibold">
                        {r.title}
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">{r.location}</p>
                      <p className="text-sm text-muted-foreground">{r.type}</p>
                    </div>
                    <a
                      href={`mailto:careers@bluer.com?subject=Application — ${r.title}`}
                      className="block bg-muted text-center py-3 text-[11px] tracking-editorial uppercase hover:bg-muted/70"
                    >
                      Apply
                    </a>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
