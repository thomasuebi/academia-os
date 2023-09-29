import { Button, ConfigProvider, theme } from "antd"
import React from "react"
import { Root } from "./Components/Root"
import { Provider } from "react-redux"
import store from "./Redux/store"
import { ThemeProvider, useTheme } from "./Providers/ThemeContext" // import ThemeProvider and useTheme

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <ThemedApp />
    </ThemeProvider>
  )
}

const ThemedApp: React.FC = () => {
  const { theme: currentTheme } = useTheme() // use the hook
  return (
    <Provider store={store}>
      <ConfigProvider
        theme={{
          algorithm:
            currentTheme === "light"
              ? theme.defaultAlgorithm
              : theme.darkAlgorithm,
        }}>
        <Root />
      </ConfigProvider>
    </Provider>
  )
}

export default App
