import { Button, ConfigProvider, theme } from "antd"
import React from "react"
import { Root } from "./Components/Root"
import { Provider } from "react-redux"
import store from "./Redux/store"

const App: React.FC = () => (
  <Provider store={store}>
    <ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
      <Root />
    </ConfigProvider>
  </Provider>
)

export default App
