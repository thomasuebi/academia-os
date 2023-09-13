import React from "react"
import { Form, Input, Typography, FormInstance, Button } from "antd"
import axios from "axios"

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

      // Assuming 'values.email' contains the user's email
      const email = values.email
      const openAIKey = values.openAIKey

      localStorage.setItem("email", email)
      localStorage.setItem("openAIKey", openAIKey)

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
            value: email,
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
