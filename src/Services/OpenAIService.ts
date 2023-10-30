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
import { type ClientOptions } from "openai"
import { ModelData } from "../Types/ModelData"
import { asyncMap } from "../Helpers/asyncMap"

export class OpenAIService {
  public static getOpenAIKey = () => {
    return localStorage.getItem("openAIKey") || ""
  }

  public static handleError = (error: any) => {
    message.error(error.message || error?.response?.data?.message || error)
  }

  static async streamCompletion(prompt: string, callback: any) {
    try {
      const chat = new ChatOpenAI(
        {
          maxTokens: 800,
          streaming: true,
          openAIApiKey: OpenAIService.getOpenAIKey(),
        },
        OpenAIService.openAIConfiguration()
      )

      await chat.call([new HumanMessage(prompt)], {
        callbacks: [
          {
            handleLLMNewToken(token) {
              callback(token)
            },
          },
        ],
      })
    } catch (error) {
      OpenAIService.handleError(error)
    }
  }

  static async getDetailAboutPaper(paper: AcademicPaper, detail: string) {
    try {
      const model = new ChatOpenAI(
        {
          maxTokens: 20,
          openAIApiKey: OpenAIService.getOpenAIKey(),
        },
        OpenAIService.openAIConfiguration()
      )

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
          [{ id: paper?.id || paper?.corpusId }]
        )
        documents.push(...(output || []))

        // Create embeddings
        const embeddings = new OpenAIEmbeddings(
          {
            openAIApiKey: OpenAIService.getOpenAIKey(),
          },
          OpenAIService.openAIConfiguration()
        )
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
    } catch (error) {
      OpenAIService.handleError(error)
      return ""
    }
  }

  static async findTentativeResearchQuestions(
    papers: AcademicPaper[]
  ): Promise<string[]> {
    try {
      const model = new ChatOpenAI(
        {
          maxTokens: 400,
          openAIApiKey: OpenAIService.getOpenAIKey(),
        },
        OpenAIService.openAIConfiguration()
      )

      if ((papers?.length || 0) > 0) {
        const result = await model.predictMessages([
          new SystemMessage(
            "You are provided with a list of paper titles and you are tasked to find research questions that might be answered developing a new theoretical model. Return a JSON array of strings, each representing a potential research question. Return only a JSON array of strings, no additional text."
          ),
          new HumanMessage(
            `${papers
              .map((paper) => `- ${paper?.title}`)
              .join(
                "\n"
              )}\n\nNow, provide an array of 5 potential research questions.`
          ),
        ])
        try {
          const codes = result?.content
            ? JSON.parse(result?.content?.replace(/\\n/g, " "))
            : []
          return codes
        } catch (error) {
          console.log(error)
        }
      }
      return []
    } catch (error) {
      OpenAIService.handleError(error)
      return []
    }
  }

  static async initialCodingOfPaper(paper: AcademicPaper, remarks?: string) {
    try {
      const model = new ChatOpenAI(
        {
          maxTokens: 300, // Modify as needed
          openAIApiKey: OpenAIService.getOpenAIKey(),
        },
        OpenAIService.openAIConfiguration()
      )

      let fullText = paper?.fullText
      let chunks = []

      // Splitting the paper into smaller chunks if it's too large
      if ((paper?.fullText?.length || 0) > 5000) {
        const splitter = new CharacterTextSplitter({
          separator: " ",
          chunkSize: 10000,
          chunkOverlap: 50,
        })
        const output = await splitter.createDocuments(
          [`${paper?.title || ""} ${paper?.fullText || ""}`],
          [{ id: paper?.id || paper?.corpusId }]
        )
        chunks.push(...(output || []))
      } else {
        chunks.push({
          id: paper?.id || paper?.corpusId,
          pageContent: fullText,
        })
      }

      // Initialize array to hold codes for each chunk
      let initialCodesArray = [] as string[]

      // Loop through each chunk and apply initial coding
      await asyncForEach(chunks, async (chunk, index) => {
        console.log(`Processing chunk ${index + 1} of ${chunks.length}`)
        const result = await model.predictMessages([
          new SystemMessage(
            'You are tasked with applying the initial coding phase of the Gioia method to the provided academic paper. In this phase, scrutinize the text to identify emergent themes, concepts, or patterns. Your output should be a JSON-formatted array of strings no longer than 7 words, each representing a distinct initial code in the language of the raw source. For example, your output should look like this: ["Emergent Theme 1", "Notable Concept", "Observed Pattern"]. Ensure to return ONLY a proper JSON array of strings.'
          ),
          new HumanMessage(
            `${paper?.title}\n${
              chunk.pageContent
            }\n\nPerform initial coding according to the Gioia method on the given paper.${
              remarks ? ` Remark: ${remarks}. ` : ""
            } Return a JSON array.`
          ),
        ])

        try {
          const codes = result?.content
            ? JSON.parse(result?.content?.replace(/\\n/g, " "))
            : []
          initialCodesArray.push(...codes)
        } catch (error) {
          console.log(error)
        }
      })

      return initialCodesArray
    } catch (error) {
      OpenAIService.handleError(error)
      return []
    }
  }

  static openAIConfiguration() {
    const heliconeEndpoint = localStorage.getItem("heliconeEndpoint")
    return {
      basePath: heliconeEndpoint || undefined,
      baseOptions: {
        headers: {
          "Helicone-Auth": `Bearer ${localStorage.getItem("heliconeKey")}`,
        },
      },
      // timeout: 30000,
    } as ClientOptions
  }

  static async secondOrderCoding(codesArray: string[]) {
    try {
      const model = new ChatOpenAI(
        {
          maxTokens: 2000,
          openAIApiKey: OpenAIService.getOpenAIKey(),
        },
        OpenAIService.openAIConfiguration()
      )

      let chunks = []

      const jsonString = JSON.stringify(codesArray)

      // Splitting the paper into smaller chunks if it's too large
      if ((jsonString.length || 0) > 5000) {
        const splitter = new CharacterTextSplitter({
          separator: " ",
          chunkSize: 5000,
          chunkOverlap: 50,
        })
        const output = await splitter.createDocuments([jsonString], [{}])
        chunks.push(...(output || []))
      } else {
        chunks.push({
          pageContent: jsonString,
        })
      }

      // Initialize array to hold codes for each chunk
      const secondOrderCodes = {} as any

      // Loop through each chunk and apply initial coding
      await asyncForEach(chunks, async (chunk, index) => {
        // Create a message prompt for 2nd order coding
        const result = await model.predictMessages([
          new SystemMessage(
            'You are tasked with applying the 2nd Order Coding phase of the Gioia method. In this phase, identify higher-level themes or categories that aggregate the initial codes. Your output should be a JSON-formatted object mapping each higher-level theme to an array of initial codes that belong to it. As a general example, "employee sentiment" could be a 2nd order code to 1st level codes "Positive feelings toward new policy" and "Sense of control" Your output should look like this, where the keys are the higher-level concepts: {"Some higher-Level theme": ["some initial code", "another initial code"], "Another higher-level theme": ["some initial code"]}. Ensure to return ONLY a proper JSON object.'
          ),
          new HumanMessage(
            `Part of the initial codes are as follows: ${chunk.pageContent}\n\nPerform 2nd Order Coding according to the Gioia method and return a JSON object of 12 focus codes.`
          ),
        ])
        // Parse the output and return
        try {
          const newSecondOrderCodes = result?.content
            ? JSON.parse(result?.content?.replace(/\\n/g, " "))
            : {}
          Object.keys(newSecondOrderCodes).forEach((key) => {
            secondOrderCodes[key] = uniqBy(
              [...(secondOrderCodes[key] || []), ...newSecondOrderCodes[key]],
              (item) => item
            )
          })
        } catch (error) {
          console.log(error)
        }
      })
      return secondOrderCodes
    } catch (error) {
      OpenAIService.handleError(error)
      return {}
    }
  }

  static async aggregateDimensions(secondOrderCodes: Record<string, string[]>) {
    try {
      const model = new ChatOpenAI(
        {
          maxTokens: 2000,
          openAIApiKey: OpenAIService.getOpenAIKey(),
        },
        OpenAIService.openAIConfiguration()
      )

      // Convert the JSON object of 2nd order codes into a JSON string
      const jsonString = JSON.stringify(Object.keys(secondOrderCodes))

      // Create a message prompt for the Aggregate Dimensions phase
      const result = await model.predictMessages([
        new SystemMessage(
          'You are tasked with applying the Aggregate Dimensions phase of the Gioia method. In this phase, identify overarching theoretical dimensions (5-7) that aggregate the 2nd order codes. Your output should be a JSON-formatted object mapping each aggregate dimension to an array of 2nd order codes that belong to it. As a (probably unrelated) general example, "Policy Usability" could make for a good, quantifiable dimension. Your output should look like this, where the keys are the (quantifiable) dimensions: {"some dim": ["theme", "another theme"], "another dim": ["theme123"]}. Ensure that the aggregate dimensions are grounded in the themes and to return ONLY a proper JSON object.'
        ),
        new HumanMessage(
          `The 2nd order codes are as follows: ${jsonString}\n\nPerform aggregation into theoretical dimensions according to the Gioia method and return a JSON object.`
        ),
      ])

      // Parse the output and return
      try {
        const aggregateDimensions = result?.content
          ? JSON.parse(result?.content?.replace(/\\n/g, " "))
          : {}
        return aggregateDimensions
      } catch (error) {
        console.log(error)
        return {}
      }
    } catch (error) {
      OpenAIService.handleError(error)
      return {}
    }
  }

  static async brainstormApplicableTheories(
    aggregateDimensions: Record<string, string[]>
  ) {
    try {
      const model = new ChatOpenAI(
        {
          maxTokens: 2000,
          openAIApiKey: OpenAIService.getOpenAIKey(),
        },
        OpenAIService.openAIConfiguration()
      )

      // Convert the JSON object of aggregate dimensions into a JSON string
      const jsonString = JSON.stringify(aggregateDimensions)

      // Create a message prompt for brainstorming applicable theories
      const result = await model.predictMessages([
        new SystemMessage(
          `Your task is to brainstorm theoretical models from existing literature that could be applicable to the research findings. Each theory should be well-defined and should relate to one or more aggregate dimensions. The output should be a JSON-formatted array following this schema: 
          [{"theory": string, "description": string, "relatedDimensions": string[], "possibleResearchQuestions": string[]}]
          `
        ),
        new HumanMessage(
          `Our research aims to understand specific phenomena within a given context. We have identified multiple aggregate dimensions and second-order codes that emerged from our data. Could you suggest theories that could help explain these dimensions and codes? The aggregate dimensions and codes are as follows: ${jsonString}`
        ),
      ])

      // Parse the output and return
      try {
        const applicableTheories = result?.content
          ? JSON.parse(result?.content?.replace(/\\n/g, " "))
          : []
        return applicableTheories
      } catch (error) {
        console.log(error)
        return []
      }
    } catch (error) {
      OpenAIService.handleError(error)
      return []
    }
  }

  static async conceptTuples(
    modelData: ModelData
  ): Promise<[string, string][]> {
    try {
      const model = new ChatOpenAI(
        {
          maxTokens: 2000,
          openAIApiKey: OpenAIService.getOpenAIKey(),
        },
        OpenAIService.openAIConfiguration()
      )

      // Convert the JSON object of aggregate dimensions into a JSON string
      const jsonString = JSON.stringify(modelData?.aggregateDimensions)

      // Create a message prompt for brainstorming applicable theories
      const result = await model.predictMessages([
        new SystemMessage(
          `Your task is to hypothesize which concepts could be related to each other. Return a JSON-formatted array of tuple arrays, where each tuple array represents a possible relationship between two concepts. The output should be a JSON-formatted array following this schema: [[string, string], [string, string], ...]. E.g. [["Knowledge Management", "Organizational Performance"]] This allows us to in the next step research the relationship between the concepts in the literature.`
        ),
        new HumanMessage(
          `Our research aims to understand ${
            modelData.query || "specific phenomena within a given context"
          }.${
            modelData.remarks ? `Remarks: ${modelData.remarks}.` : ""
          } We have identified multiple aggregate dimensions and second-order codes that emerged from our data.
          ${jsonString}
          Now, hypothesize which concepts could be related to each other and return only the JSON-formatted array of 10 - 20 tuples.`
        ),
      ])

      // Parse the output and return
      try {
        const conceptTuples = result?.content
          ? JSON.parse(result?.content?.replace(/\\n/g, " "))
          : []
        return conceptTuples
      } catch (error) {
        console.log(error)
        return []
      }
    } catch (error) {
      OpenAIService.handleError(error)
      return []
    }
  }

  static async findRelevantParagraphsAndSummarize(
    modelData: ModelData,
    conceptTuples: [string, string][]
  ): Promise<
    {
      concepts: string[]
      interrelationship: string
      evidence: string
    }[]
  > {
    try {
      const documents: Document[] = []
      const embeddings = new OpenAIEmbeddings(
        {
          openAIApiKey: OpenAIService.getOpenAIKey(),
        },
        OpenAIService.openAIConfiguration()
      )

      // Create MemoryVectorStore for embeddings
      const store = new MemoryVectorStore(embeddings)

      // Split text and prepare documents
      await asyncForEach(modelData.papers || [], async (paper) => {
        const splitter = new CharacterTextSplitter({
          separator: " ",
          chunkSize: 1000,
          chunkOverlap: 50,
        })

        const output = await splitter.createDocuments(
          [`${paper?.title || ""} ${paper?.fullText || ""}`],
          [{ id: paper?.id }]
        )
        documents.push(...(output || []))
      })

      // Add documents to store
      await store.addDocuments(documents)

      const interrelationShips = await asyncMap(
        conceptTuples,
        async ([concept1, concept2]) => {
          const query1 = await embeddings.embedQuery(
            `${concept1} - ${concept2} relationship`
          )

          const resultsWithScore = await store.similaritySearchVectorWithScore(
            query1,
            4
          )

          const relevantParagraphs1 = resultsWithScore
            .map(([result, score]) => {
              return result.pageContent
            })
            ?.join("\n\n")

          // Now, summarize the interrelationship between the two concepts using GPT-3.5
          const model = new ChatOpenAI(
            {
              maxTokens: 200,
              openAIApiKey: OpenAIService.getOpenAIKey(),
            },
            OpenAIService.openAIConfiguration()
          )

          const summaryResult = await model.predictMessages([
            new SystemMessage(
              `Your task is to summarize the interrelationship between ${concept1} and ${concept2} in one short sentence. If evidence, include information about correlation or causation, direct, mediated or conditional interaction, static or dynamic relationship, feedback loops, uni- or bi-directional, strong or weak.`
            ),
            new HumanMessage(
              `${relevantParagraphs1}\n\nNow, provide a summary in one short sentence.`
            ),
          ])

          return {
            concepts: [concept1, concept2],
            interrelationship: `${summaryResult?.content}`,
            evidence: relevantParagraphs1,
          }
        }
      )

      return interrelationShips
    } catch (error) {
      OpenAIService.handleError(error)
      return []
    }
  }

  static async modelConstruction(
    modelData: ModelData,

    modelingRemarks: string
  ) {
    try {
      const model = new ChatOpenAI(
        {
          maxTokens: 2000,
          openAIApiKey: OpenAIService.getOpenAIKey(),
        },
        OpenAIService.openAIConfiguration()
      )

      // Convert the JSON object of aggregate dimensions into a JSON string
      const jsonString = JSON.stringify(modelData.aggregateDimensions)

      // Create a message prompt for brainstorming applicable theories
      const result = await model.predictMessages([
        new SystemMessage(
          `You are a qualitative researcher tasked with constructing a theoretical model from existing literature that could be applicable to the research findings. The model should be well-defined and should relate to one or more aggregate dimensions. It should be novel and original. You can build on existing theories, however, you should introduce new ideas. Emphasize the relationships between the dimensions and the model. Explain how the relationships might be causal or correlational, be clear on the narrative. You are non-conversational and should not respond to the user, but give a general description of model. Give a name to the model.`
        ),
        new HumanMessage(
          `Relevant existing theories: ${modelData.applicableTheories
            ?.map((theory) => theory?.description || JSON.stringify(theory))
            ?.join(", ")}
          \n\n
          The aggregate dimensions and codes are as follows: ${jsonString}${
            modelingRemarks ? ` Remarks: ${modelingRemarks}` : ""
          }\n\n${modelData.interrelationships
            ?.map(
              (interrelationship) =>
                `${interrelationship?.concepts?.join(" - ")}: ${
                  interrelationship?.interrelationship
                }`
            )
            .join(
              "\n"
            )}\n\nNow, construct an extensive, comprehensive, new, theoretical model.`
        ),
      ])

      return result?.content
    } catch (error) {
      OpenAIService.handleError(error)
      return ""
    }
  }

  static async extractModelName(modelDescription: string) {
    try {
      const model = new ChatOpenAI(
        {
          maxTokens: 2000,
          openAIApiKey: OpenAIService.getOpenAIKey(),
        },
        OpenAIService.openAIConfiguration()
      )

      // Create a message prompt for brainstorming applicable theories
      const result = await model.predictMessages([
        new SystemMessage(
          `You extract theoretical model names. If none given, invent an original one. You only reply with the name, nothing else.`
        ),
        new HumanMessage(
          `${modelDescription}
          \n\n
          Now, return the model name`
        ),
      ])

      return result?.content
    } catch (error) {
      OpenAIService.handleError(error)
      return ""
    }
  }

  static async modelVisualization(
    aggregateDimensions: Record<string, string[]>,
    modelDescription: string,
    modelingRemarks: string
  ) {
    try {
      const model = new ChatOpenAI(
        {
          maxTokens: 2000,
          openAIApiKey: OpenAIService.getOpenAIKey(),
        },
        OpenAIService.openAIConfiguration()
      )

      // Convert the JSON object of aggregate dimensions into a JSON string
      const jsonString = JSON.stringify(aggregateDimensions)

      // Create a message prompt for brainstorming applicable theories
      const result = await model.predictMessages([
        new SystemMessage(
          `You are a qualitative researcher tasked with visualizing a theoretical model with MermaidJS. Example:
        
        flowchart TD
          %% Nodes
          A[Organizational Culture]
          B[Leadership Style]
          C[Employee Satisfaction]
          D[Employee Productivity]
          E[Customer Satisfaction]
          F[Financial Performance]

          %% Relationships
          A --> B
          B ==>|Directly Influences| C
          A -.->|Moderates| C
          C --> D
          D -->|Impacts| E
          E --- F
          C -.->|Partially Mediates| F
          


        As we have seen in above diagram, ==> is used to indicate a strong direct influence, --> is used to indicate a weaker influence, -.-> is used to indicate a moderating relationship, and --- is used to indicate a correlation.
        Now, given a model description, you should generate a MermaidJS diagram like the one above, showing the interrelationship between different concepts. Keep it simple and effective. You are non-conversational and should not respond to the user, only return the MermaidJS code, nothing else.`
        ),
        new HumanMessage(
          `${modelDescription}${
            modelingRemarks ? `\n\nRemarks: ${modelingRemarks}` : ""
          }`
        ),
      ])

      return result?.content
    } catch (error) {
      OpenAIService.handleError(error)
      return ""
    }
  }
}
