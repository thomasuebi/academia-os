import React, { useState } from "react"
import {
  DesktopOutlined,
  FileOutlined,
  PieChartOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons"
import type { MenuProps } from "antd"
import { Breadcrumb, Layout, Menu, theme, Input } from "antd"
import RootTabs from "./Tabs"

const { Header, Content, Footer, Sider } = Layout

type MenuItem = Required<MenuProps>["items"][number]

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[]
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
  } as MenuItem
}

export const Root: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false)
  const {
    token: { colorBgContainer },
  } = theme.useToken()

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* <Sider
        theme='light'
        style={{
          overflow: "auto",
          maxHeight: "100vh",
          borderInlineEnd: "1px solid rgba(5, 5, 5, 0.06)",
        }}
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}>
        <Menu
          defaultSelectedKeys={["1"]}
          mode='inline'
          items={[
            getItem("Option 1", "1", <PieChartOutlined />),
            getItem("Option 2", "2", <DesktopOutlined />),
          ]}
        />
      </Sider> */}
      <Layout>
        <Content
          style={{
            margin: "10px 16px",
            display: "flex",
            // alignItems: "center",
            justifyContent: "center",
          }}>
          <div style={{ maxWidth: "1200px", width: "100%" }}>
            <RootTabs />
          </div>
        </Content>
      </Layout>
    </Layout>
  )
}
