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
import { asyncMap } from "../Helpers/asyncMap"
const { useToken } = theme

export const PaperTable = (props: {
  papers: AcademicPaper[]
  customColumns?: string[]
  responsiveToUpdates?: boolean
  onPapersChange?: (papers: AcademicPaper[]) => void
}) => {
  const dispatch = useDispatch()
  const { token } = useToken()
  const [columnAddSearchQuery, setColumnAddSearchQuery] = useState("")
  const handleRenameTab = (key: string, newLabel: string) => {
    dispatch(renameTab(key, newLabel))
  }

  const [customColumns, setCustomColumns] = useState<any[]>(
    props.customColumns || []
  )

  const [updatedPapers, setUpdatedPapers] = useState<AcademicPaper[]>(
    props.papers
  )

  useEffect(() => {
    props?.responsiveToUpdates && setUpdatedPapers(props.papers)
  }, [props?.papers])

  const handleAddTab = (newTab: any) => {
    dispatch(addTab(newTab))
  }

  const convertToCSV = (papers: AcademicPaper[]): string => {
    const header = Object.keys(papers[0]).join(",")
    const rows = papers.map((paper) => {
      return Object.values(paper)
        .map((value) => {
          if (value === null) return ""
          if (Array.isArray(value)) return `"${value.join("; ")}"`
          return typeof value === "string" ? `"${value}"` : value
        })
        .join(",")
    })

    return `${header}\n${rows.join("\n")}`
  }

  const convertToBIB = (papers: AcademicPaper[]): string => {
    return papers
      .map((paper) => {
        return `@article{${paper.id},
  title={${paper.title}},
  author={${(paper.authors?.map((author) => author.name) || []).join(", ")}},
  journal={${paper.journal}},
  year={${paper.year}}
}`
      })
      .join("\n\n")
  }

  const downloadCSV = () => {
    const csvString = convertToCSV(updatedPapers)
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", "papers.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const downloadBIB = () => {
    const bibString = convertToBIB(updatedPapers)
    const blob = new Blob([bibString], { type: "text/plain;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", "papers.bib")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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
          onSelect={async (value) => {
            setCustomColumns([...customColumns, value])
            let newPapers = [...updatedPapers]
            newPapers = await asyncMap(newPapers, async (paper) => {
              const newPaper = { ...paper } as AcademicPaper
              if (newPaper[value]) return newPaper
              newPaper[value] = await OpenAIService.getDetailAboutPaper(
                newPaper,
                value
              )
              return newPaper
            })
            setUpdatedPapers(newPapers)
            setColumnAddSearchQuery("")
          }}
          onSearch={(text) => setColumnAddSearchQuery(text)}
          suffixIcon={<PlusOutlined />}
          placeholder='Add a Custom Column'
        />

        <Button icon={<DownloadOutlined />} onClick={downloadCSV}>
          Download CSV
        </Button>
        <Button icon={<DownloadOutlined />} onClick={downloadBIB}>
          Download BIB
        </Button>
      </Space>
      <Table
        // rowSelection={{ type: "checkbox" }}
        style={{ maxHeight: "calc(100vh - 270px)", overflowY: "auto" }}
        size='small'
        pagination={false}
        dataSource={updatedPapers || []}
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
              <Space
                title={
                  record[column]
                    ? typeof record[column] === "string"
                      ? record[column]
                      : JSON.stringify(record[column])
                    : "Loading..."
                }
                size={0}
                direction={"vertical"}
                style={{ width: "300px" }}>
                <Typography.Paragraph
                  ellipsis={{ rows: 5 }}
                  style={{ marginBottom: 0 }}>
                  {record[column]
                    ? typeof record[column] === "string"
                      ? record[column]
                      : JSON.stringify(record[column])
                    : "Loading..."}
                </Typography.Paragraph>
              </Space>
            ),
          })),
        ]}
      />
    </Space>
  )
}
