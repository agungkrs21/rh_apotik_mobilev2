// context/CartContext.js
import { createContext, useContext, useState } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [keranjang, setKeranjang] = useState([]);

  const tambahKeKeranjang = (produk) => {
    setKeranjang((prev) => {
      for (let i = 0; i < prev.length; i++) {
        prev[i].expanded = false;
      }
      const sudahAda = prev.find((item) => item.id === produk.id);
      if (sudahAda) {
        return prev.map((item) => (item.id === produk.id ? { ...item, jumlah: item.jumlah + 1 } : item));
      } else {
        return [...prev, { ...produk, jumlah: 1 }];
      }
    });
  };

  const hapusDariKeranjang = (id) => {
    setKeranjang((prev) => prev.filter((item) => item.id !== id));
  };

  return <CartContext.Provider value={{ keranjang, tambahKeKeranjang, hapusDariKeranjang, setKeranjang }}>{children}</CartContext.Provider>;
};

export const useCart = () => useContext(CartContext);
