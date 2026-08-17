import { useEffect, useState } from "react";

/**
 * Returns true when the user prefers reduced motion — either via the OS setting
 * (prefers-reduced-motion) or via the local override toggled from the UI.
 * The override is persisted in localStorage under "ams:reduced-motion".
 */
const STORAGE_KEY = "ams:reduced-motion";

function readOverride(): boolean | null {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem(STORAGE_KEY);
  if (v === "1") return true;
  if (v === "0") return false;
  return null;
}

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      const override = readOverride();
      setReduced(override ?? mq.matches);
    };
    sync();
    mq.addEventListener?.("change", sync);
    const onStorage = (e: StorageEvent) => e.key === STORAGE_KEY && sync();
    window.addEventListener("storage", onStorage);
    return () => {
      mq.removeEventListener?.("change", sync);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return reduced;
}

export function setReducedMotionOverride(value: boolean | null) {
  if (typeof window === "undefined") return;
  if (value === null) window.localStorage.removeItem(STORAGE_KEY);
  else window.localStorage.setItem(STORAGE_KEY, value ? "1" : "0");
  window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY }));
}
