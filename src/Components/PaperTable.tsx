/* eslint-disable react-hooks/rules-of-hooks */
import { AutoComplete, Button, Space, Table, Typography, theme } from "antd"
import { useDispatch } from "react-redux"
import { renameTab, addTab } from "../Redux/actionCreators"
import { PaperComponent } from "./Paper"
import {
  DownloadOutlined,
  FilePdfOutlined,
  PlusOutlined,
} from "@ant-design/icons"
import { useEffect, useState } from "react"
import { OpenAIService } from "../Services/OpenAIService"
import { CustomColumn } from "./CustomColumn"
import { AcademicPaper } from "../Types/AcademicPaper"
const { useToken } = theme

export const PaperTable = (props: { papers: AcademicPaper[] }) => {
  const dispatch = useDispatch()
  const { token } = useToken()
  const [columnAddSearchQuery, setColumnAddSearchQuery] = useState("")
  const handleRenameTab = (key: string, newLabel: string) => {
    dispatch(renameTab(key, newLabel))
  }

  const [customColumns, setCustomColumns] = useState<any[]>([])

  const handleAddTab = (newTab: any) => {
    dispatch(addTab(newTab))
  }

  return (
    <Space direction='vertical' style={{ width: "100%" }}>
      <Space direction='horizontal'>
        <AutoComplete
          dropdownStyle={{ width: 300 }}
          options={[
            ...(columnAddSearchQuery
              ? [
                  {
                    value: columnAddSearchQuery,
                    label: (
                      <span>
                        What is the <b>{columnAddSearchQuery}</b> of the paper?
                      </span>
                    ),
                  },
                ]
              : []),
            { value: "Key Findings", label: "Key Findings" },
            { value: "Limitations", label: "Limitations" },
            { value: "Recommendations", label: "Recommendations" },
            { value: "Research Questions", label: "Research Questions" },
            { value: "Variables Studied", label: "Variables Studied" },
            { value: "Data Sources", label: "Data Sources" },
            { value: "Sample Size", label: "Sample Size" },
            { value: "Statistical Methods", label: "Statistical Methods" },
            { value: "Implications", label: "Implications" },
            { value: "Study Design", label: "Study Design" },
            { value: "Research Instruments", label: "Research Instruments" },
            {
              value: "Ethical Considerations",
              label: "Ethical Considerations",
            },
            { value: "Funding Sources", label: "Funding Sources" },
            { value: "Keywords", label: "Keywords" },
            { value: "Conflict of Interest", label: "Conflict of Interest" },
            { value: "Timeframe", label: "Timeframe" },
            { value: "Conclusion", label: "Conclusion" },
            { value: "Main Argument", label: "Main Argument" },
            { value: "Theoretical Framework", label: "Theoretical Framework" },
          ]}
          filterOption={(inputValue, option) =>
            option!.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
          }
          style={{ width: 200 }}
          value={columnAddSearchQuery}
          onSelect={(value) => {
            setCustomColumns([...customColumns, value])
            setColumnAddSearchQuery("")
          }}
          onSearch={(text) => setColumnAddSearchQuery(text)}
          suffixIcon={<PlusOutlined />}
          placeholder='Add a Custom Column'
        />
        {/* <Button icon={<DownloadOutlined />}>Download CSV</Button>
        <Button icon={<DownloadOutlined />}>Download BIB</Button> */}
      </Space>
      <Table
        // rowSelection={{ type: "checkbox" }}
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
                  {record.abstract || record?.fullText}
                </Typography.Paragraph>
              </Space>
            ),
          },
          ...customColumns.map((column) => ({
            title: column,
            dataIndex: column,
            key: column,
            render: (text: string, record: AcademicPaper, index: number) => (
              <CustomColumn record={record} detail={column} />
            ),
          })),
        ]}
      />
    </Space>
  )
}
