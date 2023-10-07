import { FilePdfOutlined, LinkOutlined } from "@ant-design/icons"
import { Card, Col, Row, Space, Typography } from "antd"
import { AcademicPaper } from "../Types/AcademicPaper"

export const PaperComponent = (props: {
  tabKey?: string
  paper?: AcademicPaper
}) => {
  return (
    <Row>
      <Col
        xs={24}
        sm={24}
        md={12}
        lg={10}
        xl={10}
        style={{ paddingRight: "20px" }}>
        <Card style={{ marginBottom: "20px" }}>
          <Space size={0} direction={"vertical"}>
            <Typography.Title
              level={3}
              style={{
                marginTop: 0,
                marginBottom: 0,
              }}>
              {props?.paper?.title}
            </Typography.Title>
            <Typography.Paragraph type='secondary' style={{ marginBottom: 0 }}>
              {props?.paper?.authors?.map((author) => author.name).join(", ")}
            </Typography.Paragraph>
            <Typography.Paragraph type='secondary' style={{ marginBottom: 0 }}>
              {props?.paper?.journal?.name}
            </Typography.Paragraph>
            <Typography.Paragraph
              type='secondary'
              strong
              style={{ marginBottom: 0 }}>
              <span style={{ marginRight: 20 }}>{props?.paper?.year}</span>
              <span style={{ marginRight: 20 }}>
                {(props?.paper?.citationCount ?? 0).toLocaleString("en-US")}{" "}
                citations
              </span>
              <span style={{ marginRight: 20 }}>
                {(props?.paper?.url as any) && (
                  <a target={"_blank"} href={props?.paper?.url as any}>
                    <LinkOutlined /> URL
                  </a>
                )}
              </span>
              <span style={{ marginRight: 20 }}>
                {(props?.paper?.openAccessPdf as any)?.status === "GREEN" && (
                  <a
                    target={"_blank"}
                    href={(props?.paper?.openAccessPdf as any)?.url}>
                    <FilePdfOutlined /> PDF
                  </a>
                )}
              </span>
              {/* {props?.paper.} */}
            </Typography.Paragraph>
          </Space>
        </Card>
      </Col>
      <Col xs={24} sm={24} md={12} lg={14} xl={14}>
        {/* <Card> */}
        <Typography.Paragraph
          style={{
            fontSize: "14pt",
            fontFamily: "Times New Roman",
          }}>
          {props?.paper?.fullText}
        </Typography.Paragraph>
        {/* </Card> */}
      </Col>
    </Row>
  )
}
