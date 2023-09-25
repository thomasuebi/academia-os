import { Button, Space, Steps, Table, Typography, message } from "antd"
import { AcademicPaper } from "../../Types/AcademicPaper"
import { PaperTable } from "../PaperTable"
import { useEffect, useState } from "react"
import { asyncMap } from "../../Helpers/asyncMap"
import { OpenAIService } from "../../Services/OpenAIService"
import Mermaid from "../Charts/Mermaid"
import { GioiaCoding } from "../Charts/GioiaCoding"
import { LoadingOutlined } from "@ant-design/icons"
import { ModelData } from "../../Types/ModelData"

export const ModelingStep = (props: {
  modelData: ModelData
  onModelDataChange: (modelData: ModelData) => void
}) => {
  const [exploreLoading, setExploreLoading] = useState(false)
  const [constructLoading, setConstructLoading] = useState(false)
  const [visualizationLoading, setVisualizationLoading] = useState(false)

  const [applicableTheories, setApplicableTheories] = useState<any[]>([])

  const loadModel = async () => {
    setConstructLoading(true)
    const model = await OpenAIService.modelConstruction(
      props?.modelData?.aggregateDimensions || {}
    )
    props.onModelDataChange({ ...props.modelData, modelDescription: model })

    setConstructLoading(false)
    setVisualizationLoading(true)
    const visualization = await OpenAIService.modelVisualization(
      props?.modelData?.aggregateDimensions || {},
      model || props?.modelData?.modelDescription || ""
    )
    setCurrent(1)
    props.onModelDataChange({
      ...props.modelData,
      modelVisualization: visualization,
    })
    setCurrent(2)
    setVisualizationLoading(false)
  }

  const load = async () => {
    setExploreLoading(true)
    if (props?.modelData?.aggregateDimensions) {
      const applicable = await OpenAIService.brainstormApplicableTheories(
        props?.modelData?.aggregateDimensions || {}
      )
      setApplicableTheories(applicable)
      setExploreLoading(false)

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
      title: "Explore Applicable Theories",
      loading: exploreLoading,
      content:
        !exploreLoading && applicableTheories.length === 0 ? (
          <Button onClick={load}>Start Modeling</Button>
        ) : (
          <Table
            dataSource={applicableTheories}
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
    // {
    //   key: "construct",
    //   title: "Interrelationships",
    //   loading: false,
    //   content: <></>,
    // },
    {
      key: "model",
      title: "Construct",
      loading: constructLoading,
      content: (
        <Space direction='vertical'>
          <Space direction='horizontal'>
            <Button loading={constructLoading} onClick={loadModel}>
              Build Model
            </Button>
          </Space>
          <Typography.Paragraph>
            {props?.modelData?.modelDescription}
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
          <Space direction='horizontal'>
            <Button loading={constructLoading} onClick={loadModel}>
              Build Model
            </Button>
          </Space>
          <Mermaid chart={props?.modelData?.modelVisualization} />
        </Space>
      ),
    },
  ]

  const [current, setCurrent] = useState(0)

  return (
    <Space direction='vertical' style={{ width: "100%" }}>
      <div style={{ width: "auto" }}>
        <Steps
          current={current}
          onChange={setCurrent}
          direction='horizontal'
          size='small'
          items={steps.map((item) => ({
            key: item.title,
            title: item.title,
            icon: item.loading ? <LoadingOutlined /> : null,
          }))}
        />
      </div>
      <div
        style={{ width: "100%", marginTop: "20px" }}
        key={steps[current].key}>
        {steps[current].content}
      </div>
    </Space>
  )
}
