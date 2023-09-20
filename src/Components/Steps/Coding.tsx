import { Button, Space, Steps } from "antd"
import { AcademicPaper } from "../../Types/AcademicPaper"
import { PaperTable } from "../PaperTable"
import { useEffect, useState } from "react"
import { asyncMap } from "../../Helpers/asyncMap"
import { OpenAIService } from "../../Services/OpenAIService"
import Mermaid from "../Charts/Mermaid"
import { GioiaCoding } from "../Charts/GioiaCoding"
import { LoadingOutlined } from "@ant-design/icons"
import { ModelData } from "../../Types/ModelData"

export const CodingStep = (props: {
  papers: AcademicPaper[]
  modelData: ModelData
  onModelDataChange: (modelData: ModelData) => void
}) => {
  const [updatedPapers, setUpdatedPapers] = useState<AcademicPaper[]>(
    props?.papers
  )

  const [initialCodes, setInitialCodes] = useState<string[]>(
    props?.modelData?.firstOrderCodes || []
  )
  const [focusCodes, setFocusCodes] = useState<{ [code: string]: string[] }>(
    props?.modelData?.secondOrderCodes || {}
  )
  const [aggregateDimensions, setAggregateDimensions] = useState<{
    [code: string]: string[]
  }>(props?.modelData?.aggregateDimensions || {})
  const [firstOrderLoading, setFirstOrderLoading] = useState(false)
  const [secondOrderLoading, setSecondOrderLoading] = useState(false)
  const [aggregateLoading, setAggregateLoading] = useState(false)

  const loadInitialCodes = async () => {
    setFirstOrderLoading(true)
    let newPapers = [...updatedPapers]
    newPapers = await asyncMap(newPapers, async (paper, index) => {
      const newPaper = { ...paper } as AcademicPaper
      if (newPaper["Initial Codes"]) return newPaper
      newPaper["Initial Codes"] = await OpenAIService.initialCodingOfPaper(
        newPaper
      )
      console.log(
        `Loaded initial codes for paper ${index} of ${newPapers.length}`,
        newPaper["Initial Codes"]
      )
      return newPaper
    })
    console.log("Finished")
    setUpdatedPapers(newPapers)
    const codes = Array.from(
      new Set(
        newPapers?.reduce((acc, paper) => {
          if (paper["Initial Codes"]) {
            acc.push(...(paper["Initial Codes"] || []))
          }
          return acc
        }, [] as string[])
      )
    )
    setFirstOrderLoading(false)

    setInitialCodes(codes)
    return codes
  }

  const loadFocusCodes = async (codes: string[]) => {
    setSecondOrderLoading(true)
    const secondOrderCodes = await OpenAIService.secondOrderCoding(codes)
    setFocusCodes(secondOrderCodes)
    setSecondOrderLoading(false)
    setCurrent(1)
    return secondOrderCodes
  }

  const loadAggregateDimensions = async (codes: {
    [code: string]: string[]
  }) => {
    setAggregateLoading(true)
    const aggregateDimensions = await OpenAIService.aggregateDimensions(codes)
    setAggregateDimensions(aggregateDimensions)
    setAggregateLoading(false)
    setCurrent(2)
    return aggregateDimensions
  }

  const load = async () => {
    console.log("Loading started")
    const codes = await loadInitialCodes()
    if (codes.length > 0) {
      const focusCodes = await loadFocusCodes(codes)
      if (Object.keys(focusCodes).length > 0) {
        const aggregateDimensionCodes = await loadAggregateDimensions(
          focusCodes
        )
        props?.onModelDataChange?.({
          firstOrderCodes: codes,
          secondOrderCodes: focusCodes,
          aggregateDimensions: aggregateDimensionCodes,
        })
      }
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
      key: "initial",
      title: "1st Order Coding",
      loading: firstOrderLoading,
      content:
        !firstOrderLoading && initialCodes.length === 0 ? (
          <Button onClick={load}>Start Coding</Button>
        ) : (
          <PaperTable
            papers={updatedPapers}
            responsiveToUpdates={true}
            customColumns={["Initial Codes"]}
          />
        ),
    },
    {
      key: "focus",
      title: "2nd Order Coding",
      loading: secondOrderLoading,
      content: secondOrderLoading ? (
        <p>AcademiaOS is busy coding.</p>
      ) : (
        <GioiaCoding
          firstOrderCodes={initialCodes || []}
          secondOrderCodes={focusCodes || {}}
          aggregateDimensions={{}}
        />
      ),
    },
    {
      key: "aggregate",
      title: "Aggregate Dimensions",
      loading: aggregateLoading,
      content: (
        <GioiaCoding
          firstOrderCodes={initialCodes || []}
          secondOrderCodes={focusCodes || {}}
          aggregateDimensions={aggregateDimensions || {}}
        />
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
