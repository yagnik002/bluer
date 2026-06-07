import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner";

export const Route = createFileRoute("/contact-info")({
  head: () => ({
    meta: [{ title: "Contact — BLUER" }],
  }),
  component: ContactInfoPage,
});

function ContactInfoPage() {
  const navigate = useNavigate();
  const pending = useAuthStore((s) => s.pendingPhone);
  const completeSignup = useAuthStore((s) => s.completeSignup);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [optIn, setOptIn] = useState(true);

  const skip = () => {
    completeSignup({ fullName: "Guest", email: "", marketingOptIn: false });
    navigate({ to: "/account" });
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return toast.error("Enter your full name");
    if (!/^\S+@\S+\.\S+$/.test(email)) return toast.error("Enter a valid email");
    completeSignup({ fullName: fullName.trim(), email: email.trim(), marketingOptIn: optIn });
    toast.success("Welcome to BLUER");
    navigate({ to: "/account" });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 md:px-10 py-6 md:py-10">
      <div className="flex justify-end">
        <button
          onClick={skip}
          className="text-[12px] tracking-editorial uppercase hover:opacity-60"
        >
          Skip
        </button>
      </div>

      <div className="mt-12 md:mt-20 max-w-md md:mx-auto md:w-full">
        <h1 className="text-2xl md:text-3xl tracking-[0.04em] font-medium">CONTACT</h1>

        <form onSubmit={onSubmit} className="mt-10 space-y-8">
          <div>
            <label className="block text-[12px] text-foreground/70 mb-1">Full name*</label>
            <input
              type="text"
              required
              autoFocus
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full border-b border-foreground/40 bg-transparent outline-none focus:border-foreground py-2 text-[15px]"
            />
          </div>

          <div>
            <label className="block text-[12px] text-foreground/70 mb-1">Email*</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-b border-foreground/40 bg-transparent outline-none focus:border-foreground py-2 text-[15px]"
            />
          </div>

          <div className="flex items-center bg-muted px-4 py-4 text-[15px]">
            <span>{pending?.country ?? "+91"}</span>
            <span className="mx-3 text-foreground/40">|</span>
            <span>{pending?.number ?? ""}</span>
          </div>

          <label className="flex gap-3 text-[13px] leading-snug text-foreground/80 cursor-pointer">
            <input
              type="checkbox"
              checked={optIn}
              onChange={(e) => setOptIn(e.target.checked)}
              className="mt-1 accent-foreground w-4 h-4"
            />
            <span>I would like to receive updates on new arrivals and exclusive releases via Email.</span>
          </label>

          <button
            type="submit"
            className="w-full bg-foreground text-background py-4 text-[13px] tracking-editorial uppercase hover:opacity-90"
          >
            Save Details
          </button>

          <p className="text-[12px] text-foreground/60 text-center">
            Already have an account?{" "}
            <Link to="/signup" className="underline underline-offset-4">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
