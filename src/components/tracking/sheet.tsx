"use client";

import { createContext, useContext, useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";

/**
 * A DOM node (the mobile "screen" area) that bottom sheets portal into, so a sheet
 * stays INSIDE the phone frame instead of covering the whole desktop viewport.
 */
export const SheetHostContext = createContext<HTMLElement | null>(null);
export const useSheetHost = () => useContext(SheetHostContext);

/** Bottom sheet scoped to the mobile screen: dim scrim + slide-up panel. */
export function BottomSheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}) {
  const host = useSheetHost();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!host) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="pointer-events-auto absolute inset-0 z-40 flex flex-col justify-end">
          <motion.div
            className="absolute inset-0 bg-black/45"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            className="relative flex max-h-[86%] flex-col rounded-t-3xl bg-white shadow-[0_-20px_60px_-15px_rgba(0,0,0,0.4)]"
            style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
          >
            <div className="flex justify-center pt-2.5">
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="h-1.5 w-10 rounded-full bg-neutral-300"
              />
            </div>
            {title && (
              <div className="px-5 pb-3 pt-2">
                <h3 className="text-lg font-bold text-foreground">{title}</h3>
              </div>
            )}
            <div className="thin-scrollbar min-h-0 flex-1 overflow-y-auto px-4 pb-6">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    host
  );
}
