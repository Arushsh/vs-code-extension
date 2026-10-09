import * as fs from 'fs';
import * as path from 'path';
import { FileNode, FileRelationship, ImportEntry } from '../types';
import { FileScanner } from '../scanner/fileScanner';

const IMPORT_REGEX =
  /(?:import\s+(?:[\w\s{},*]+\s+from\s+)?|require\s*\()\s*['"]([^'"]+)['"]/g;

const PARSEABLE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs']);

export class ImportAnalyzer {
  constructor(private rootPath: string) {}

  async analyze(
    fileTree: FileNode[]
  ): Promise<Record<string, FileRelationship>> {
    const allFiles = FileScanner.flattenFiles(fileTree);
    const relationships: Record<string, FileRelationship> = {};

    // Initialize all files
    for (const file of allFiles) {
      relationships[file.relativePath] = {
        path: file.path,
        name: file.name,
        relativePath: file.relativePath,
        size: file.size ?? 0,
        lines: file.lines ?? 0,
        imports: [],
        importedBy: [],
      };
    }

    // Parse imports from JS/TS files
    for (const file of allFiles) {
      const ext = file.extension ?? '';
      if (!PARSEABLE_EXTENSIONS.has(ext)) continue;

      let content: string;
      try {
        const stat = fs.statSync(file.path);
        if (stat.size > 500_000) continue; // skip very large files
        content = fs.readFileSync(file.path, 'utf-8');
      } catch {
        continue;
      }

      const imports: ImportEntry[] = [];
      let match: RegExpExecArray | null;
      IMPORT_REGEX.lastIndex = 0;

      while ((match = IMPORT_REGEX.exec(content)) !== null) {
        const source = match[1];
        const isLocal = source.startsWith('.') || source.startsWith('/');

        const entry: ImportEntry = {
          source,
          isLocal,
        };

        if (isLocal) {
          const resolved = this.resolveImport(file.path, source);
          if (resolved) {
            entry.resolvedPath = path.relative(this.rootPath, resolved).replace(/\\/g, '/');

            // Update importedBy for the resolved file
            if (relationships[entry.resolvedPath]) {
              const importerPath = file.relativePath;
              if (!relationships[entry.resolvedPath].importedBy.includes(importerPath)) {
                relationships[entry.resolvedPath].importedBy.push(importerPath);
              }
            }
          }
        }

        // Avoid duplicates
        const isDuplicate = imports.some((i) => i.source === source);
        if (!isDuplicate) {
          imports.push(entry);
        }
      }

      if (relationships[file.relativePath]) {
        relationships[file.relativePath].imports = imports;
      }
    }

    return relationships;
  }

  private resolveImport(fromFile: string, importPath: string): string | null {
    const fromDir = path.dirname(fromFile);
    const base = path.resolve(fromDir, importPath);

    // Try exact path first
    if (fs.existsSync(base) && fs.statSync(base).isFile()) return base;

    // Try with extensions
    const extensions = ['.ts', '.tsx', '.js', '.jsx', '.mjs'];
    for (const ext of extensions) {
      const withExt = base + ext;
      if (fs.existsSync(withExt)) return withExt;
    }

    // Try as directory index
    for (const ext of extensions) {
      const indexFile = path.join(base, `index${ext}`);
      if (fs.existsSync(indexFile)) return indexFile;
    }

    return null;
  }
}
