import { Button, Space } from "antd"
import { AcademicPaper } from "../../Types/AcademicPaper"
import { PaperTable } from "../PaperTable"
import { useEffect, useState } from "react"
import { asyncMap } from "../../Helpers/asyncMap"
import { OpenAIService } from "../../Services/OpenAIService"
import HierarchicalFlowchart from "../Charts/Chart"

export const CodingStep = (props: { papers: AcademicPaper[] }) => {
  const [updatedPapers, setUpdatedPapers] = useState<AcademicPaper[]>(
    props?.papers
  )

  const [initialCodes, setInitialCodes] = useState<string[]>([])
  const [focusCodes, setFocusCodes] = useState<{ [code: string]: string[] }>({})
  const [aggregateDimensions, setAggregateDimensions] = useState<{
    [code: string]: string[]
  }>({})

  const loadInitialCodes = async () => {
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
    setInitialCodes(codes)
    return codes
  }

  const loadFocusCodes = async (codes: string[]) => {
    const secondOrderCodes = await OpenAIService.secondOrderCoding(codes)
    setFocusCodes(secondOrderCodes)
    return secondOrderCodes
  }

  const loadAggregateDimensions = async (codes: {
    [code: string]: string[]
  }) => {
    const aggregateDimensions = await OpenAIService.aggregateDimensions(codes)
    setAggregateDimensions(aggregateDimensions)
    return loadAggregateDimensions
  }

  const load = async () => {
    const codes = await loadInitialCodes()
    const focusCodes = await loadFocusCodes(codes)
    const aggregateDimensionCodes = await loadAggregateDimensions(focusCodes)
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <Space direction='vertical'>
      <Button onClick={loadInitialCodes}>Load Initial Codes</Button>
      <Button onClick={() => loadFocusCodes(initialCodes)}>Focus Codes</Button>
      <Button onClick={() => loadAggregateDimensions(focusCodes)}>
        Aggregate Dimensions
      </Button>
      <PaperTable
        papers={updatedPapers}
        responsiveToUpdates={true}
        customColumns={["Initial Codes"]}
      />
      <div>{JSON.stringify(aggregateDimensions, null, 2)}</div>
      <HierarchicalFlowchart data={aggregateDimensions || {}} />
    </Space>
  )
}
