// Shared TypeScript types used by both extension host and webview

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

export interface FolderInfo {
  path: string;
  name: string;
  fileCount: number;
  purpose: string;
  keyFiles: string[];
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

export interface ImportEntry {
  source: string;
  isLocal: boolean;
  resolvedPath?: string;
}

export interface ProjectData {
  projectInfo: ProjectInfo;
  fileTree: FileNode[];
  relationships: Map<string, FileRelationship> | Record<string, FileRelationship>;
  readmeContent?: string;
}

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

export interface ProgressMessage extends ExtensionMessage {
  type: 'progress';
  payload: {
    message: string;
    percent: number;
  };
}

export interface ErrorMessage extends ExtensionMessage {
  type: 'error';
  payload: {
    message: string;
  };
}

export interface ProjectDataMessage extends ExtensionMessage {
  type: 'projectData';
  payload: {
    projectInfo: ProjectInfo;
    fileTree: FileNode[];
    relationships: Record<string, FileRelationship>;
  };
}

export interface ReadmeGeneratedMessage extends ExtensionMessage {
  type: 'readmeGenerated';
  payload: {
    content: string;
  };
}
