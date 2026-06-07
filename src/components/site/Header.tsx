import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader, SheetDescription } from "@/components/ui/sheet";
import { useCartStore } from "@/stores/cartStore";
import { useAuthStore } from "@/stores/authStore";
import { User } from "lucide-react";
import ss26Img from "@/assets/editorial-summer.jpg";
import crafteImg from "@/assets/hero-crafte.jpg";
import afterImg from "@/assets/editorial-black-tank.jpg";

type CatKey = "clothing" | "accessories";

const CATEGORIES: Record<CatKey, Array<{ label: string; slug: string }>> = {
  clothing: [
    { label: "New Arrivals", slug: "new-arrivals" },
    { label: "Bestseller", slug: "bestseller" },
    { label: "Jeans", slug: "jeans" },
    { label: "Co-ord Sets", slug: "co-ord-sets" },
    { label: "Tops | Waistcoats", slug: "tops" },
    { label: "Dresses", slug: "dresses" },
    { label: "Jackets | Jumpsuits", slug: "jackets" },
    { label: "Shirts", slug: "shirts" },
    { label: "T-Shirts", slug: "t-shirts" },
    { label: "Trousers", slug: "trousers" },
    { label: "Shorts | Skorts", slug: "shorts" },
  ],
  accessories: [
    { label: "Bags", slug: "new-arrivals" },
    { label: "Belts", slug: "new-arrivals" },
    { label: "Sunglasses", slug: "new-arrivals" },
  ],
};

const COLLECTIONS = [
  { label: "SS'26", slug: "ss-26", img: ss26Img },
  { label: "Crafte", slug: "crafte", img: crafteImg },
  { label: "Afterhours", slug: "afterhours", img: afterImg },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeCat, setActiveCat] = useState<CatKey>("clothing");
  const authUser = useAuthStore((s) => s.user);
  const totalItems = useCartStore((s) => s.items.reduce((n, i) => n + i.quantity, 0));

  return (
    <header className="sticky top-0 z-40 bg-background border-b border-border/60">
      <div className="grid grid-cols-3 items-center px-6 md:px-10 h-16 md:h-20">
        <div className="flex items-center">
          <Link
            to="/"
            className="font-display text-2xl md:text-3xl tracking-[0.08em] leading-none text-foreground"
            aria-label="BLUER home"
          >
            BLUER
          </Link>
        </div>

        <div className="hidden md:flex justify-center">
          <label className="flex items-center gap-3 text-[11px] tracking-editorial uppercase text-foreground">
            <span>Search</span>
            <input
              type="search"
              aria-label="Search"
              className="w-48 border-b border-foreground/80 bg-transparent outline-none text-sm px-1 py-1 focus:border-foreground"
            />
          </label>
        </div>

        <nav className="flex items-center justify-end gap-6 md:gap-10 text-[11px] tracking-editorial uppercase">
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <button className="hover:opacity-60 transition-opacity">Menu</button>
            </SheetTrigger>
            <SheetContent side="top" className="w-full h-[92vh] overflow-y-auto p-0">
              <SheetHeader className="px-6 md:px-10 pt-8">
                <SheetTitle className="font-display text-2xl tracking-[0.08em]">
                  Discover
                </SheetTitle>
                <SheetDescription className="sr-only">Site navigation</SheetDescription>
              </SheetHeader>
              <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-10 px-6 md:px-10 pt-8 pb-10">
                <div className="space-y-2 text-[12px] tracking-editorial uppercase">
                  {(Object.keys(CATEGORIES) as CatKey[]).map((k) => (
                    <button
                      key={k}
                      onMouseEnter={() => setActiveCat(k)}
                      onClick={() => setActiveCat(k)}
                      className={`block w-full text-left px-4 py-3 ${
                        activeCat === k ? "bg-muted" : "hover:bg-muted/50"
                      }`}
                    >
                      {k}
                    </button>
                  ))}
                  <div className="pt-6 space-y-2 border-t border-border mt-6">
                    <Link
                      to="/about"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-3 hover:opacity-60"
                    >
                      About
                    </Link>
                    <Link
                      to="/careers"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-3 hover:opacity-60"
                    >
                      Careers
                    </Link>
                    <Link
                      to={authUser ? "/account" : "/signup"}
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-3 hover:opacity-60"
                    >
                      {authUser ? "Account" : "Sign In"}
                    </Link>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3 text-[12px] tracking-editorial uppercase">
                  {CATEGORIES[activeCat].map((c) => (
                    <Link
                      key={c.label}
                      to="/collection/$slug"
                      params={{ slug: c.slug }}
                      onClick={() => setMenuOpen(false)}
                      className="py-2 hover:opacity-60"
                    >
                      {c.label}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-px bg-border border-t border-border">
                {COLLECTIONS.map((tile) => (
                  <Link
                    key={tile.label}
                    to="/collection/$slug"
                    params={{ slug: tile.slug }}
                    onClick={() => setMenuOpen(false)}
                    className="bg-background group"
                  >
                    <div className="aspect-[3/4] overflow-hidden bg-muted">
                      <img
                        src={tile.img}
                        alt={tile.label}
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
                      />
                    </div>
                    <p className="text-center py-4 text-[12px] tracking-editorial uppercase">
                      {tile.label}
                    </p>
                  </Link>
                ))}
              </div>
            </SheetContent>
          </Sheet>

          <Link
            to={authUser ? "/account" : "/signup"}
            className="hover:opacity-60 transition-opacity flex items-center gap-2"
            aria-label="Account"
          >
            <User className="w-4 h-4" />
            <span className="hidden md:inline">{authUser ? "Account" : "Sign In"}</span>
          </Link>

          <Link
            to="/bag"
            className="hover:opacity-60 transition-opacity flex items-center gap-2"
          >
            <span>Your Bag</span>
            {totalItems > 0 && (
              <span className="bg-foreground text-background px-1.5 py-0.5 text-[10px] leading-none">
                {totalItems}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}
