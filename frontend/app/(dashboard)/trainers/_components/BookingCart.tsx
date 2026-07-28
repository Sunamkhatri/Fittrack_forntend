"use client";

import { useState, useEffect } from "react";
import { ShoppingCart, X, CreditCard, Trash2, Clock, Dumbbell } from "lucide-react";
import { handleKhaltiPayment } from "@/app/lib/actions/trainer.action";

interface CartItem {
  id: string;
  trainerName: string;
  trainerId: string;
  sessionType: string;
  duration: string;
  price: number;
}

export default function BookingCart() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("fittrack_cart");
    if (saved) setCart(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("fittrack_cart", JSON.stringify(cart));
  }, [cart]);

  const removeItem = (id: string) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("fittrack_cart");
  };

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setLoading(true);
    setError("");

    // Pay for the first item's trainer (Khalti processes one at a time)
    const firstItem = cart[0];
    const res = await handleKhaltiPayment(firstItem.trainerId, total);

    if (res.success && res.data?.payment_url) {
      clearCart();
      window.location.href = res.data.payment_url;
    } else {
      setError(res.message || "Payment failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Cart Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#00ff87] text-[#0a0f1e] shadow-lg shadow-[#00ff87]/30 transition-transform hover:scale-110 active:scale-95"
      >
        <ShoppingCart size={24} />
        {cart.length > 0 && (
          <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
            {cart.length}
          </span>
        )}
      </button>

      {/* Cart Drawer */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-[#1e293b] bg-[#111827] shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#1e293b] p-6">
              <div className="flex items-center gap-3">
                <ShoppingCart className="text-[#00ff87]" size={24} />
                <h2 className="text-xl font-bold text-white">Your Cart</h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-[#1e293b] hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <ShoppingCart className="mb-4 text-slate-600" size={48} />
                  <h3 className="text-lg font-bold text-white">Cart is empty</h3>
                  <p className="mt-2 text-sm text-slate-400">
                    Browse trainers and book a session to get started!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl border border-[#1e293b] bg-[#0f172a] p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-white">{item.trainerName}</h4>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#00ff87]/10 px-3 py-1 text-xs font-medium text-[#00ff87]">
                              <Dumbbell size={12} />
                              {item.sessionType}
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-700/50 px-3 py-1 text-xs font-medium text-slate-300">
                              <Clock size={12} />
                              {item.duration}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="rounded-lg p-2 text-slate-500 transition hover:bg-red-500/10 hover:text-red-400"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <p className="mt-3 text-right text-lg font-bold text-white">
                        Rs. {item.price.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="border-t border-[#1e293b] p-6">
                {error && (
                  <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-400">
                    {error}
                  </p>
                )}
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-slate-400">Total</span>
                  <span className="text-2xl font-black text-white">
                    Rs. {total.toLocaleString()}
                  </span>
                </div>
                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#00ff87] py-3.5 text-sm font-bold text-[#0a0f1e] transition hover:bg-[#00cc6a] hover:shadow-lg hover:shadow-[#00ff87]/20 disabled:opacity-50"
                >
                  <CreditCard size={18} />
                  {loading ? "Processing..." : "Pay with Khalti"}
                </button>
                <button
                  onClick={clearCart}
                  className="mt-3 w-full rounded-xl border border-[#1e293b] py-2.5 text-sm font-medium text-slate-400 transition hover:border-red-500/30 hover:text-red-400"
                >
                  Clear Cart
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
