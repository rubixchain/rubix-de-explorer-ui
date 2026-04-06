import { createContext, useContext, useState } from "react";
import { THEMES } from "./constants";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(true);
  const th = isDark ? THEMES.dark : THEMES.light;
  return (
    <ThemeContext.Provider value={{ isDark, setIsDark, th }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
