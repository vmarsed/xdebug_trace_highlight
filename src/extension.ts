import * as vscode from "vscode";
import * as fs from "fs";

export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "xtdisplay" is now active!');

    let disposable = vscode.commands.registerCommand("xtdisplay.tidyXdebugTraceFile", () => {
        // vscode.window.activeTextEditor.document

        vscode.window.showInformationMessage("Hello World from xtDisplay!");
    });
    context.subscriptions.push(disposable);

    // 定义跳转
    // let registerDefinitionProvider = vscode.languages.registerDefinitionProvider(
    // 	{ scheme: 'file', pattern: '**/*.{xt}' },
    // 	new xtDefinition()
    // );
    // context.subscriptions.push(registerDefinitionProvider);

    // 链接跳转

    let link = vscode.languages.registerDocumentLinkProvider({ scheme: "file", pattern: "**/*.xt" }, new LinkProvider());
    context.subscriptions.push(link);
}
export function deactivate() {}

class LinkProvider implements vscode.DocumentLinkProvider {
    public provideDocumentLinks(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.ProviderResult<vscode.DocumentLink[]> {
        let documentLinks = [];
        // let config = vscode.workspace.getConfiguration("xtDisplay");
        // console.log('---------------------------');
        // console.log(config);
        let reg = /(?:\/[a-zA-Z-_#!]+)+\.[a-zA-Z]+\:\d+/;
        // let reg = /(?:\/[a-zA-Z-_#!]+)+\.[a-zA-Z]+/;
        let lineCount = document.lineCount;
        for (let lineNum = 0; lineNum < lineCount; lineNum++) {
            // console.log(lineNum);
            // 读取一行内容
            let line = document.lineAt(lineNum);
            // 从内容里提取链接, 没找到时 match 返回 null , 找到时返回数组
            let links = line.text.match(reg);
            if (links === null) {
                continue;
            }

            for (let ln of links) {
                let lnSplit = ln.split(":");
                // 如果文件不存在, 就跳过
                if (!fs.existsSync(lnSplit[0])) {
                    continue;
                }
                
                // 创建 URI 对象 ， 如果用 lnk.toString() 可以看到 file:///home/xxx.php#L32 的链接 重新转为转化前链接的方法是 lnk.path 或 lnk.fsPath 还有其他属性 scheme query 等
                let lnk = vscode.Uri.file(lnSplit[0]); //正常
                const args = encodeURIComponent(JSON.stringify([ln]));
                lnk = vscode.Uri.parse(`command:workbench.action.quickOpen?${args}`);

                // 创建 vscode.DocumentLink 对象
                let posStart = new vscode.Position(line.lineNumber, line.text.indexOf(ln));
                let posEnd = posStart.translate(0, ln.length);
                let documentLink = new vscode.DocumentLink(new vscode.Range(posStart, posEnd), lnk); // 正常 , lnk 不能换loc 吼
                // 把对象加入数组
                documentLinks.push(documentLink);
            }
        }
        // 返回这个 vscode.DocumentLink 组成的数组
        return documentLinks;
    }
}
