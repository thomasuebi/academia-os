import React, { useEffect } from "react"
import mermaid from "mermaid"
import { theme } from "antd"

const Mermaid = (props: { chart: any }) => {
  const { useToken } = theme
  const { token } = useToken()
  mermaid.initialize({
    startOnLoad: true,
    theme: "default",
    securityLevel: "loose",

    themeCSS: `
  g.classGroup rect {
    fill: ${token.colorBgLayout};
    stroke: ${token.colorBorder};
  } 
  g.classGroup text {
    fill: ${token.colorText};
  }
  g.classGroup line {
    stroke: ${token.colorBorderSecondary};
    stroke-width: 0.5;
  }
  .classLabel .box {
    stroke: ${token.colorBgMask};
    stroke-width: 3;
    fill: ${token.colorBgMask};
    opacity: 1;
  }
  .classLabel .label {
    fill: ${token.colorPrimaryText};
  }
  .relation {
    stroke: ${token.colorFill};
    stroke-width: 1;
  }
  #compositionStart, #compositionEnd {
    fill: ${token.colorFillSecondary};
    stroke: ${token.colorFillSecondary};
    stroke-width: 1;
  }
  #aggregationEnd, #aggregationStart {
    fill: ${token.colorBgMask};
    stroke: ${token.colorPrimaryBg};
    stroke-width: 1;
  }
  #dependencyStart, #dependencyEnd {
    fill: ${token.colorBgSpotlight};
    stroke: ${token.colorBgSpotlight};
    stroke-width: 1;
  } 
  #extensionStart, #extensionEnd {
    fill: ${token.colorPrimaryText};
    stroke: ${token.colorPrimaryText};
    stroke-width: 1;
  }
`,
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
