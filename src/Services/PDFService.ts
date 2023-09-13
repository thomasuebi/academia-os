import { message, notification } from "antd"
import axios from "axios"
import * as pdfjsLib from "pdfjs-dist/webpack"
const qs = require("querystring")

export class PDFService {
  static async extractTextFromPDF(pdfArrayBuffer: ArrayBuffer) {
    const pdf = await pdfjsLib.getDocument({ data: pdfArrayBuffer }).promise
    let textContent = ""

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const text = await page.getTextContent()
      const strings = text.items.map((item: any) => (item as any)?.str)
      textContent += strings.join(" ")
    }

    return textContent
  }

  static async uploadAndExtractPDF(pdfArrayBuffer: ArrayBuffer) {
    let text = ""
    try {
      text = await PDFService.extractTextFromPDF(pdfArrayBuffer)

      if (text.split(" ").length > 50) {
        return text
      }
    } catch (error) {}

    const clientId = localStorage.getItem("client_id")
    const clientSecret = localStorage.getItem("client_secret")
    if (!(clientId && clientSecret)) {
      notification.error({
        message:
          "Scanned PDF. OCR needed. Please set the Adobe PDF Extract API client id and client secret first.",
      })
      return
    }

    // Step 1: Get the Access Token
    const body = qs.stringify({
      client_id: clientId,
      client_secret: clientSecret,
    })

    const { data: tokenData } = await axios.post(
      "https://pdf-services.adobe.io/token",
      body,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    )
    const token = tokenData.access_token

    // Step 2: Create an Asset
    const { data: assetData } = await axios.post(
      "https://pdf-services.adobe.io/assets",
      {
        mediaType: "application/pdf",
      },
      {
        headers: {
          "X-API-Key": clientId,
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    )
    console.log(assetData)
    const uploadUrl = assetData.uploadUri
    const assetId = assetData.assetID
    // Step 3: Upload PDF to Asset
    await axios.put(
      uploadUrl,
      new Blob([pdfArrayBuffer], { type: "application/pdf" }),
      {
        headers: {
          "Content-Type": "application/pdf",
        },
      }
    )

    // Step 4: Extract Text from PDF
    const { headers: extractionHeaders } = await axios.post(
      "https://pdf-services.adobe.io/operation/extractpdf",
      {
        assetID: assetId,
        elementsToExtract: ["text"],
      },
      {
        headers: {
          "x-api-key": clientId,
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    )
    console.log("Text extraction initiated.", extractionHeaders.location)

    const jobId = assetId
    let status = "in progress"
    let downloadUri = ""

    console.log("Polling for status...")
    while (status === "in progress") {
      const { data: statusData } = await axios.get(extractionHeaders.location, {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-api-key": clientId,
        },
      })

      status = statusData.status
      console.log(`Current status: ${status}`)

      if (status === "done") {
        downloadUri = statusData.content.downloadUri
        console.log("Extraction done. Fetching the download URI.")
        break
      } else if (status === "failed") {
        console.error("PDF extraction failed")
        throw new Error("PDF extraction failed")
      }

      await new Promise((resolve) => setTimeout(resolve, 2000))
    }

    // Downloading the asset if status is "done"
    console.log("Downloading the extracted content...")
    if (downloadUri) {
      const extractedResponse = await axios.get(downloadUri, {
        // responseType: "blob",
      })
      console.log("Downloaded successfully.", extractedResponse)
      return extractedResponse?.data?.elements
        ?.map((element: any) => element?.Text)
        ?.filter((text: string) => text)
        ?.join(",")
    }

    console.error("PDF extraction failed")
    // Assume the extracted text is in the `text` field
    return ""
  }
}
