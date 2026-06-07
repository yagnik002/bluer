import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useUiStore } from "@/stores/uiStore";
import { toast } from "sonner";

export function GetNotifiedModal() {
  const product = useUiStore((s) => s.notifyProduct);
  const close = useUiStore((s) => s.closeNotify);
  const [email, setEmail] = useState("");
  const [size, setSize] = useState<string>("");

  const open = !!product;
  const sizeOption = product?.node.options.find((o) => /size/i.test(o.name));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    toast.success("We'll email you when it's back in stock.");
    setEmail("");
    setSize("");
    close();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && close()}>
      <DialogContent className="max-w-xl p-0 border-0">
        {product && (
          <form onSubmit={handleSubmit} className="p-8 md:p-10">
            <DialogTitle className="text-[14px] tracking-editorial uppercase font-semibold">
              Get Notified
            </DialogTitle>
            <DialogDescription className="text-sm mt-2">
              We'll email you as soon as the item is available
            </DialogDescription>

            <p className="mt-8 text-[12px] tracking-editorial uppercase">
              {product.node.title}
            </p>

            {sizeOption && (
              <div className="mt-3">
                <select
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  required
                  className="w-full bg-muted h-12 px-4 text-sm appearance-none"
                >
                  <option value="" disabled>
                    Select size
                  </option>
                  {sizeOption.values.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="mt-6">
              <label className="text-sm text-muted-foreground">Email*</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border-b border-foreground bg-transparent py-2 outline-none text-sm"
              />
            </div>

            <button
              type="submit"
              className="w-full mt-8 bg-foreground text-background py-4 text-[11px] tracking-editorial uppercase hover:opacity-90"
            >
              Get Notified
            </button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
