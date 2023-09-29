import React, { createContext, useContext, useState, useEffect } from "react"

export type Theme = "light" | "dark"
export const ThemeContext = createContext<{
  theme: Theme
  toggleTheme: () => void
}>({
  theme: "dark",
  toggleTheme: () => {},
})

export const ThemeProvider = ({ children }: any) => {
  const [theme, setTheme] = useState<Theme>("dark")

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as Theme
    if (savedTheme) {
      setTheme(savedTheme)
    }
  }, [])

  useEffect(() => {}, [theme])

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
