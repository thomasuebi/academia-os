// Import the SemanticScholar library
import { message } from "antd"
import type { Paper } from "semanticscholarjs"
import { Document } from "langchain/document"
import { CharacterTextSplitter } from "langchain/text_splitter"
import { asyncForEach } from "../Helpers/asyncForEach"
import { MemoryVectorStore } from "langchain/vectorstores/memory"
import { OpenAIEmbeddings } from "langchain/embeddings/openai"
import { uniqBy } from "../Helpers/uniqBy"
import { OpenAIService } from "./OpenAIService"

export class RankingService {
  public static rankPapers = async (
    queryString?: string,
    papers?: Paper[]
  ): Promise<Paper[]> => {
    try {
      const documents = [] as Document[]
      await asyncForEach(papers || [], async (paper) => {
        const splitter = new CharacterTextSplitter({
          separator: " ",
          chunkSize: 1000,
          chunkOverlap: 50,
        })
        const output = await splitter.createDocuments(
          [`${paper?.title || ""} ${paper?.abstract || ""}`],
          [{ id: paper?.corpusId }]
        )
        documents.push(...(output || []))
      })

      // Create embeddings
      const embeddings = new OpenAIEmbeddings({
        openAIApiKey: OpenAIService.getOpenAIKey(),
      })
      // Create the Voy store.
      const store = new MemoryVectorStore(embeddings)

      // Add two documents with some metadata.
      await store.addDocuments(documents)

      const query = await embeddings.embedQuery(queryString || "")

      // Perform a similarity search.
      const resultsWithScore = await store.similaritySearchVectorWithScore(
        query,
        15
      )
      // Print the results.
      console.log(JSON.stringify(resultsWithScore, null, 2))

      return (
        (uniqBy(
          resultsWithScore.map(([result, score]) => {
            return papers?.find(
              (paper) => paper?.corpusId === result?.metadata?.id
            )
          }),
          (paper) => paper?.corpusId || ""
        )?.filter((paper) => paper) as Paper[]) || []
      )
    } catch (error) {
      console.log(error)
      message.error((error as any)?.message)
      return papers || []
    }
  }
}
