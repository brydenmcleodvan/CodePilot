import { useEffect, useState } from "react";

const STORAGE_KEY = "theme";

export function useDarkMode() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const prefers = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const enabled = saved ? saved === "dark" : prefers;
    setIsDark(enabled);
    if (enabled) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggle = () => {
    setIsDark((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add("dark");
        localStorage.setItem(STORAGE_KEY, "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem(STORAGE_KEY, "light");
      }
      return next;
    });
  };

  return { isDark, toggle };
}
