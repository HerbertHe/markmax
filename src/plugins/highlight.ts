import hljs from "highlight.js"
import javascript from "highlight.js/lib/languages/javascript"
// import "highlight.js/styles/github.css"
hljs.registerLanguage("javascript", javascript)

// TODO 转化为插件体系
export const HighlightPlugin = (content: string) => {
    const code = hljs.highlightAuto(content).value
    return code
}
