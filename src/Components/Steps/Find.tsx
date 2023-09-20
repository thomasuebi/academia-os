import { Col, Form, Input, Row, Space, Tag, Typography } from "antd"
import React, { useEffect, useState } from "react"
import logo from "../../favicon.png"
import { PDFUpload } from "../PDFUpload"
import { AcademicPaper } from "../../Types/AcademicPaper"
import { SearchRepository } from "../../Services/SearchService"

const StepFind = (props: {
  onFinish: (payload: {
    searchQuery: string
    searchResults: AcademicPaper[]
  }) => void
  onLoadingChange?: (loading: boolean) => void
}) => {
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [results, setResults] = useState<AcademicPaper[]>([])

  const search = async (query: string) => {
    setSearchQuery(query)
    setSearchLoading(true)
    props?.onLoadingChange?.(true)
    let searchResults = [] as AcademicPaper[]
    try {
      searchResults =
        (await (await SearchRepository.searchPapers(query))?.nextPage()) || []
    } catch (error) {}
    if (!searchResults?.length) {
      // TODO: Use GPT to create a better search query instead
    }
    searchResults = searchResults?.map(
      (paper) =>
        ({
          fullText: paper?.fullText || paper?.abstract,
          id: paper?.corpusId,
          title: paper?.title,
          abstract: paper?.abstract,
          authors: paper?.authors,
          citationCount: paper?.citationCount,
          citations: paper?.citations,
          corpusId: paper?.corpusId,
          embedding: paper?.embedding,
          externalIds: paper?.externalIds,
          fieldsOfStudy: paper?.fieldsOfStudy,
          influentialCitationCount: paper?.influentialCitationCount,
          isOpenAccess: paper?.isOpenAccess,
          journal: paper?.journal,
          openAccessPdf: paper?.openAccessPdf,
          paperId: paper?.paperId,
          publicationDate: paper?.publicationDate,
          publicationTypes: paper?.publicationTypes,
          publicationVenue: paper?.publicationVenue,
          referenceCount: paper?.referenceCount,
          references: paper?.references,
          s2FieldsOfStudy: paper?.s2FieldsOfStudy,
          tldr: paper?.tldr,
          url: paper?.url,
          venue: paper?.venue,
          year: paper?.year,
        } as AcademicPaper)
    )
    setResults(searchResults)
    props?.onLoadingChange?.(false)
    props?.onFinish?.({ searchQuery: query, searchResults })
  }

  return (
    <>
      <div style={{ width: "100%", textAlign: "center", padding: "20px" }}>
        <img
          alt='AcademiaOS'
          src={logo}
          style={{ width: "50px", height: "50px", marginBottom: "-20px" }}
        />
        <Typography.Title>AcademiaOS</Typography.Title>
        <p style={{ marginTop: "-10px" }}>
          <Tag>Open Source</Tag> <Tag>OpenAI-Powered</Tag>
        </p>
      </div>
      <Row>
        <Col span={24}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
            <div
              style={{
                width: "100%",
                maxWidth: "400px",
                textAlign: "center",
              }}>
              <Form
                autoComplete='off'
                onFinish={(values) => search(values?.query)}>
                <Form.Item name='query'>
                  <Input
                    autoComplete='off'
                    autoFocus
                    disabled={searchLoading}
                    size='large'
                    placeholder='Search for Papers'
                  />
                </Form.Item>
              </Form>
              <Space>
                <PDFUpload
                  onAllUploadsFinished={(completedUploads) => {
                    setSearchLoading(true)
                    const searchResults = completedUploads.map(
                      (upload) =>
                        ({
                          title: upload?.title,
                          fullText: upload?.text,
                          id: `PDF-ID-${upload?.title}`,
                        } as AcademicPaper)
                    )
                    setResults(searchResults)
                    setSearchLoading(false)
                    props?.onFinish({ searchQuery, searchResults })
                  }}
                />
                {/* <Button type='link' icon={<CloudUploadOutlined />}>
                      Upload PDFs
                    </Button>
                    <Button type='link' icon={<BookOutlined />}>
                      From Library
                    </Button> */}
              </Space>
            </div>
          </div>
        </Col>
      </Row>
      {/* <Row gutter={16} style={{ marginTop: "50px" }}>
            <Col span={8}>
              <Card style={{ textAlign: "center" }}>
                Find relevant literature
              </Card>
            </Col>
            <Col span={8}>
              <Card style={{ textAlign: "center" }}>Analyze your own PDFs</Card>
            </Col>
            <Col span={8}>
              <Card style={{ textAlign: "center" }}>
                Work with interview transcripts
              </Card>
            </Col>
          </Row> */}
    </>
  )
}

export default StepFind
