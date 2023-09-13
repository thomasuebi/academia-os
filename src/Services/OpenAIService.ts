// Import the SemanticScholar library
import { message } from "antd"
import type { Paper } from "semanticscholarjs"
import { Document } from "langchain/document"
import { CharacterTextSplitter } from "langchain/text_splitter"
import { asyncForEach } from "../Helpers/asyncForEach"
import { MemoryVectorStore } from "langchain/vectorstores/memory"
import { OpenAIEmbeddings } from "langchain/embeddings/openai"
import { uniqBy } from "../Helpers/uniqBy"
import { ChatOpenAI } from "langchain/chat_models/openai"
import { HumanMessage, SystemMessage } from "langchain/schema"
import { OpenAI } from "langchain/llms/openai"

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

  static async getDetailAboutPaper(paper: Paper, detail: string) {
    const model = new ChatOpenAI({
      maxTokens: 20,
      openAIApiKey: OpenAIService.getOpenAIKey(),
    })

    // TODO: Split long texts and search for the most relevant one first

    const result = await model.predictMessages([
      new SystemMessage(
        "You extract information from a paper. Answer the question shortly and concisely in only one or few words about the given abstract, no need for full sentences. Only reply with the answer. Does not have to be perfect, but if you don't have a somewhat acceptable answer, reply 'n/a'."
      ),
      new HumanMessage(
        `${paper?.title}\n${paper?.abstract}\n\nDescribe the '${detail}' of the given paper.`
      ),
    ])

    return result?.content === detail ? "n/a" : result?.content
  }
}
