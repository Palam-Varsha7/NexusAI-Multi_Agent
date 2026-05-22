import { useEffect, useState } from "react";

const getInitialTheme = () => {
  if (typeof window === "undefined") return "light";

  if (localStorage.getItem("nexusai-theme-reset") !== "sci-fi-v1") {
    localStorage.setItem("nexusai-theme-reset", "sci-fi-v1");
    localStorage.setItem("nexusai-theme", "dark");
    return "dark";
  }

  return localStorage.getItem("nexusai-theme") || "dark";
};

export function useDarkMode() {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("nexusai-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"));
  };

  return { theme, toggleTheme, setTheme };
}

export default useDarkMode;
