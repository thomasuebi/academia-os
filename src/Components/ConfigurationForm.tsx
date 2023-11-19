import React from "react"
import {
  Form,
  Input,
  Typography,
  FormInstance,
  Button,
  Space,
  Row,
  Col,
  Select,
} from "antd"
import axios from "axios"

const { Paragraph, Text } = Typography

interface ConfigurationFormProps {
  onSubmit?: () => void
}

const ConfigurationForm: React.FC<ConfigurationFormProps> = ({ onSubmit }) => {
  const [form] = Form.useForm<FormInstance>()
  const [showMoreOptions, setShowMoreOptions] = React.useState(false)

  const defaultValues = {
    openAIKey: localStorage.getItem("openAIKey"),
    email: localStorage.getItem("email"),
    heliconeEndpoint: localStorage.getItem("heliconeEndpoint"),
    heliconeKey: localStorage.getItem("heliconeKey"),
    adobePDFOCR_client_id: localStorage.getItem("adobePDFOCR_client_id"),
    adobePDFOCR_client_secret: localStorage.getItem(
      "adobePDFOCR_client_secret"
    ),
  }

  const handleSubmit = async () => {
    try {
      const values = (await form.validateFields()) as any
      console.log("Form values:", values)

      localStorage.setItem("modelName", values.modelName ?? "gpt-3.5-turbo")

      localStorage.setItem("email", values.email ?? defaultValues.email ?? "")
      localStorage.setItem(
        "openAIKey",
        values.openAIKey ?? defaultValues.openAIKey ?? ""
      )
      localStorage.setItem(
        "heliconeEndpoint",
        values.heliconeEndpoint ?? defaultValues.heliconeEndpoint ?? ""
      )
      localStorage.setItem(
        "heliconeKey",
        values.heliconeKey ?? defaultValues.heliconeKey ?? ""
      )
      localStorage.setItem(
        "adobePDFOCR_client_id",
        values.adobePDFOCR_client_id ??
          defaultValues.adobePDFOCR_client_id ??
          ""
      )
      localStorage.setItem(
        "adobePDFOCR_client_secret",
        values.adobePDFOCR_client_secret ??
          defaultValues.adobePDFOCR_client_secret ??
          ""
      )

      try {
        // Hubspot API configurations
        const portalId = "26150643"
        const formId = "77f39c46-20a4-43f7-807a-c44a17caac8a"
        const url = `https://api.hsforms.com/submissions/v3/integration/submit/${portalId}/${formId}`

        // Create payload
        const data = {
          submittedAt: new Date().getTime().toString(),
          fields: [
            {
              name: "email",
              value: values.email,
            },
          ],
          // Include any other context data or legal consent options you need
        }

        // Make API request
        const response = await axios.post(url, data, {
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (response.status === 200) {
          console.log("Submission successful:", response.data)
        }
      } catch (error) {}

      // Trigger any other submit actions
      onSubmit && onSubmit()

      // Reset the form
      form.resetFields()
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log("Axios error:", error.response?.data)
      } else {
        console.log("Validation or other error:", error)
      }
    }
  }

  return (
    <>
      <Form form={form} layout='vertical'>
        {/* <Form.Item
          //   label='Email Address'
          name='email'
          extra='We will keep you updated about new features and updates.'>
          <Input
            placeholder='john.doe@example.com'
            defaultValue={defaultValues.email || ""}
          />
        </Form.Item> */}
        <Form.Item
          //   label='OpenAI Key'
          name='openAIKey'
          extra={
            <span>
              This{" "}
              <Typography.Link
                target='_blank'
                href='https://platform.openai.com/'>
                OpenAI key
              </Typography.Link>{" "}
              for AI functionalities, only stored in your browser.
            </span>
          }>
          <Input.Password
            placeholder='Enter your OpenAI API key'
            defaultValue={defaultValues.openAIKey || ""}
          />
        </Form.Item>
        {showMoreOptions && (
          <>
            <Row>
              <Col span={24}>
                <Form.Item
                  name='modelName'
                  extra='Select the OpenAI model you want to use'>
                  <Select
                    placeholder='Choose OpenAI Model'
                    defaultValue={
                      localStorage.getItem("modelName") || "gpt-4-1106-preview"
                    }>
                    <Select.Option value='gpt-4-1106-preview'>
                      GPT-4-1106-Preview (GPT-4 turbo with 128k context window)
                    </Select.Option>
                    <Select.Option value='gpt-4'>GPT-4</Select.Option>
                    <Select.Option value='gpt-3.5-turbo'>
                      GPT-3.5-Turbo
                    </Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={12}>
              <Col span={12}>
                <Form.Item
                  //   label='OpenAI Key'
                  name='heliconeEndpoint'
                  extra={
                    <span>
                      Use{" "}
                      <Typography.Link
                        target='_blank'
                        href='https://www.helicone.ai/'>
                        Helicone.ai
                      </Typography.Link>{" "}
                      to track your usage.
                    </span>
                  }>
                  <Input
                    placeholder='Helicone Endpoint (optional)'
                    defaultValue={defaultValues.heliconeEndpoint || ""}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  //   label='OpenAI Key'
                  name='heliconeKey'>
                  <Input.Password
                    placeholder='Helicone Key (optional)'
                    defaultValue={defaultValues.heliconeKey || ""}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={12}>
              <Col span={12}>
                <Form.Item
                  //   label='OpenAI Key'
                  name='adobePDFOCR_client_id'
                  extra={
                    <span>
                      Use{" "}
                      <Typography.Link
                        target='_blank'
                        href='https://developer.adobe.com/document-services/docs/overview/pdf-services-api/gettingstarted/'>
                        Adobe
                      </Typography.Link>{" "}
                      to read scanned PDFs.
                    </span>
                  }>
                  <Input
                    placeholder='Adobe OCR Client ID (optional)'
                    defaultValue={defaultValues.adobePDFOCR_client_id || ""}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  //   label='OpenAI Key'
                  name='adobePDFOCR_client_secret'>
                  <Input.Password
                    placeholder='Adobe OCR Client Secret (optional)'
                    defaultValue={defaultValues.adobePDFOCR_client_secret || ""}
                  />
                </Form.Item>
              </Col>
            </Row>
          </>
        )}

        <div style={{ width: "100%", textAlign: "center" }}>
          {showMoreOptions ? (
            <Button type='link' onClick={() => setShowMoreOptions(false)}>
              Less Options
            </Button>
          ) : (
            <Button type='link' onClick={() => setShowMoreOptions(true)}>
              More Options
            </Button>
          )}
          <Button type='primary' onClick={handleSubmit}>
            Submit
          </Button>
        </div>
      </Form>
    </>
  )
}

export default ConfigurationForm
