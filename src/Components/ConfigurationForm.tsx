import React from "react"
import { Form, Input, Typography, FormInstance, Button } from "antd"

const { Paragraph, Text } = Typography

interface ConfigurationFormProps {
  onSubmit?: () => void
}

const ConfigurationForm: React.FC<ConfigurationFormProps> = ({ onSubmit }) => {
  const [form] = Form.useForm<FormInstance>()

  const handleSubmit = async () => {
    try {
      const values = (await form.validateFields()) as any
      console.log("Form values:", values)
      localStorage.setItem("email", values.email)
      localStorage.setItem("openAIKey", values.openAIKey)
      onSubmit && onSubmit()
      form.resetFields()
    } catch (error) {
      console.log("Validation failed:", error)
    }
  }

  return (
    <>
      <Form form={form} layout='vertical'>
        <Form.Item
          //   label='Email Address'
          name='email'
          extra='We will keep you updated about new features and updates.'>
          <Input
            placeholder='john.doe@example.com'
            defaultValue={localStorage.getItem("email") || ""}
          />
        </Form.Item>
        <Form.Item
          //   label='OpenAI Key'
          name='openAIKey'
          extra='This key is needed to access advanced AI functionalities.'>
          <Input.Password
            placeholder='Enter your OpenAI API key'
            defaultValue={localStorage.getItem("openAIKey") || ""}
          />
        </Form.Item>
        {/* <Paragraph type='secondary'>
          <Text>
            We respect your privacy and handle your information with care.
          </Text>
        </Paragraph> */}
        <div style={{ width: "100%", textAlign: "center" }}>
          <Button type='primary' onClick={handleSubmit}>
            Submit
          </Button>
        </div>
      </Form>
    </>
  )
}

export default ConfigurationForm
