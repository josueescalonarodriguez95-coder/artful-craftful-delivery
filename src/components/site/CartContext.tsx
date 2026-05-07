import { createContext, useContext, useMemo, useState, ReactNode } from "react";

export type CartItem = {
  id: string;
  type: "pedestal" | "crate" | "delivery" | "other";
  title: string;
  details: string;
  qty: number;
  unitPrice: number;
};

type CartCtx = {
  items: CartItem[];
  add: (item: Omit<CartItem, "id"> & { id?: string }) => void;
  remove: (id: string) => void;
  clear: () => void;
  count: number;
  total: number;
  open: boolean;
  setOpen: (v: boolean) => void;
};

const Ctx = createContext<CartCtx | null>(null);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);

  const add: CartCtx["add"] = (item) => {
    const id = item.id ?? `${item.type}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setItems((prev) => [...prev, { ...item, id }]);
    setOpen(true);
  };
  const remove = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id));
  const clear = () => setItems([]);

  const { count, total } = useMemo(() => {
    return items.reduce(
      (acc, i) => ({ count: acc.count + i.qty, total: acc.total + i.qty * i.unitPrice }),
      { count: 0, total: 0 }
    );
  }, [items]);

  return (
    <Ctx.Provider value={{ items, add, remove, clear, count, total, open, setOpen }}>
      {children}
    </Ctx.Provider>
  );
};

export const useCart = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useCart must be used within CartProvider");
  return v;
};
