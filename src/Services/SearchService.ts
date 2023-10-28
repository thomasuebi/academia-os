// Import the SemanticScholar library
import { message } from "antd"
import type { PaginatedResults, Paper } from "semanticscholarjs"
import { SemanticScholar } from "semanticscholarjs"

export class SearchRepository {
  public static searchPapers = async (
    query?: string
  ): Promise<PaginatedResults<Paper> | null> => {
    const sch = new SemanticScholar()
    try {
      const paginatedResults = await sch.search_paper(
        encodeURIComponent(query || "")
      )
      return paginatedResults
    } catch (error) {
      console.log(error)
      message.error((error as any)?.message)
      return null
    }
  }
}
