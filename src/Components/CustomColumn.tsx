import React, { useState, useEffect } from "react"
import { Typography, Space } from "antd"
import { OpenAIService } from "../Services/OpenAIService"
import { AcademicPaper } from "../Types/AcademicPaper"

export const CustomColumn = (props: {
  record: AcademicPaper
  detail: string
  updatePaperDetail: (paperId: string, columnName: string, value: any) => void
}) => {
  // Use state to hold the value returned from getDetailAboutPaper
  const [detail, setDetail] = useState(
    (props?.record?.[props?.detail || ""] as string) || ""
  )

  // Use useEffect to call the async function and update the state
  useEffect(() => {
    let isMounted = true

    // Don't fetch data if the property already exists
    if (
      props.record.hasOwnProperty(props.detail) ||
      props?.record[props?.detail]
    ) {
      return
    }

    OpenAIService.getDetailAboutPaper(props?.record, props?.detail)
      .then((result) => {
        if (isMounted) {
          setDetail(result)
          // Update the table data directly
          props.updatePaperDetail(
            props.record.id?.toString() || "",
            props.detail,
            result
          )
        }
      })
      .catch((error) => {
        console.error("Failed to get details:", error)
      })

    return () => {
      isMounted = false
    }
  }, [props?.detail])

  return (
    <Space size={0} direction={"vertical"} style={{ width: "300px" }}>
      <Typography.Paragraph ellipsis={{ rows: 5 }} style={{ marginBottom: 0 }}>
        {detail} {/* Render the detail from state */}
      </Typography.Paragraph>
    </Space>
  )
}
