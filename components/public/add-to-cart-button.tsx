"use client";

import { useState } from "react";

type CartItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
};

type Props = {
  productId: string;
  name: string;
  price: number;
};

export function AddToCartButton({ productId, name, price }: Props) {
  const [added, setAdded] = useState(false);

  const onAdd = () => {
    const raw = localStorage.getItem("cart");
    const items = raw ? (JSON.parse(raw) as CartItem[]) : [];

    const existing = items.find((item) => item.productId === productId);
    if (existing) {
      existing.quantity += 1;
    } else {
      items.push({ productId, name, price, quantity: 1 });
    }

    localStorage.setItem("cart", JSON.stringify(items));
    setAdded(true);
    setTimeout(() => setAdded(false), 900);
  };

  return (
    <button className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white" onClick={onAdd} type="button">
      {added ? "Agregado" : "Agregar"}
    </button>
  );
}

