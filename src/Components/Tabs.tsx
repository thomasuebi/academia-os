import React, { useRef, useState } from "react"
import { Button, Slider, Space, Switch, Tabs, Typography, message } from "antd"
import Workflow from "./Workflow"
import {
  BookOutlined,
  FormatPainterFilled,
  GithubOutlined,
  SettingOutlined,
  SlackOutlined,
} from "@ant-design/icons"
import { useSelector, useDispatch } from "react-redux"
import { addTab, removeTab } from "../Redux/actionCreators"
import ConfigurationModal from "./Configuration"
import { useTheme } from "../Providers/ThemeContext" // import ThemeProvider and useTheme

type TargetKey = React.MouseEvent | React.KeyboardEvent | string

const RootTabs: React.FC = () => {
  const { theme, toggleTheme } = useTheme()
  const newTabIndex = useRef(0)
  const [isConfigurationVisible, setIsConfigurationVisible] = useState(false)

  const onChange = (newActiveKey: string) => {
    setActiveKey(newActiveKey)
  }
  const tabs = useSelector((state) => (state as any).tabs)
  const [activeKey, setActiveKey] = useState(tabs?.[0]?.key)

  const dispatch = useDispatch()

  const handleAddTab = (newTab: any) => {
    dispatch(addTab(newTab))
  }

  const handleRemoveTab = (key: any) => {
    dispatch(removeTab(key))
  }
  const add = () => {
    const newActiveKey = `newTab${newTabIndex.current++}`
    handleAddTab({
      label: "New Workflow",
      children: <Workflow tabKey={newActiveKey} />,
      key: newActiveKey,
    })
    setActiveKey(newActiveKey)
  }

  const remove = (targetKey: TargetKey) => {
    let newActiveKey = activeKey
    let lastIndex = -1
    handleRemoveTab(targetKey)
    tabs.forEach((item: any, i: number) => {
      if (item.key === targetKey) {
        lastIndex = i - 1
      }
    })
    const newPanes = tabs.filter((item: any) => item.key !== targetKey)
    if (newPanes.length && newActiveKey === targetKey) {
      if (lastIndex >= 0) {
        newActiveKey = newPanes[lastIndex].key
      } else {
        newActiveKey = newPanes[0].key
      }
    }
    setActiveKey(newActiveKey)
  }

  const onEdit = (
    targetKey: React.MouseEvent | React.KeyboardEvent | string,
    action: "add" | "remove"
  ) => {
    if (action === "add") {
      add()
    } else {
      remove(targetKey)
    }
  }

  return (
    <>
      <Tabs
        tabBarExtraContent={
          <Space direction='horizontal'>
            <Button
              className='hide-on-small-screen'
              target='_blank'
              href='https://join.slack.com/t/academiaos/shared_invite/zt-23730lsp0-Qlkv_0Bs3hgMY2FGTC~HnQ'
              type='text'
              icon={<SlackOutlined />}>
              Slack Community
            </Button>
            <Button
              type='text'
              target='_blank'
              href='https://github.com/thomasuebi/academia-os'
              className='hide-on-small-screen'
              icon={<GithubOutlined />}>
              GitHub
            </Button>
            {/* <Button type='text' icon={<BookOutlined />}></Button> */}
            <Button
              type='text'
              icon={<FormatPainterFilled />}
              onClick={() => toggleTheme()}></Button>
            <Button
              type='text'
              onClick={() => setIsConfigurationVisible(true)}
              icon={<SettingOutlined />}></Button>
          </Space>
        }
        type='editable-card'
        onChange={onChange}
        activeKey={activeKey}
        onEdit={onEdit}
        items={tabs}
      />
      <ConfigurationModal
        isVisible={isConfigurationVisible}
        toggleModal={() => setIsConfigurationVisible(!isConfigurationVisible)}
      />
    </>
  )
}

export default RootTabs
