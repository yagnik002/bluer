import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, Linkedin } from "lucide-react";

type FooterLink = { label: string; to?: string; href?: string };

const COLS: FooterLink[][] = [
  [
    { label: "Help Centre", href: "#" },
    { label: "My Purchases", to: "/account" },
    { label: "Start a Return", href: "#" },
  ],
  [
    { label: "Terms and Conditions", href: "#" },
    { label: "Return Policy", href: "#" },
    { label: "Shipping and Payments", href: "#" },
  ],
  [
    { label: "Account Details", to: "/account/details" },
    { label: "About the Brand", to: "/about" },
    { label: "Careers", to: "/careers" },
  ],
];

export function Footer() {
  return (
    <footer className="bg-background border-t border-border/60 mt-16 md:mt-24">
      <div className="px-6 md:px-10 py-12 md:py-16">
        {/* Newsletter */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 pb-12 md:pb-16 border-b border-border/60">
          <div>
            <p className="text-[11px] tracking-editorial uppercase">Subscribe to our newsletter</p>
          </div>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex flex-col gap-2"
          >
            <label className="text-[11px] tracking-editorial uppercase text-muted-foreground">
              Email Address
            </label>
            <div className="flex">
              <input
                type="email"
                required
                className="flex-1 bg-muted px-4 py-3 text-sm outline-none focus:bg-muted/80"
              />
              <button
                type="submit"
                className="bg-foreground text-background px-8 text-[11px] tracking-editorial uppercase hover:opacity-90"
              >
                Subscribe
              </button>
            </div>
          </form>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-16 pt-12">
          {COLS.map((col, i) => (
            <ul key={i} className="space-y-3 text-[11px] tracking-editorial uppercase">
              {col.map((link) => (
                <li key={link.label}>
                  {link.to ? (
                    <Link to={link.to} className="hover:opacity-60 transition-opacity">
                      {link.label}
                    </Link>
                  ) : (
                    <a href={link.href ?? "#"} className="hover:opacity-60 transition-opacity">
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          ))}
        </div>

        {/* Bottom row */}
        <div className="flex flex-col-reverse md:flex-row md:items-center justify-between pt-12 gap-6">
          <div className="flex items-center gap-4">
            <a href="#" aria-label="Instagram" className="hover:opacity-60">
              <Instagram className="w-4 h-4" />
            </a>
            <a href="#" aria-label="Facebook" className="hover:opacity-60">
              <Facebook className="w-4 h-4" />
            </a>
            <a href="#" aria-label="Threads" className="hover:opacity-60 text-xs font-semibold">
              @
            </a>
            <a href="#" aria-label="LinkedIn" className="hover:opacity-60">
              <Linkedin className="w-4 h-4" />
            </a>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Copyright @{new Date().getFullYear()} All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
