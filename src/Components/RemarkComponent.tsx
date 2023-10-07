import React, { useState, useEffect } from "react"
import { AutoComplete, Input } from "antd"
import { OpenAIService } from "../Services/OpenAIService"
import { ModelData } from "../Types/ModelData"
import { AcademicPaper } from "../Types/AcademicPaper"
import { LoadingOutlined } from "@ant-design/icons"

export const RemarkComponent = (props: {
  papers: AcademicPaper[]
  value: string
  onValueChange: (val: string) => void
}) => {
  const [researchQuestions, setResearchQuestions] = useState<string[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  // Call the findTentativeResearchQuestions method whenever papers are updated
  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true)
      const questions = await OpenAIService.findTentativeResearchQuestions(
        props?.papers
      )
      setResearchQuestions(questions)
      setLoading(false)
    }

    fetchQuestions()
  }, [props?.papers])

  return (
    <div>
      <AutoComplete
        suffixIcon={loading && <LoadingOutlined />}
        style={{ width: 300 }}
        options={researchQuestions.map((question) => ({ value: question }))}
        value={props.value}
        onChange={(value) => {
          props?.onValueChange?.(value)
          console.log(value)
        }}
        placeholder='Free-text remarks or tentative research question ...'>
        <Input.TextArea />
      </AutoComplete>
    </div>
  )
}
