# Plugins

MarkMax has its specific plugin design, but tries to support markdown-it plugins **(Experimental)**.

## Supported markdown-it plugins

MarkMax supports markdown-it plugins by the wrapper for them. But we maybe can't support the 100% of them, due to some reasons for MarkMax plugin design.

Here are all reserved keys for the rules as followed:

| Keys        |
| ----------- |
| code_inline |
| code_block  |
| fence       |
| image       |
| hardbreak   |
| softbreak   |
| text        |
| html_block  |
| html_inline |

> If you wanna use the plugin which needs to change the rules of the reserved keys, it would not work.

### Tested Plugins

- [markdown-it-emoji](https://github.com/markdown-it/markdown-it-emoji)
- [markdown-it-sub](https://github.com/markdown-it/markdown-it-sub)
- [markdown-it-sup](https://github.com/markdown-it/markdown-it-sup)
- [markdown-it-ins](https://github.com/markdown-it/markdown-it-ins)
- [markdown-it-mark](https://github.com/markdown-it/markdown-it-mark)
- [markdown-it-deflist](https://github.com/markdown-it/markdown-it-deflist)
- [markdown-it-abbr](https://github.com/markdown-it/markdown-it-abbr)

> TODO

## MarkMax Plugin

> Under designing
