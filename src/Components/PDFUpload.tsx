import React, { useState, useEffect, FC } from "react"
import { Upload, Button, Spin, Typography, Badge } from "antd"
import { UploadOutlined } from "@ant-design/icons"
import { RcFile, UploadProps } from "antd/lib/upload"
import { PDFService } from "../Services/PDFService" // Path might differ based on your setup

interface UploadTestProps {
  onAllUploadsFinished?: (
    completedUploads: { text: string; title: string }[]
  ) => void
}

export const PDFUpload: FC<UploadTestProps> = ({ onAllUploadsFinished }) => {
  const [texts, setTexts] = useState<string[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [uploadCount, setUploadCount] = useState<number>(0)
  const [completedUploads, setCompletedUploads] = useState<
    { text: string; title: string }[]
  >([])

  useEffect(() => {
    if (uploadCount > 0 && completedUploads.length === uploadCount) {
      if (onAllUploadsFinished) {
        onAllUploadsFinished(completedUploads)
      }
      setLoading(false)
    }
  }, [completedUploads, uploadCount])

  const customRequest = async ({ onSuccess, onError, file }: any) => {
    try {
      setLoading(true)
      const reader = new FileReader()
      reader.readAsArrayBuffer(file)

      reader.onloadend = async () => {
        const arrayBuffer = reader.result as ArrayBuffer
        if (file.name?.toLowerCase()?.endsWith(".pdf")) {
          const extractedText = await PDFService.uploadAndExtractPDF(
            arrayBuffer
          )
          setCompletedUploads((prev) => [
            ...prev,
            { text: extractedText, title: file.name },
          ])
          onSuccess()
        } else {
          // if (file.name?.toLowerCase()?.endsWith(".json"))
          const json = new TextDecoder().decode(arrayBuffer)
          setCompletedUploads((prev) => [
            ...prev,
            { text: json, title: file.name },
          ])
          onSuccess()
        }
      }
    } catch (e) {
      onError(e as Error)
    }
  }

  const beforeUpload: UploadProps["beforeUpload"] = (file, fileList) => {
    setUploadCount(fileList.length)
    return true
  }

  return (
    <div>
      <Badge count={uploadCount}>
        <Upload
          customRequest={customRequest}
          showUploadList={false}
          multiple={true}
          beforeUpload={beforeUpload}>
          <Button loading={loading} icon={<UploadOutlined />}>
            Upload PDFs
          </Button>
        </Upload>
      </Badge>
    </div>
  )
}
