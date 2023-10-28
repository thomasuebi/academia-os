import { AcademicPaper } from "./AcademicPaper"

export interface ModelData {
  query?: string
  firstOrderCodes?: string[]
  secondOrderCodes?: { [key: string]: string[] }
  aggregateDimensions?: { [key: string]: string[] }
  modelDescription?: string
  modelVisualization?: string
  remarks?: string
  papers?: AcademicPaper[]
  interrelationships?: {
    concepts?: string[]
    interrelationship?: string
    evidence?: string
  }[]
}
