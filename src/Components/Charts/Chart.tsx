import React, { useEffect } from "react"
import {
  DataSet,
  Network,
  Node,
  Edge,
} from "vis-network/standalone/esm/vis-network"

// D2 https://play.d2lang.com/?script=jJA9TsNAEEZ7n2JkanKAiApIEUSX9KvJ-sMeZM9as2NLuT1aiOz8NNTvvdHu90SH6RTZ0SYTZIpJFdHJEw0sSiuqln23ZGWJqsopCvcB6rDRJCPTyzPVxw4Dcr05_GLarfg_xSr34AaWOxlDg7mI62s29edC6R0z-jQOUK-35QvOormKMksM0JZbFHZ_4a1w2i38pp16UbZz-E6TKc4P7YXTxx-_aY2_PJwAC6LNlN0e86LQK2C0vyjXFxyxC6KaZi6D39dHxI5YG9ovynX9EwAA__8%3D&sketch=0&theme=4&layout=dagre&
// # Subcategories connect to main categories
// direction: right

// social_enterprises <- "Themes".Social Enterprises
// social_enterprises <- "Themes".Sociterprises
// leadership_dev <- categories."Leadership Development": contains
// civic_engagement <- categories."Civic Engagement": contains
// culinary_journey <- categories."Culinary Journey": contains
// craft_beer_industry <- categories."Craft Beer Industry": contains
// tech_innovation <- categories."Tech and Innovation": contains

// MermaidjS
// graph LR
//     subgraph categories
//         Leadership_Development["Leadership Development"]
//         Civic_Engagement["Civic Engagement"]
//         Culinary_Journey["Culinary Journey"]
//         Craft_Beer_Industry["Craft Beer Industry"]
//         Tech_and_Innovation["Tech and Innovation"]
//     end
//     subgraph Themes
//         Social_Enterprises[Social Enterprises]
//         Sociterprises
//     end

//     Social_Enterprises -->|contains| Themes.Social_Enterprises
//     Sociterprises -->|contains| Themes.Sociterprises
//     Leadership_Development -->|contains| Leadership_Development
//     Civic_Engagement -->|contains| Civic_Engagement
//     Culinary_Journey -->|contains| Culinary_Journey
//     Craft_Beer_Industry -->|contains| Craft_Beer_Industry
//     Tech_and_Innovation -->|contains| Tech_and_Innovation

const HierarchicalFlowchart = (props: {
  data: { [key: string]: string[] }
}) => {
  useEffect(() => {
    const nodes = new DataSet<Node>([])
    const edges = new DataSet<Edge>([])

    let id = 1

    Object.keys(props.data).forEach((key, index) => {
      nodes.add({
        id,
        label: key,
        shape: "box",
        fixed: { x: true },
        x: index * 200,
      })
      const parentId = id
      id += 1

      props.data[key].forEach((child) => {
        nodes.add({ id, label: child, shape: "box" })
        edges.add({ to: parentId, from: id, arrows: "to" })
        id += 1
      })
    })

    const container = document.getElementById("network")
    const networkData = {
      nodes,
      edges,
    }

    const options = {
      layout: {
        hierarchical: {
          direction: "LR",
          sortMethod: "directed",
          levelSeparation: 500,
          nodeSpacing: 50,
        },
      },
      nodes: {
        shape: "box",
        font: {
          size: 18,
        },
      },
      edges: {
        smooth: {
          type: "cubicBezier",
          forceDirection: "horizontal",
          roundness: 0.5,
        },
        arrows: {
          to: {
            enabled: true,
            scaleFactor: 0.5,
            type: "arrow",
          },
        },
      },
    }

    if (container) {
      new Network(container, networkData, options as any)
    }
  }, [props.data])

  return <div id='network' style={{ height: "500px", width: "100%" }} />
}

export default HierarchicalFlowchart
