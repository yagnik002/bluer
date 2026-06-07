import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Sign Up — BLUER" },
      { name: "description", content: "Create your BLUER account with your mobile number." },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const setPendingPhone = useAuthStore((s) => s.setPendingPhone);
  const [phone, setPhone] = useState("");

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) {
      toast.error("Enter a valid 10-digit mobile number");
      return;
    }
    setPendingPhone("+91", digits);
    navigate({ to: "/verify" });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 md:px-10 py-6 md:py-10">
      <Link to="/" aria-label="Back" className="hover:opacity-60 transition-opacity">
        <ArrowLeft className="w-5 h-5" />
      </Link>

      <div className="mt-16 md:mt-24 max-w-md md:mx-auto md:w-full">
        <h1 className="text-2xl md:text-3xl tracking-[0.04em] font-medium">SIGN UP</h1>
        <p className="mt-3 text-[14px] text-foreground/80">
          Enter your mobile number to continue
        </p>

        <form onSubmit={onSubmit} className="mt-10 space-y-6">
          <div className="flex items-center bg-muted px-4 py-4 text-[15px]">
            <span className="text-foreground">+91</span>
            <span className="mx-3 text-foreground/40">|</span>
            <input
              type="tel"
              inputMode="numeric"
              autoFocus
              maxLength={10}
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
              className="flex-1 bg-transparent outline-none placeholder:text-foreground/40"
              placeholder="Mobile number"
              aria-label="Mobile number"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-foreground text-background py-4 text-[13px] tracking-editorial uppercase hover:opacity-90 transition-opacity"
          >
            Continue
          </button>

          <p className="text-[12px] leading-[1.7] text-foreground/80">
            By continuing, you agree to our{" "}
            <a href="#" className="underline underline-offset-4">
              Terms &amp; Conditions
            </a>{" "}
            and{" "}
            <a href="#" className="underline underline-offset-4">
              Privacy Policy
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
