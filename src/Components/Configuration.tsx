import React from "react"
import { Modal, Form, FormInstance } from "antd"
import ConfigurationForm from "./ConfigurationForm"
import Paragraph from "antd/es/typography/Paragraph"

interface ConfigurationModalProps {
  isVisible: boolean
  toggleModal: () => void
}

const ConfigurationModal: React.FC<ConfigurationModalProps> = ({
  isVisible,
  toggleModal,
}) => {
  return (
    <Modal
      title='Unlock a World of Possibilities'
      visible={isVisible}
      onCancel={toggleModal}
      footer={null} // Disable the default OK and Cancel buttons
    >
      <Paragraph>
        We're excited to introduce you to a platform of advanced AI features.
        Just a little info from you, and we're all set!
      </Paragraph>
      <ConfigurationForm onSubmit={toggleModal} />
    </Modal>
  )
}

export default ConfigurationModal
