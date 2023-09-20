import React from "react"
import Mermaid from "./Mermaid"

export const GioiaCoding = ({
  firstOrderCodes,
  secondOrderCodes,
  aggregateDimensions,
}: {
  firstOrderCodes: string[]
  secondOrderCodes: { [key: string]: string[] }
  aggregateDimensions: { [key: string]: string[] }
}) => {
  const cleanCode = (code: string) => code?.replace(/(\s|-|\(|\))+/g, "_")
  const cleanText = (code: string) => code?.replace(/(\(|\))+/g, "_")

  const generateMermaidString = () => {
    let str = "graph LR\n"

    // Generate 1st order codes
    if (firstOrderCodes.length > 0) {
      str += 'subgraph "1st Order Codes"\n'
      firstOrderCodes.forEach((code) => {
        str += `  1st_${cleanCode(code)}[${cleanText(code)}]\n`
      })
      str += "end\n"
    }

    // Generate 2nd order codes and connect to 1st order codes
    if (Object.keys(secondOrderCodes).length > 0) {
      str += 'subgraph "2nd Order Codes"\n'
      for (const [key, values] of Object.entries(secondOrderCodes)) {
        str += `  2nd_${cleanCode(key)}[${cleanText(key)}]\n`
        values?.forEach?.((value) => {
          if (firstOrderCodes.includes(value)) {
            str += `  1st_${cleanCode(value)} --> 2nd_${cleanCode(key)}\n`
          }
        })
      }
      str += "end\n"
    }

    // Generate aggregate dimensions and connect to 2nd order codes
    if (Object.keys(aggregateDimensions).length > 0) {
      str += 'subgraph "Aggregate Dimensions"\n'
      for (const [key, values] of Object.entries(aggregateDimensions)) {
        str += `  agg_${cleanCode(key)}[${cleanText(key)}]\n`
        values?.forEach?.((value) => {
          if (Object.keys(secondOrderCodes).includes(value)) {
            str += `  2nd_${cleanCode(value)} --> agg_${cleanCode(key)}\n` // Connect Aggregate Dimensions to 2nd Order Codes
          }
        })
      }
      str += "end\n"
    }
    return str
  }

  return <Mermaid chart={generateMermaidString()} />
}
