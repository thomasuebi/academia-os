// Actual Component
import { useEffect, useState } from "react"
import { Table, Typography } from "antd"
import { ModelData } from "../../../Types/ModelData"
import { OpenAIService } from "../../../Services/OpenAIService"

export const Interrelationships = (props: {
  modelData: ModelData
  onModelDataChange: (modelData: ModelData) => void
}) => {
  const columns = [
    {
      title: "Concepts",
      dataIndex: "concepts",
      key: "concepts",
      render: (concepts: string[]) => concepts.join(" - "),
    },
    {
      title: "Interrelationship",
      dataIndex: "interrelationship",
      key: "interrelationship",
      render: (text: string, record: any, index: number) => (
        <>
          <Typography.Paragraph
            style={{ minWidth: "200px" }}
            title={text}
            ellipsis={{ rows: 3 }}>
            {text}
          </Typography.Paragraph>
        </>
      ),
    },
    {
      title: "Evidence",
      dataIndex: "evidence",
      key: "evidence",
      render: (text: string, record: any, index: number) => (
        <>
          <Typography.Paragraph title={text} ellipsis={{ rows: 3 }}>
            {text}
          </Typography.Paragraph>
        </>
      ),
    },
  ]

  return (
    <>
      <Table
        dataSource={props.modelData.interrelationships}
        columns={columns}
        rowKey='concepts'
      />
    </>
  )
}
