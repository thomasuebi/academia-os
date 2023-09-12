import { Button, Space, Table, Typography, theme } from "antd"
import { Paper } from "semanticscholarjs"
import { useDispatch } from "react-redux"
import { renameTab, addTab } from "../Redux/actionCreators"
import { PaperComponent } from "./Paper"
import {
  DownloadOutlined,
  FilePdfOutlined,
  PlusOutlined,
} from "@ant-design/icons"
const { useToken } = theme

export const PaperTable = (props: { papers: Paper[] }) => {
  const dispatch = useDispatch()
  const { token } = useToken()

  const handleRenameTab = (key: string, newLabel: string) => {
    dispatch(renameTab(key, newLabel))
  }

  const handleAddTab = (newTab: any) => {
    dispatch(addTab(newTab))
  }

  return (
    <Space direction='vertical' style={{ width: "100%" }}>
      <Space direction='horizontal'>
        <Button icon={<PlusOutlined />}>Add Column</Button>
        <Button icon={<DownloadOutlined />}>Download CSV</Button>
        <Button icon={<DownloadOutlined />}>Download BIB</Button>
      </Space>
      <Table
        rowSelection={{ type: "checkbox" }}
        style={{ maxHeight: "calc(100vh - 270px)", overflowY: "auto" }}
        size='small'
        pagination={false}
        dataSource={props?.papers || []}
        columns={[
          {
            title: "Paper",
            dataIndex: "paper",
            key: "paper",
            render: (text, record, index) => (
              <Space size={0} direction={"vertical"} style={{ width: "300px" }}>
                <Typography.Link
                  onClick={() => {
                    const newActiveKey = `newTab${Date.now()}`
                    handleAddTab({
                      label: record.title?.substring(0, 30) || "Paper",
                      children: (
                        <PaperComponent paper={record} tabKey={newActiveKey} />
                      ),
                      key: newActiveKey,
                    })
                  }}
                  style={{
                    marginBottom: 0,
                    color: token.colorText,
                  }}>
                  {record.title}
                </Typography.Link>
                <Typography.Paragraph
                  type='secondary'
                  style={{ marginBottom: 0, fontSize: "9pt" }}>
                  {record.authors?.map((author) => author.name).join(", ")}
                </Typography.Paragraph>
                <Typography.Paragraph
                  type='secondary'
                  style={{ marginBottom: 0, fontSize: "9pt" }}>
                  {record?.journal?.name}
                </Typography.Paragraph>
                <Typography.Paragraph
                  type='secondary'
                  strong
                  style={{ marginBottom: 0, fontSize: "9pt" }}>
                  <span style={{ marginRight: 20 }}>{record?.year}</span>
                  <span style={{ marginRight: 20 }}>
                    {(record?.citationCount ?? 0).toLocaleString("en-US")}{" "}
                    citations
                  </span>
                  <span>
                    {(record?.openAccessPdf as any)?.status === "GREEN" && (
                      <a
                        target={"_blank"}
                        href={(record?.openAccessPdf as any)?.url}>
                        <FilePdfOutlined /> PDF
                      </a>
                    )}
                  </span>
                </Typography.Paragraph>
              </Space>
            ),
          },
          {
            title: "Abstract",
            dataIndex: "abstract",
            key: "abstract",
            render: (text, record, index) => (
              <Space
                title={record.abstract}
                size={0}
                direction={"vertical"}
                style={{ width: "300px" }}>
                <Typography.Paragraph
                  ellipsis={{ rows: 5 }}
                  style={{ marginBottom: 0 }}>
                  {record.abstract}
                </Typography.Paragraph>
              </Space>
            ),
          },
        ]}
      />
    </Space>
  )
}
