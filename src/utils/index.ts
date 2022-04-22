const HTML_ESCAPE_TEST_RE = /[&<>"]/
const HTML_REPLACEMENTS = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;'
}

function replaceUnsafeChar(ch: string) {
    return HTML_REPLACEMENTS[ch];
}

export function escapeHTML(str: string) {
    if (HTML_ESCAPE_TEST_RE.test(str)) {
        return str.replace(HTML_ESCAPE_TEST_RE, replaceUnsafeChar)
    }

    return str
}
