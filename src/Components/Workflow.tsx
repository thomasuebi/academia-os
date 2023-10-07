import React, { useState } from "react"
import { CheckCard } from "@ant-design/pro-components"

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
import { SearchRepository } from "../Services/SearchService"
import { useDispatch } from "react-redux"
import { renameTab, addTab } from "../Redux/actionCreators"
import { PaperComponent } from "./Paper"
import { RankingService } from "../Services/RankingService"
import { PaperTable } from "./PaperTable"
import { OpenAIService } from "../Services/OpenAIService"
import ConfigurationForm from "./ConfigurationForm"
import StreamingComponent from "./StreamingComponent"

import { AcademicPaper } from "../Types/AcademicPaper"
import StepFind from "./Steps/Find"
import { CodingStep } from "./Steps/Coding"
import { ModelData } from "../Types/ModelData"
import { ModelingStep } from "./Steps/Modeling"
const { useToken } = theme

const Workflow = (props: { tabKey?: string }) => {
  const [mode, setMode] = useState<
    "qualitative" | undefined | "literatureReview"
  >()
  const [current, setCurrent] = useState(0)
  const [results, setResults] = useState<AcademicPaper[] | null>(null)

  const [searchQuery, setSearchQuery] = useState("")
  const { token } = useToken()
  const [relevancyLoading, setRelevancyLoading] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)

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

  const [modelData, setModelData] = useState<ModelData>({})

  const evaluate = async (query: string, searchResults: AcademicPaper[]) => {
    setRelevancyLoading(true)
    const relevantResults = query
      ? await RankingService.rankPapers(
          query,
          searchResults?.filter((paper) => paper?.fullText) || []
        )
      : searchResults?.filter((paper) => paper?.fullText)
    setModelData((prevValue) => ({ ...prevValue, papers: relevantResults }))
    setRelevancyLoading(false)
    setCurrent(2)
  }

  const steps = [
    {
      key: "find",
      title: "Find",
      content: (
        <StepFind
          onLoadingChange={setSearchLoading}
          onFinish={async (payload) => {
            console.log(payload)
            handleRenameTab(
              props?.tabKey || "",
              payload.searchQuery || "File Analysis"
            )
            setSearchQuery(payload.searchQuery)
            setResults(payload.searchResults)
            setCurrent(1)
            await evaluate(payload.searchQuery, payload.searchResults)
          }}
        />
      ),
    },
    {
      key: "explore",
      loading: searchLoading,
      title: `Explore${results?.length ? ` (${results?.length})` : ""}`,
      content: (
        <PaperTable
          onPapersChange={(papers) => setResults(papers)}
          papers={results || []}
        />
      ),
    },
    {
      key: "evaluate",
      loading: relevancyLoading,
      title: `Evaluate${
        modelData.papers?.length ? ` (${modelData.papers?.length})` : ""
      }`,
      content: (
        <>
          {OpenAIService.getOpenAIKey() ? (
            <PaperTable
              onPapersChange={(papers) => {
                setModelData((prevValue) => ({ ...prevValue, papers }))
              }}
              papers={modelData.papers || []}
            />
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
      key: "work",
      title: "Work  ",
      content: (
        <>
          <CheckCard.Group
            onChange={(value) => {
              setMode(value as any)
            }}
            value={mode}>
            <CheckCard
              title='Qualitative Analysis'
              description='Analyze large amounts of qualitative data with the Gioia method.'
              value='qualitative'
            />
            <CheckCard
              title='Literature Review'
              description='Let AI write the complete Literature Review for you.'
              value='literatureReview'
            />
          </CheckCard.Group>
        </>
      ),
    },
    ...(mode === "literatureReview"
      ? [
          {
            key: "litrev",
            title: "Literature Review",
            content: (
              <>
                {OpenAIService.getOpenAIKey() ? (
                  <div>
                    Literature Review
                    <StreamingComponent
                      prompt={`${
                        modelData.papers
                          ?.map(
                            (paper) =>
                              `${paper?.authors
                                ?.map((author) => author?.name)
                                ?.join(", ")}, ${paper?.year}, ${
                                paper?.title
                              } write: ${paper?.fullText}`
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
      : []),
    ...(mode === "qualitative"
      ? [
          {
            key: "coding",
            title: `Coding${
              Object.keys(modelData?.aggregateDimensions || {}).length > 0
                ? ` (${
                    Object.keys(modelData?.aggregateDimensions || {}).length
                  })`
                : ""
            }`,
            content: (
              <CodingStep
                onModelDataChange={(data) => {
                  console.log(data)
                  setModelData((prev) => ({ ...prev, ...data }))
                }}
                modelData={modelData}
              />
            ),
          },
          {
            key: "modeling",
            title: "Modeling",
            content: (
              <ModelingStep
                onModelDataChange={(data) =>
                  setModelData((prev) => ({ ...prev, ...data }))
                }
                modelData={modelData}
              />
            ),
          },
        ]
      : []),
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
          <Space direction='vertical'>
            <Steps
              current={current}
              onChange={onChange}
              direction='vertical'
              size='small'
              items={items}
            />
            <div>
              <a
                type='link'
                href='https://academia-os.canny.io/'
                target='_blank'
                rel='noreferrer'>
                Give Feedback or Request Feature
              </a>
            </div>
          </Space>
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
            <div key={steps[current].key}>{steps[current].content}</div>
          </Card>
        </Col>
      </Row>
    </>
  )
}

export default Workflow
