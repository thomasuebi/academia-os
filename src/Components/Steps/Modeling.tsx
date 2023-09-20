import { Button, Space, Steps, Table } from "antd"
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

  const [applicableTheories, setApplicableTheories] = useState<any[]>([])

  const load = async () => {
    setExploreLoading(true)
    const applicable = await OpenAIService.brainstormApplicableTheories(
      props?.modelData?.aggregateDimensions || {}
    )
    setApplicableTheories(applicable)
    setExploreLoading(false)
    // if (codes.length > 0) {
    //   const focusCodes = await loadFocusCodes(codes)
    //   if (Object.keys(focusCodes).length > 0) {
    //     const aggregateDimensionCodes = await loadAggregateDimensions(
    //       focusCodes
    //     )
    //     props?.onModelDataChange?.({
    //       firstOrderCodes: codes,
    //       secondOrderCodes: focusCodes,
    //       aggregateDimensions: aggregateDimensionCodes,
    //     })
    //   }
    // }
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
    {
      key: "construct",
      title: "Theory Construction",
      loading: false,
      content: <></>,
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
