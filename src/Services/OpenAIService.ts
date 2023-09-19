// Import the SemanticScholar library
import { message } from "antd"
import { Document } from "langchain/document"
import { CharacterTextSplitter } from "langchain/text_splitter"
import { asyncForEach } from "../Helpers/asyncForEach"
import { MemoryVectorStore } from "langchain/vectorstores/memory"
import { OpenAIEmbeddings } from "langchain/embeddings/openai"
import { uniqBy } from "../Helpers/uniqBy"
import { ChatOpenAI } from "langchain/chat_models/openai"
import { HumanMessage, SystemMessage } from "langchain/schema"
import { OpenAI } from "langchain/llms/openai"
import { AcademicPaper } from "../Types/AcademicPaper"

export class OpenAIService {
  public static getOpenAIKey = () => {
    return localStorage.getItem("openAIKey") || ""
  }
  static async streamCompletion(prompt: string, callback: any) {
    const chat = new ChatOpenAI({
      maxTokens: 800,
      streaming: true,
      openAIApiKey: OpenAIService.getOpenAIKey(),
    })

    await chat.call([new HumanMessage(prompt)], {
      callbacks: [
        {
          handleLLMNewToken(token) {
            callback(token)
          },
        },
      ],
    })
  }

  static async getDetailAboutPaper(paper: AcademicPaper, detail: string) {
    const model = new ChatOpenAI({
      maxTokens: 20,
      openAIApiKey: OpenAIService.getOpenAIKey(),
    })

    let fullText = paper?.fullText

    if ((paper?.fullText?.length || 0) > 5000) {
      const documents = []
      const splitter = new CharacterTextSplitter({
        separator: " ",
        chunkSize: 1000,
        chunkOverlap: 50,
      })
      const output = await splitter.createDocuments(
        [`${paper?.title || ""} ${paper?.fullText || ""}`],
        [{ id: paper?.corpusId }]
      )
      documents.push(...(output || []))

      // Create embeddings
      const embeddings = new OpenAIEmbeddings({
        openAIApiKey: OpenAIService.getOpenAIKey(),
      })
      // Create the Voy store.
      const store = new MemoryVectorStore(embeddings)

      // Add two documents with some metadata.
      await store.addDocuments(documents)

      const query = await embeddings.embedQuery(detail || "")

      // Perform a similarity search.
      const resultsWithScore = await store.similaritySearchVectorWithScore(
        query,
        4
      )

      fullText = resultsWithScore
        .map(([result, score]) => {
          return result.pageContent
        })
        ?.join("\n\n[...]\n\n")
    }

    if ((fullText?.length || 0) > 0) {
      const result = await model.predictMessages([
        new SystemMessage(
          "You extract information from a paper. Answer the question shortly and concisely in only one or few words about the given abstract, no need for full sentences. Only reply with the answer. Does not have to be perfect, but if you don't have a somewhat acceptable answer, reply 'n/a'."
        ),
        new HumanMessage(
          `${paper?.title}\n${fullText}\n\nDescribe the '${detail}' of the given paper.`
        ),
      ])

      return result?.content === detail ? "n/a" : result?.content
    }
    return ""
  }
}
