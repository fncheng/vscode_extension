import * as vscode from 'vscode'
import { pxToVwRem, remToPx, vhToPx, vwToPx } from './tool'

const LANS: Array<string> = [
  'html',
  'css',
  'less',
  'scss',
  'sass',
  'stylus',
  'vue',
  'typescriptreact'
]

export function activate(context: vscode.ExtensionContext) {
  // const outputChannel = vscode.window.createOutputChannel('px2remvw3')

  // outputChannel.appendLine('插件已激活')
  // vscode.window.showInformationMessage('插件启动成功！')

  const VW_REGEX = /(\d+)?(0)?(.)?\d+vw/
  const VH_REGEX = /(\d+)?(0)?(.)?\d+vh/
  const REM_REGEX = /(\d+)?(0)?(.)?\d+rem/

  const hoverProvider = vscode.languages.registerHoverProvider(LANS, {
    provideHover(document, position, token) {
      let match
      // 获取光标附件的单词
      const range = document.getWordRangeAtPosition(position, /\d+(\.\d+)?(rem|vw|vh|px)/)
      // outputChannel.appendLine('range: ' + range)
      if (range) {
        const word = document.getText(range)
        // outputChannel.appendLine('word: ' + word)
        if (VW_REGEX.test(word)) {
          match = VW_REGEX.exec(word)
          return new vscode.Hover(vwToPx(match![0]))
        }
        if (VH_REGEX.test(word)) {
          match = VH_REGEX.exec(word)
          return new vscode.Hover(vhToPx(match![0]))
        }
        if (REM_REGEX.test(word)) {
          match = REM_REGEX.exec(word)
          return new vscode.Hover(remToPx(match![0]))
        }
      }
    }
  })
  context.subscriptions.push(hoverProvider)

  const completeProvider = vscode.languages.registerCompletionItemProvider(LANS, {
    provideCompletionItems(document, position, token, context) {
      const lineText = document.getText(new vscode.Range(position.with(undefined, 0), position))

      const res = pxToVwRem(lineText, vscode)

      if (!res) return

      const item = new vscode.CompletionItem(
        `${res.pxValue}px => ${res.rem}`,
        vscode.CompletionItemKind.Snippet
      )
      const item2 = new vscode.CompletionItem(
        `${res.pxValue}px => ${res.vw}`,
        vscode.CompletionItemKind.Snippet
      )

      item.insertText = res.rem
      item2.insertText = res.vw

      return [item, item2]
    }
  })

  context.subscriptions.push(completeProvider)

  outputChannel.show(true)
}

export function deactivate() {}
