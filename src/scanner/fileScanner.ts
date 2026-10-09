import * as fs from 'fs';
import * as path from 'path';
import { FileNode } from '../types';

const IGNORED_DIRS = new Set([
  'node_modules',
  '.git',
  'dist',
  'build',
  'coverage',
  '.next',
  '.nuxt',
  '.cache',
  '__pycache__',
  '.turbo',
  '.vercel',
  'out',
]);

const CODE_EXTENSIONS = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs',
  '.json', '.css', '.scss', '.html', '.vue', '.svelte',
  '.md', '.yaml', '.yml', '.env',
]);

export interface ScanResult {
  fileTree: FileNode[];
  totalFiles: number;
  totalFolders: number;
}

export class FileScanner {
  constructor(private rootPath: string) {}

  async scan(): Promise<ScanResult> {
    let totalFiles = 0;
    let totalFolders = 0;

    const scanDir = (dirPath: string, depth = 0): FileNode[] => {
      if (depth > 10) return []; // safety limit

      let entries: fs.Dirent[];
      try {
        entries = fs.readdirSync(dirPath, { withFileTypes: true });
      } catch {
        return [];
      }

      const nodes: FileNode[] = [];

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        const relativePath = path.relative(this.rootPath, fullPath).replace(/\\/g, '/');

        if (entry.isDirectory()) {
          if (IGNORED_DIRS.has(entry.name) || entry.name.startsWith('.')) {
            // Allow .vscode but skip most hidden dirs
            if (entry.name !== '.vscode') continue;
          }

          totalFolders++;
          const children = scanDir(fullPath, depth + 1);

          nodes.push({
            name: entry.name,
            path: fullPath,
            relativePath,
            type: 'directory',
            children,
          });
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name).toLowerCase();

          // Skip binary and irrelevant files
          if (!CODE_EXTENSIONS.has(ext) && ext !== '') continue;

          totalFiles++;
          let size = 0;
          let lines = 0;

          try {
            const stat = fs.statSync(fullPath);
            size = stat.size;
            // Count lines for text files
            if (stat.size < 500_000) {
              const content = fs.readFileSync(fullPath, 'utf-8');
              lines = content.split('\n').length;
            }
          } catch {
            // ignore read errors
          }

          nodes.push({
            name: entry.name,
            path: fullPath,
            relativePath,
            type: 'file',
            size,
            lines,
            extension: ext,
          });
        }
      }

      // Sort: directories first, then files
      return nodes.sort((a, b) => {
        if (a.type === b.type) return a.name.localeCompare(b.name);
        return a.type === 'directory' ? -1 : 1;
      });
    };

    const fileTree = scanDir(this.rootPath);
    return { fileTree, totalFiles, totalFolders };
  }

  /**
   * Flatten the file tree into a list of all file nodes (non-directories)
   */
  static flattenFiles(tree: FileNode[]): FileNode[] {
    const files: FileNode[] = [];
    const walk = (nodes: FileNode[]) => {
      for (const node of nodes) {
        if (node.type === 'file') {
          files.push(node);
        } else if (node.children) {
          walk(node.children);
        }
      }
    };
    walk(tree);
    return files;
  }
}
