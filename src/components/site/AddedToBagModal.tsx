import { Link } from "@tanstack/react-router";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useUiStore } from "@/stores/uiStore";
import { useCartStore } from "@/stores/cartStore";
import { Minus, Plus, ChevronDown } from "lucide-react";

export function AddedToBagModal() {
  const added = useUiStore((s) => s.addedToBag);
  const close = useUiStore((s) => s.closeAdded);
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const getCheckoutUrl = useCartStore((s) => s.getCheckoutUrl);

  const open = !!added;
  const line = added ? items.find((i) => i.variantId === added.variantId) : null;
  const qty = line?.quantity ?? added?.quantity ?? 1;

  const handleCheckout = () => {
    const url = getCheckoutUrl();
    if (url) window.open(url, "_blank");
    close();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && close()}>
      <DialogContent className="max-w-2xl p-0 gap-0 border-0">
        {added && (
          <div className="p-8 md:p-10">
            <DialogTitle className="text-[12px] tracking-editorial uppercase font-semibold mb-8">
              Added to Bag
            </DialogTitle>
            <DialogDescription className="sr-only">Item added to your bag</DialogDescription>

            <div className="flex gap-6">
              <div className="w-32 md:w-40 aspect-[3/4] bg-muted overflow-hidden flex-shrink-0">
                {added.product.node.images.edges[0]?.node && (
                  <img
                    src={added.product.node.images.edges[0].node.url}
                    alt={added.product.node.title}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <p className="text-[12px] tracking-editorial uppercase">
                    {added.product.node.title}
                  </p>
                  <p className="text-[12px] mt-1">
                    {added.price.currencyCode} {parseFloat(added.price.amount).toFixed(2)}
                  </p>
                </div>
                <div className="space-y-2">
                  {added.selectedOptions.find((o) => /color|colour/i.test(o.name)) && (
                    <p className="text-sm">
                      {
                        added.selectedOptions.find((o) => /color|colour/i.test(o.name))!
                          .value
                      }
                    </p>
                  )}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center bg-muted">
                      <button
                        onClick={() => updateQuantity(added.variantId, qty - 1)}
                        className="w-9 h-9 grid place-items-center"
                        aria-label="Decrease"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-sm">{qty}</span>
                      <button
                        onClick={() => updateQuantity(added.variantId, qty + 1)}
                        className="w-9 h-9 grid place-items-center"
                        aria-label="Increase"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    {added.selectedOptions.find((o) => /size/i.test(o.name)) && (
                      <div className="flex items-center bg-muted px-3 h-9 gap-2 text-sm">
                        <span>
                          {added.selectedOptions.find((o) => /size/i.test(o.name))!.value}
                        </span>
                        <ChevronDown className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 space-y-3">
              <Link
                to="/bag"
                onClick={close}
                className="block w-full bg-foreground text-background py-4 text-center text-[11px] tracking-editorial uppercase hover:opacity-90"
              >
                View Bag
              </Link>
              <button
                onClick={handleCheckout}
                className="block w-full py-3 text-center text-[11px] tracking-editorial uppercase hover:opacity-60"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
