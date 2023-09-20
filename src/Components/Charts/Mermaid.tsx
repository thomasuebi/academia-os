import React, { useEffect } from "react"
import mermaid from "mermaid"
import { theme } from "antd"

const Mermaid = (props: { chart: any }) => {
  const { useToken } = theme
  const { token } = useToken()
  mermaid.initialize({
    startOnLoad: true,
    theme: "dark",
    securityLevel: "loose",

    fontFamily: "Fira Code",
  })

  useEffect(() => {
    mermaid.contentLoaded()
  }, [props?.chart])

  return (
    <div key={props?.chart} className='mermaid'>
      {props?.chart}
    </div>
  )
}

export default Mermaid
