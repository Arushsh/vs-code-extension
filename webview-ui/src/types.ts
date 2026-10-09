// Shared types mirrored from extension src/types.ts
// These must stay in sync with the extension host types

export interface ProjectInfo {
  name: string;
  version: string;
  description: string;
  framework: string;
  language: string;
  packageManager: string;
  buildTool: string;
  entryPoint: string;
  totalFiles: number;
  totalFolders: number;
  totalDependencies: number;
  devDependencies: number;
  scripts: Record<string, string>;
  dependencies: Record<string, string>;
  rootPath: string;
}

export interface FileNode {
  name: string;
  path: string;
  relativePath: string;
  type: 'file' | 'directory';
  size?: number;
  lines?: number;
  extension?: string;
  children?: FileNode[];
  imports?: string[];
  importedBy?: string[];
}

export interface ImportEntry {
  source: string;
  isLocal: boolean;
  resolvedPath?: string;
}

export interface FileRelationship {
  path: string;
  name: string;
  relativePath: string;
  size: number;
  lines: number;
  imports: ImportEntry[];
  importedBy: string[];
}

export type AppTab = 'dashboard' | 'explorer' | 'relationships' | 'readme';

export type MessageType =
  | 'ready'
  | 'analyze'
  | 'projectData'
  | 'generateReadme'
  | 'readmeGenerated'
  | 'saveReadme'
  | 'savedReadme'
  | 'error'
  | 'progress';

export interface ExtensionMessage {
  type: MessageType;
  payload?: unknown;
}
