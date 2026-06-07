import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner";

export const Route = createFileRoute("/account/details")({
  head: () => ({
    meta: [{ title: "Account Details — BLUER" }],
  }),
  component: AccountDetailsPage,
});

function FieldRow({
  label,
  value,
  editable = true,
  onSave,
  type = "text",
}: {
  label: string;
  value: string;
  editable?: boolean;
  onSave?: (v: string) => void;
  type?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [v, setV] = useState(value);
  useEffect(() => setV(value), [value]);

  const commit = () => {
    if (onSave && v !== value) onSave(v);
    setEditing(false);
  };

  return (
    <div>
      <p className="text-[12px] tracking-editorial uppercase">{label}</p>
      <div className="mt-3 flex items-center justify-between border-b border-foreground/40 pb-2">
        {editing ? (
          <input
            type={type}
            autoFocus
            value={v}
            onChange={(e) => setV(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => e.key === "Enter" && commit()}
            className="flex-1 bg-transparent outline-none text-[15px]"
          />
        ) : (
          <span className="text-[15px]">{value || "—"}</span>
        )}
        {editable && (
          <button
            onClick={() => setEditing((s) => !s)}
            aria-label={`Edit ${label}`}
            className="ml-3 hover:opacity-60"
          >
            <Pencil className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

const EMPTY = {
  fullName: "",
  address: "",
  landmark: "",
  pincode: "",
  city: "",
  state: "",
  country: "",
  phone: "",
};

function AccountDetailsPage() {
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const addAddress = useAuthStore((s) => s.addAddress);
  const removeAddress = useAuthStore((s) => s.removeAddress);
  const navigate = useNavigate();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    if (!user) navigate({ to: "/signup" });
  }, [user, navigate]);

  if (!user) return null;

  const setField = (k: keyof typeof EMPTY, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const onSaveAddress = (e: FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.address || !form.pincode || !form.city || !form.state || !form.country || !form.phone) {
      toast.error("Please fill all required fields");
      return;
    }
    addAddress(form);
    toast.success("Address added");
    setForm(EMPTY);
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 px-6 md:px-10 py-8 md:py-16">
        <div className="max-w-3xl mx-auto">
          <Link
            to="/account"
            aria-label="Back to account"
            className="inline-flex items-center hover:opacity-60"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div className="mt-10 space-y-10">
            <FieldRow
              label="Full Name"
              value={user.fullName}
              onSave={(v) => updateUser({ fullName: v })}
            />
            <FieldRow
              label="Email"
              type="email"
              value={user.email}
              onSave={(v) => updateUser({ email: v })}
            />

            <div>
              <p className="text-[12px] tracking-editorial uppercase">Mobile Number</p>
              <div className="mt-3 flex items-center bg-muted px-4 py-3 text-[15px]">
                <span>{user.phoneCountry}</span>
                <span className="mx-3 text-foreground/40">|</span>
                <span className="flex-1">{user.phone}</span>
                <Pencil className="w-4 h-4 opacity-60" />
              </div>
            </div>

            <div>
              <p className="text-[12px] tracking-editorial uppercase">Address</p>

              {user.addresses.length === 0 ? (
                <p className="mt-4 text-[14px] text-foreground/60">No addresses saved.</p>
              ) : (
                <ul className="mt-4 space-y-5">
                  {user.addresses.map((a) => (
                    <li key={a.id} className="flex items-start justify-between gap-4">
                      <div className="text-[14px] leading-[1.6]">
                        <div className="font-medium">{a.fullName}</div>
                        <div>{a.address}</div>
                        {a.landmark && <div>{a.landmark}</div>}
                        <div>
                          {a.city}, {a.state} {a.pincode}
                        </div>
                        <div>{a.country}</div>
                        <div className="text-foreground/70">
                          +91 {a.phone}
                        </div>
                      </div>
                      <button
                        onClick={() => removeAddress(a.id)}
                        aria-label="Remove address"
                        className="text-foreground/60 hover:text-foreground"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {!showForm && (
                <button
                  onClick={() => setShowForm(true)}
                  className="mt-6 bg-muted px-8 py-3 text-[12px] tracking-editorial uppercase hover:bg-muted/80"
                >
                  Add
                </button>
              )}
            </div>

            {showForm && (
              <form onSubmit={onSaveAddress} className="space-y-5 pt-2">
                <FormInput label="Full Name" value={form.fullName} onChange={(v) => setField("fullName", v)} />
                <FormInput label="Address" value={form.address} onChange={(v) => setField("address", v)} />
                <div className="grid grid-cols-2 gap-5">
                  <FormInput label="Landmark (Optional)" value={form.landmark} onChange={(v) => setField("landmark", v)} />
                  <FormInput label="Pincode" value={form.pincode} onChange={(v) => setField("pincode", v)} />
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <FormInput label="City" value={form.city} onChange={(v) => setField("city", v)} />
                  <FormInput label="State" value={form.state} onChange={(v) => setField("state", v)} />
                </div>
                <FormInput label="Country" value={form.country} onChange={(v) => setField("country", v)} />
                <div className="grid grid-cols-[60px_1fr] gap-5 items-end">
                  <FormInput label="+91" value="+91" readOnly />
                  <FormInput label="Phone Number" value={form.phone} onChange={(v) => setField("phone", v.replace(/\D/g, ""))} />
                </div>

                <div className="pt-4 space-y-2">
                  <button
                    type="submit"
                    className="w-full bg-foreground text-background py-4 text-[13px] tracking-editorial uppercase hover:opacity-90"
                  >
                    Save Details
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setForm(EMPTY);
                    }}
                    className="w-full py-3 text-[13px] tracking-editorial uppercase hover:opacity-60"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function FormInput({
  label,
  value,
  onChange,
  readOnly,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  readOnly?: boolean;
}) {
  return (
    <div>
      <label className="block text-[11px] text-foreground/60 mb-1">{label}</label>
      <input
        type="text"
        value={value}
        readOnly={readOnly}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full border-b border-foreground/40 bg-transparent outline-none focus:border-foreground py-1.5 text-[15px]"
      />
    </div>
  );
}
