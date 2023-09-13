import React, { useState, useEffect } from "react"
import { Typography, Space } from "antd"
import { OpenAIService } from "../Services/OpenAIService"
import { Paper } from "semanticscholarjs"

export const CustomColumn = (props: { record: Paper; detail: string }) => {
  // Use state to hold the value returned from getDetailAboutPaper
  const [detail, setDetail] = useState("")

  // Use useEffect to call the async function and update the state
  useEffect(() => {
    let isMounted = true // To prevent state update if the component is unmounted

    OpenAIService.getDetailAboutPaper(props?.record, props?.detail)
      .then((result) => {
        if (isMounted) {
          setDetail(result)
        }
      })
      .catch((error) => {
        console.error("Failed to get details:", error)
      })

    return () => {
      isMounted = false
    } // Cleanup
  }, [props?.record, props?.detail]) // Dependency array

  return (
    <Space size={0} direction={"vertical"} style={{ width: "300px" }}>
      <Typography.Paragraph ellipsis={{ rows: 5 }} style={{ marginBottom: 0 }}>
        {detail} {/* Render the detail from state */}
      </Typography.Paragraph>
    </Space>
  )
}
