import { Paper } from "semanticscholarjs"

export interface AcademicPaper extends Paper {
  fullText?: string
  id?: string
  [key: string]: any
}
