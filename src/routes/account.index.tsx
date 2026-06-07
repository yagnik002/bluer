import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { useAuthStore } from "@/stores/authStore";
import { ChevronRight } from "lucide-react";
import portrait from "@/assets/account-portrait.jpg";

export const Route = createFileRoute("/account/")({
  head: () => ({
    meta: [{ title: "Account — BLUER" }],
  }),
  component: AccountPage,
});

const ROW_LINKS: Array<{ label: string; to?: "/account/details"; href?: string }> = [
  { label: "Help Centre", href: "#" },
  { label: "Wishlist", href: "#" },
  { label: "My Purchases", href: "#" },
  { label: "Start a Return", href: "#" },
  { label: "Account Details", to: "/account/details" },
];

function AccountPage() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate({ to: "/signup" });
  }, [user, navigate]);

  if (!user) return null;

  const firstName = user.fullName.split(" ")[0]?.toUpperCase() ?? "THERE";
  const progressPct = Math.min(100, (user.rewardPoints / user.rewardGoal) * 100);
  const remaining = Math.max(0, user.rewardGoal - user.rewardPoints);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 px-6 md:px-10 py-10 md:py-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-xl md:text-2xl tracking-[0.04em] font-medium">
            HI, {firstName}
          </h1>
          <p className="mt-2 text-[14px] text-foreground/80">{user.email || "—"}</p>

          {/* Rewards */}
          <div className="mt-10 md:mt-14">
            <p className="text-[12px] tracking-editorial uppercase">
              Reward Points — {user.rewardPoints}/{user.rewardGoal}
            </p>
            <div className="mt-3 h-px bg-foreground/15 relative">
              <div
                className="absolute inset-y-0 left-0 bg-foreground h-[2px] -top-px"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <p className="mt-3 text-[13px] text-foreground/80">
              {remaining} more for bonus rewards
            </p>
          </div>

          {/* Editorial image */}
          <div className="mt-8 md:mt-12 -mx-6 md:mx-0">
            <img
              src={portrait}
              alt="BLUER editorial portrait"
              loading="lazy"
              width={1280}
              height={896}
              className="w-full h-[280px] md:h-[420px] object-cover"
            />
          </div>

          {/* Links */}
          <ul className="mt-10 md:mt-14 divide-y divide-foreground/15 border-t border-b border-foreground/15">
            {ROW_LINKS.map((row) => {
              const cls =
                "flex items-center justify-between py-5 text-[12px] tracking-editorial uppercase hover:opacity-60 transition-opacity";
              return (
                <li key={row.label}>
                  {row.to ? (
                    <Link to={row.to} className={cls}>
                      <span>{row.label}</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  ) : (
                    <a href={row.href} className={cls}>
                      <span>{row.label}</span>
                      <ChevronRight className="w-4 h-4" />
                    </a>
                  )}
                </li>
              );
            })}
          </ul>

          <button
            onClick={() => {
              logout();
              navigate({ to: "/" });
            }}
            className="mt-10 text-[12px] tracking-editorial uppercase underline underline-offset-4 hover:opacity-60"
          >
            Sign out
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
