import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Pencil, Check } from "lucide-react";
import { useEffect, useRef, useState, type ChangeEvent, type KeyboardEvent } from "react";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner";

export const Route = createFileRoute("/verify")({
  head: () => ({
    meta: [{ title: "Verify — BLUER" }],
  }),
  component: VerifyPage,
});

const OTP_LENGTH = 6;

function VerifyPage() {
  const navigate = useNavigate();
  const pending = useAuthStore((s) => s.pendingPhone);
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [seconds, setSeconds] = useState(30);
  const inputs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (!pending) navigate({ to: "/signup" });
  }, [pending, navigate]);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  const filled = digits.every((d) => d !== "");

  const onChange = (i: number, e: ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/\D/g, "").slice(-1);
    setDigits((prev) => {
      const next = [...prev];
      next[i] = v;
      return next;
    });
    if (v && i < OTP_LENGTH - 1) inputs.current[i + 1]?.focus();
  };

  const onKeyDown = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    }
  };

  const onContinue = () => {
    if (!filled) return;
    // UI-only: accept any 6-digit code.
    toast.success("Verified");
    navigate({ to: "/contact-info" });
  };

  const resend = () => {
    setSeconds(30);
    toast("Code re-sent");
  };

  const formatted = `00:${String(seconds).padStart(2, "0")}`;

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 md:px-10 py-6 md:py-10">
      <div className="mt-16 md:mt-24 max-w-md md:mx-auto md:w-full">
        <h1 className="text-2xl md:text-3xl tracking-[0.04em] font-medium">VERIFY</h1>
        <p className="mt-3 text-[14px] text-foreground/80 flex flex-wrap items-center gap-2">
          We've sent a {OTP_LENGTH}-digit code on{" "}
          <span className="inline-flex items-center gap-2 border-b border-foreground/60 pb-0.5">
            {pending?.country ?? "+91"} {pending?.number}
            <button
              type="button"
              onClick={() => navigate({ to: "/signup" })}
              aria-label="Edit number"
              className="hover:opacity-60"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          </span>
        </p>

        <div className="mt-12 flex gap-3 md:gap-5">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => {
                inputs.current[i] = el;
              }}
              type="tel"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => onChange(i, e)}
              onKeyDown={(e) => onKeyDown(i, e)}
              aria-label={`Digit ${i + 1}`}
              className="w-full max-w-[44px] text-center text-xl border-b border-foreground/60 bg-transparent outline-none focus:border-foreground py-2"
            />
          ))}
        </div>

        <div className="mt-6 text-[13px] text-foreground/80">
          {seconds > 0 ? (
            <>Resend In {formatted}</>
          ) : (
            <button onClick={resend} className="underline underline-offset-4 hover:opacity-60">
              Resend code
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={onContinue}
          disabled={!filled}
          className="mt-10 w-full bg-foreground text-background py-4 text-[13px] tracking-editorial uppercase hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center justify-center gap-2"
        >
          {filled ? <Check className="w-4 h-4" /> : "Continue"}
        </button>
      </div>
    </div>
  );
}
