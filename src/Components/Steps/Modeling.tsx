import {
  Alert,
  Button,
  Input,
  Space,
  Steps,
  Table,
  Typography,
  message,
} from "antd"
import { AcademicPaper } from "../../Types/AcademicPaper"
import { PaperTable } from "../PaperTable"
import { useEffect, useState } from "react"
import { asyncMap } from "../../Helpers/asyncMap"
import { OpenAIService } from "../../Services/OpenAIService"
import Mermaid from "../Charts/Mermaid"
import { GioiaCoding } from "../Charts/GioiaCoding"
import { LoadingOutlined } from "@ant-design/icons"
import { ModelData } from "../../Types/ModelData"
import { RemarkComponent } from "../RemarkComponent"
import { Interrelationships } from "./Modeling/Interrelationships"

export const ModelingStep = (props: {
  modelData: ModelData
  onModelDataChange: (modelData: ModelData) => void
}) => {
  const [exploreLoading, setExploreLoading] = useState(false)
  const [interrelationshipsLoading, setInterrelationshipsLoading] =
    useState(false)
  const [constructLoading, setConstructLoading] = useState(false)
  const [visualizationLoading, setVisualizationLoading] = useState(false)
  const [iteratingLoading, setIteratingLoading] = useState(false)

  const [modelingRemarks, setModelingRemarks] = useState(
    props?.modelData?.remarks || ""
  )
  const loadModel = async () => {
    setConstructLoading(true)
    const modelDescription = await OpenAIService.modelConstruction(
      props?.modelData,
      modelingRemarks
    )
    props.onModelDataChange({ modelDescription })
    const modelName = await OpenAIService.extractModelName(modelDescription)
    props.onModelDataChange({ modelName })
    setConstructLoading(false)
    setVisualizationLoading(true)
    const visualization = await OpenAIService.modelVisualization(
      props?.modelData
    )
    setCurrent(2)
    props.onModelDataChange({
      modelVisualization: visualization,
    })
    setCurrent(3)
    setVisualizationLoading(false)
    setIteratingLoading(true)
    const critique = await OpenAIService.critiqueModel(props?.modelData)
    props.onModelDataChange({ critique })
    setIteratingLoading(false)
  }

  const load = async () => {
    if (props?.modelData?.aggregateDimensions) {
      setExploreLoading(true)
      const applicableTheories =
        await OpenAIService.brainstormApplicableTheories(
          props?.modelData?.aggregateDimensions || {}
        )
      props.onModelDataChange({ applicableTheories })

      setExploreLoading(false)

      setInterrelationshipsLoading(true)
      const tuples = await OpenAIService.conceptTuples(props.modelData)
      props.onModelDataChange({
        interrelationships: tuples.map((tuple) => ({ concepts: tuple })),
      })
      setCurrent(1)
      const interrelationships =
        await OpenAIService.findRelevantParagraphsAndSummarize(
          props.modelData,
          tuples
        )
      props.onModelDataChange({ interrelationships })
      setInterrelationshipsLoading(false)

      await loadModel()
    } else {
      message.error("Please finish the previous steps first.")
    }
  }

  // useEffect(() => {
  //   if (
  //     initialCodes?.length === 0 &&
  //     !firstOrderLoading &&
  //     !secondOrderLoading &&
  //     !aggregateLoading
  //   ) {
  //     load()
  //   }
  // }, [initialCodes, firstOrderLoading, secondOrderLoading, aggregateLoading])

  const steps = [
    {
      key: "explore",
      title: "Applicable Theories",
      loading: exploreLoading,
      content:
        !exploreLoading &&
        (props.modelData.applicableTheories || [])?.length === 0 ? (
          <Space>
            <RemarkComponent
              papers={props.modelData.papers || []}
              value={props.modelData?.remarks || ""}
              onValueChange={(e) => {
                props?.onModelDataChange?.({
                  remarks: e,
                })
              }}
            />
            <Button onClick={load}>Start Modeling</Button>
          </Space>
        ) : (
          <Table
            dataSource={props.modelData.applicableTheories || []}
            columns={[
              { title: "Theory", dataIndex: "theory" },
              { title: "Description", dataIndex: "description" },
              {
                title: "Related Dimensions",
                dataIndex: "relatedDimensions",
                render: (row, record) => row?.join(",\n"),
              },
              {
                title: "Possible Research Questions",
                dataIndex: "possibleResearchQuestions",
                render: (row, record) => row?.join("\n"),
              },
            ]}
          />
        ),
    },
    {
      key: "interrelationships",
      title: "Interrelationships",
      loading: interrelationshipsLoading,
      content: (
        <Interrelationships
          modelData={props.modelData}
          onModelDataChange={props.onModelDataChange}
        />
      ),
    },
    {
      key: "model",
      title: "Construct",
      loading: constructLoading,
      content: (
        <Space direction='vertical'>
          <Space direction='horizontal'>
            <Input
              style={{ width: "300px" }}
              value={modelingRemarks}
              onChange={(e) => setModelingRemarks(e.target.value)}
              placeholder='Free-text remarks for the modeling ...'
            />
            <Button loading={constructLoading} onClick={loadModel}>
              Build Model
            </Button>
          </Space>
          <Typography.Paragraph
            editable={{
              onChange: (e) =>
                props.onModelDataChange &&
                props.onModelDataChange({ modelDescription: e }),
              text: props?.modelData?.modelDescription,
            }}>
            {props?.modelData?.modelDescription || "No model developed yet."}
          </Typography.Paragraph>
        </Space>
      ),
    },
    {
      key: "visualization",
      title: "Visualization",
      loading: visualizationLoading,
      content: (
        <Space direction='vertical' style={{ width: "100%" }}>
          <Typography.Title level={3}>
            {props.modelData?.modelName}
          </Typography.Title>
          <Mermaid chart={props?.modelData?.modelVisualization} />
          <Alert
            type='info'
            message='If you see the message "Syntax error in text" it means that there
            was an error in creating the visualization. You can hit "Start Modeling" to try again.'
          />
        </Space>
      ),
    },
    {
      key: "iterating",
      title: "Iterating",
      loading: iteratingLoading,
      content: (
        <Space direction='vertical' style={{ width: "100%" }}>
          <Typography.Title level={5}>Critique</Typography.Title>
          <Typography.Paragraph
            editable={{
              onChange: (e) =>
                props.onModelDataChange &&
                props.onModelDataChange({ critique: e }),
              text: props?.modelData?.critique,
            }}>
            {props?.modelData?.critique || "No critique developed yet."}
          </Typography.Paragraph>
          <Button onClick={() => loadModel()}>
            Use Critique for Another Modeling Iteration
          </Button>
        </Space>
      ),
    },
  ]

  const [current, setCurrent] = useState(0)

  return (
    <Space direction='vertical' style={{ width: "100%" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
        }}>
        <Steps
          current={current}
          onChange={setCurrent}
          direction='horizontal'
          size='small'
          style={{ flex: 1 }} // Take up as much space as possible
          items={steps.map((item) => ({
            key: item.title,
            title: item.title,
            icon: item.loading ? <LoadingOutlined /> : null,
          }))}
        />
        <Button
          loading={
            exploreLoading ||
            constructLoading ||
            visualizationLoading ||
            interrelationshipsLoading
          }
          style={{ marginLeft: "20px" }}
          onClick={load}>
          {props.modelData.applicableTheories
            ? "Restart Modeling"
            : "Start Modeling"}
        </Button>
      </div>
      <div
        style={{ width: "100%", marginTop: "20px" }}
        key={steps[current].key}>
        {steps[current].content}
      </div>
    </Space>
  )
}
