import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { FileScanner } from './scanner/fileScanner';
import { ProjectDetector } from './detector/projectDetector';
import { ImportAnalyzer } from './analyzer/importAnalyzer';
import { ReadmeGenerator } from './generator/readmeGenerator';
import {
  ProjectDataMessage,
  ReadmeGeneratedMessage,
  ExtensionMessage,
} from './types';

let panel: vscode.WebviewPanel | undefined;

export function activate(context: vscode.ExtensionContext) {
  console.log('CodeAtlas is now active!');

  const analyzeCommand = vscode.commands.registerCommand(
    'codeAtlas.analyze',
    async () => {
      const workspaceFolders = vscode.workspace.workspaceFolders;
      if (!workspaceFolders || workspaceFolders.length === 0) {
        vscode.window.showErrorMessage(
          'CodeAtlas: Please open a project folder first.'
        );
        return;
      }

      const rootPath = workspaceFolders[0].uri.fsPath;

      // Create or reveal the webview panel
      if (panel) {
        panel.reveal(vscode.ViewColumn.One);
      } else {
        panel = vscode.window.createWebviewPanel(
          'codeAtlasDashboard',
          'CodeAtlas — Project Dashboard',
          vscode.ViewColumn.One,
          {
            enableScripts: true,
            localResourceRoots: [
              vscode.Uri.joinPath(context.extensionUri, 'webview-ui', 'dist'),
            ],
            retainContextWhenHidden: true,
          }
        );

        panel.onDidDispose(() => {
          panel = undefined;
        });

        // Handle messages from webview
        panel.webview.onDidReceiveMessage(
          async (message: ExtensionMessage) => {
            if (!panel) return;

            if (message.type === 'ready' || message.type === 'analyze') {
              await runAnalysis(rootPath);
            }

            if (message.type === 'generateReadme') {
              try {
                const generator = new ReadmeGenerator();
                const { projectInfo, fileTree, relationships } =
                  message.payload as Parameters<typeof generator.generate>[0];
                const readmeContent = generator.generate({
                  projectInfo,
                  fileTree,
                  relationships,
                });
                const msg: ReadmeGeneratedMessage = {
                  type: 'readmeGenerated',
                  payload: { content: readmeContent },
                };
                panel.webview.postMessage(msg);
              } catch (err) {
                panel.webview.postMessage({
                  type: 'error',
                  payload: { message: String(err) },
                });
              }
            }

            if (message.type === 'saveReadme') {
              const content = (message.payload as { content: string }).content;
              const readmePath = path.join(rootPath, 'README.md');
              fs.writeFileSync(readmePath, content, 'utf-8');
              vscode.window.showInformationMessage(
                'CodeAtlas: README.md saved to project root!'
              );
              panel.webview.postMessage({ type: 'savedReadme' });
            }
          },
          undefined,
          context.subscriptions
        );
      }

      // Set the webview HTML
      panel.webview.html = getWebviewContent(
        panel.webview,
        context.extensionUri
      );

      // Trigger analysis
      await runAnalysis(rootPath);
    }
  );

  context.subscriptions.push(analyzeCommand);
}

async function runAnalysis(rootPath: string) {
  if (!panel) return;
  try {
    sendProgress(panel, 'Scanning project files…', 10);

    const scanner = new FileScanner(rootPath);
    const { fileTree, totalFiles, totalFolders } = await scanner.scan();

    sendProgress(panel, 'Detecting project type…', 40);

    const detector = new ProjectDetector(rootPath);
    const projectInfo = await detector.detect(totalFiles, totalFolders);

    sendProgress(panel, 'Analyzing file relationships…', 70);

    const analyzer = new ImportAnalyzer(rootPath);
    const relationships = await analyzer.analyze(fileTree);

    sendProgress(panel, 'Rendering dashboard…', 95);

    const msg: ProjectDataMessage = {
      type: 'projectData',
      payload: {
        projectInfo,
        fileTree,
        relationships,
      },
    };
    panel.webview.postMessage(msg);
  } catch (err) {
    panel.webview.postMessage({
      type: 'error',
      payload: { message: String(err) },
    });
    vscode.window.showErrorMessage(`CodeAtlas Error: ${String(err)}`);
  }
}

function sendProgress(
  p: vscode.WebviewPanel,
  message: string,
  percent: number
) {
  p.webview.postMessage({ type: 'progress', payload: { message, percent } });
}

function getWebviewContent(
  webview: vscode.Webview,
  extensionUri: vscode.Uri
): string {
  const distUri = vscode.Uri.joinPath(extensionUri, 'webview-ui', 'dist');

  // Read the built index.html and patch asset URIs
  const indexPath = path.join(distUri.fsPath, 'index.html');

  if (!fs.existsSync(indexPath)) {
    return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>CodeAtlas</title>
<style>body{background:#0F172A;color:#F8FAFC;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;flex-direction:column;gap:16px;}
h2{color:#3B82F6;font-size:24px;} p{color:#94A3B8;}</style>
</head>
<body>
<h2>⚙️ CodeAtlas</h2>
<p>Webview not built yet. Run: <code>npm run build:webview</code></p>
</body></html>`;
  }

  let html = fs.readFileSync(indexPath, 'utf-8');

  const nonce = getNonce();
  const cspSource = webview.cspSource;

  // Convert relative assets (./assets/... or /assets/...) to webview URIs
  html = html.replace(
    /(src|href)="(\.\/|\/)?(assets\/[^"]+)"/g,
    (_match: string, attr: string, _prefix: string, assetPath: string) => {
      const assetUri = webview.asWebviewUri(
        vscode.Uri.joinPath(distUri, assetPath)
      );
      return `${attr}="${assetUri}"`;
    }
  );

  // Inject CSP meta tag allowing webview source, fonts, and inline styles
  html = html.replace(
    '<head>',
    `<head>
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${cspSource} 'unsafe-inline' https://fonts.googleapis.com https://api.fontshare.com; script-src 'nonce-${nonce}' ${cspSource}; font-src ${cspSource} https://fonts.gstatic.com https://api.fontshare.com; connect-src 'none';">
    <meta name="color-scheme" content="dark">`
  );

  // Add nonce to script tags
  html = html.replace(/<script /g, `<script nonce="${nonce}" `);

  return html;
}

function getNonce(): string {
  let text = '';
  const possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

export function deactivate() {}
