import React, { useState } from "react"
import {
  Divider,
  Steps,
  Button,
  Card,
  Space,
  Input,
  Row,
  Col,
  Table,
  Form,
  Typography,
  theme,
  Result,
  Tag,
} from "antd"
import {
  BookOutlined,
  CloudUploadOutlined,
  DownloadOutlined,
  FilePdfOutlined,
  LoadingOutlined,
  PlusOutlined,
  UploadOutlined,
} from "@ant-design/icons"
import { Paper } from "semanticscholarjs"
import { SearchRepository } from "../Services/SearchService"
import { useDispatch } from "react-redux"
import { renameTab, addTab } from "../Redux/actionCreators"
import { PaperComponent } from "./Paper"
import { RankingService } from "../Services/RankingService"
import { PaperTable } from "./PaperTable"
import { OpenAIService } from "../Services/OpenAIService"
import ConfigurationForm from "./ConfigurationForm"
import StreamingComponent from "./StreamingComponent"
import logo from "../favicon.png"
const { useToken } = theme

const Workflow = (props: { tabKey?: string }) => {
  const [current, setCurrent] = useState(0)
  const [searchLoading, setSearchLoading] = useState(false)
  const [results, setResults] = useState<Paper[] | null>(null)
  const [relevantResults, setRelevantResults] = useState<Paper[] | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const { token } = useToken()
  const [relevancyLoading, setRelevancyLoading] = useState(false)

  const dispatch = useDispatch()

  const handleRenameTab = (key: string, newLabel: string) => {
    dispatch(renameTab(key, newLabel))
  }

  const handleAddTab = (newTab: any) => {
    dispatch(addTab(newTab))
  }

  const onChange = (value: number) => {
    setCurrent(value)
  }

  const search = async (query: string) => {
    handleRenameTab(props?.tabKey || "", query)
    setSearchQuery(query)
    setSearchLoading(true)
    const searchResults = await (
      await SearchRepository.searchPapers(query)
    )?.nextPage()
    setResults(searchResults || [])
    setSearchLoading(false)
    setCurrent(1)
    setRelevancyLoading(true)
    const relevantResults = await RankingService.rankPapers(
      query,
      searchResults?.filter((paper) => paper?.abstract) || []
    )
    setRelevantResults(relevantResults)
    setRelevancyLoading(false)
    setCurrent(2)
  }

  const steps = [
    {
      title: "Find",
      content: (
        <>
          <div style={{ width: "100%", textAlign: "center", padding: "20px" }}>
            <img
              alt='AcademiaOS'
              src={logo}
              style={{ width: "50px", height: "50px", marginBottom: "-20px" }}
            />
            <Typography.Title>AcademiaOS</Typography.Title>
            <p style={{ marginTop: "-10px" }}>
              <Tag>Open Source</Tag> <Tag>OpenAI-Powered</Tag>
            </p>
          </div>
          <Row>
            <Col span={24}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                <div
                  style={{
                    width: "100%",
                    maxWidth: "400px",
                    textAlign: "center",
                  }}>
                  <Form onFinish={(values) => search(values?.query)}>
                    <Form.Item name='query'>
                      <Input
                        autoFocus
                        disabled={searchLoading}
                        size='large'
                        placeholder='Search for Papers'
                      />
                    </Form.Item>
                  </Form>
                  <Space>
                    <Button type='link' icon={<CloudUploadOutlined />}>
                      Upload PDFs
                    </Button>
                    <Button type='link' icon={<BookOutlined />}>
                      From Library
                    </Button>
                  </Space>
                </div>
              </div>
            </Col>
          </Row>
          {/* <Row gutter={16} style={{ marginTop: "50px" }}>
            <Col span={8}>
              <Card style={{ textAlign: "center" }}>
                Find relevant literature
              </Card>
            </Col>
            <Col span={8}>
              <Card style={{ textAlign: "center" }}>Analyze your own PDFs</Card>
            </Col>
            <Col span={8}>
              <Card style={{ textAlign: "center" }}>
                Work with interview transcripts
              </Card>
            </Col>
          </Row> */}
        </>
      ),
    },
    {
      loading: searchLoading,
      title: `Explore${results?.length ? ` (${results?.length})` : ""}`,
      content: <PaperTable papers={results || []} />,
    },
    {
      loading: relevancyLoading,
      title: `Evaluate${
        relevantResults?.length ? ` (${relevantResults?.length})` : ""
      }`,
      content: (
        <>
          {OpenAIService.getOpenAIKey() ? (
            <PaperTable papers={relevantResults || []} />
          ) : (
            <Result
              status='404'
              title='OpenAI API Key Missing'
              subTitle='Unlock all features by adding your OpenAI API key.'
              extra={
                <ConfigurationForm
                  onSubmit={() => {
                    setCurrent(0)
                  }}
                />
              }
            />
          )}
        </>
      ),
    },
    {
      title: "Work  ",
      content: (
        <>
          {OpenAIService.getOpenAIKey() ? (
            <div>
              Literature Review
              <StreamingComponent
                prompt={`${
                  relevantResults
                    ?.map(
                      (paper) =>
                        `${paper?.authors
                          ?.map((author) => author?.name)
                          ?.join(", ")}, ${paper?.year}, ${
                          paper?.title
                        } write: ${paper?.abstract}`
                    )
                    ?.join("\n\n")
                    ?.substring(0, 6000) || ""
                }\n\nNow, given these papers, write a short, academic literature review of the most important findings answering '${searchQuery}'. Follow APA7. Return only with the literature review and nothing else. No titles and subtitles.`}
              />
            </div>
          ) : (
            <Result
              status='404'
              title='OpenAI API Key Missing'
              subTitle='Unlock all features by adding your OpenAI API key.'
              extra={
                <ConfigurationForm
                  onSubmit={() => {
                    setCurrent(0)
                  }}
                />
              }
            />
          )}
        </>
      ),
    },
  ]

  const next = () => {
    setCurrent(current + 1)
  }

  const prev = () => {
    setCurrent(current - 1)
  }

  const items = steps.map((item) => ({
    key: item.title,
    title: item.title,
    icon: item.loading ? <LoadingOutlined /> : null,
  }))

  return (
    <>
      <Row>
        <Col xs={0} sm={0} md={6} lg={4} xl={3}>
          <Steps
            current={current}
            onChange={onChange}
            direction='vertical'
            size='small'
            items={items}
          />
        </Col>
        <Col xs={24} sm={24} md={18} lg={20} xl={21}>
          <Card
            style={{
              width: "100%",
              maxHeight: "calc(100vh - 120px)",
              overflowY: "auto",
            }}
            actions={[
              <>
                {current > 0 && (
                  <Button style={{ margin: "0 8px" }} onClick={() => prev()}>
                    Previous
                  </Button>
                )}
                {current < steps.length - 1 && current !== 0 && (
                  <Button type='primary' onClick={() => next()}>
                    Next
                  </Button>
                )}
                {/* {current === steps.length - 1 && (
                  <Button type='primary' onClick={() => {}}>
                    Done
                  </Button>
                )} */}
              </>,
            ]}>
            {steps[current].content}
          </Card>
        </Col>
      </Row>
    </>
  )
}

export default Workflow
