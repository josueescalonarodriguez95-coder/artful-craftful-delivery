import { useState } from "react";
import { useLang } from "./LangContext";
import { t } from "@/i18n/translations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useReveal } from "@/hooks/useReveal";
import { toast } from "sonner";
import { z } from "zod";

const schema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  message: z.string().trim().min(1).max(1000),
});

export const Contact = () => {
  const { lang } = useLang();
  const ref = useReveal<HTMLDivElement>();
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(lang === "es" ? "Revisa los campos del formulario." : "Please check the form fields.");
      return;
    }
    toast.success(t.contact.sent[lang]);
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <section id="contact" className="relative py-24 md:py-36 bg-ink text-cream overflow-hidden">
      <div className="container relative">
        <div ref={ref} className="reveal grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-clay font-medium">{t.contact.eyebrow[lang]}</span>
            <h2 className="mt-4 font-display text-4xl md:text-6xl leading-[1.05] text-balance">
              {t.contact.title[lang]}
            </h2>
            <div className="mt-10 space-y-5 text-cream/80">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-cream/50">Email</div>
                <a href="mailto:ramosdeliverye@gmail.com" className="text-lg hairline">ramosdeliverye@gmail.com</a>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-cream/50">{lang === "es" ? "Teléfono" : "Phone"}</div>
                <a href="tel:+17864262444" className="text-lg hairline">+1 (786) 426-2444</a>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-cream/50">{lang === "es" ? "Estudio" : "Studio"}</div>
                <p className="text-lg">Santo Domingo · DR</p>
              </div>
            </div>
          </div>

          <form onSubmit={submit} className="space-y-5 bg-cream/5 backdrop-blur-sm border border-cream/10 rounded-md p-6 md:p-10">
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-cream/60 mb-2 block">{t.contact.name[lang]}</label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                maxLength={100}
                className="bg-transparent border-cream/20 text-cream placeholder:text-cream/40 focus-visible:ring-clay h-12"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-cream/60 mb-2 block">{t.contact.email[lang]}</label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                maxLength={255}
                className="bg-transparent border-cream/20 text-cream placeholder:text-cream/40 focus-visible:ring-clay h-12"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-cream/60 mb-2 block">{t.contact.message[lang]}</label>
              <Textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                maxLength={1000}
                rows={5}
                className="bg-transparent border-cream/20 text-cream placeholder:text-cream/40 focus-visible:ring-clay"
              />
            </div>
            <Button type="submit" className="w-full bg-clay hover:bg-clay-deep text-cream rounded-full py-6 text-sm tracking-wide">
              {t.contact.send[lang]}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};
