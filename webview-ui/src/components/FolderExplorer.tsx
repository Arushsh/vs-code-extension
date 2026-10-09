import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileNode } from '../types';
import {
  Folder, FolderOpen, FileCode, FileText,
  ChevronRight, ChevronDown, File,
} from 'lucide-react';

interface FolderExplorerProps {
  fileTree: FileNode[];
}

const FOLDER_PURPOSES: Record<string, string> = {
  src: 'Source code',
  components: 'Reusable UI components',
  pages: 'Page-level components / routes',
  hooks: 'Custom React hooks',
  utils: 'Utility functions',
  lib: 'Library / shared utilities',
  services: 'API services & business logic',
  store: 'State management (Redux / Zustand)',
  context: 'React context providers',
  api: 'API routes / handlers',
  types: 'TypeScript type definitions',
  styles: 'Global / shared styles',
  assets: 'Static assets (images, fonts)',
  public: 'Public static files',
  tests: 'Test files',
  __tests__: 'Jest test files',
  config: 'Configuration files',
  scripts: 'Build / utility scripts',
  docs: 'Documentation',
  middleware: 'Middleware functions',
  models: 'Data models / schemas',
  controllers: 'Route controllers',
  routes: 'Route definitions',
  helpers: 'Helper functions',
  constants: 'Constants / enums',
  layouts: 'Layout components',
  app: 'Next.js App Router',
};

function getFilePurpose(name: string): string {
  return FOLDER_PURPOSES[name.toLowerCase()] ?? 'Project files';
}

const EXT_COLORS: Record<string, string> = {
  '.tsx': 'text-blue-400',
  '.ts': 'text-blue-300',
  '.jsx': 'text-yellow-400',
  '.js': 'text-yellow-300',
  '.css': 'text-pink-400',
  '.scss': 'text-pink-400',
  '.json': 'text-orange-300',
  '.md': 'text-gray-400',
  '.html': 'text-orange-400',
  '.svg': 'text-green-300',
  '.env': 'text-red-400',
  '.yml': 'text-cyan-400',
  '.yaml': 'text-cyan-400',
};

function getFileIcon(node: FileNode) {
  if (node.type === 'directory') return null;
  const ext = node.extension ?? '';
  const color = EXT_COLORS[ext] ?? 'text-text-muted';
  if (['.tsx', '.jsx'].includes(ext)) return <FileCode size={14} className={color} />;
  if (['.ts', '.js', '.mjs'].includes(ext)) return <FileCode size={14} className={color} />;
  if (['.md'].includes(ext)) return <FileText size={14} className={color} />;
  return <File size={14} className={color} />;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

interface TreeNodeProps {
  node: FileNode;
  depth: number;
}

function TreeNode({ node, depth }: TreeNodeProps) {
  const [expanded, setExpanded] = useState(depth < 2);
  const [selected, setSelected] = useState(false);

  const isDir = node.type === 'directory';
  const childCount = node.children?.length ?? 0;
  const fileCount = node.children?.filter((c) => c.type === 'file').length ?? 0;

  return (
    <div>
      {/* Node row */}
      <div
        className={`flex items-center gap-1.5 py-1 px-2 rounded-input cursor-pointer group transition-colors duration-150 ${
          selected
            ? 'bg-bg-selected/30 border border-primary/30'
            : 'hover:bg-bg-hover/50'
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => {
          if (isDir) setExpanded((e) => !e);
          setSelected((s) => !s);
        }}
      >
        {/* Expand arrow for directories */}
        {isDir ? (
          <span className="text-text-muted flex-shrink-0 w-4">
            {childCount > 0 ? (
              expanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />
            ) : (
              <span className="w-4" />
            )}
          </span>
        ) : (
          <span className="w-4 flex-shrink-0" />
        )}

        {/* Icon */}
        <span className="flex-shrink-0">
          {isDir
            ? expanded
              ? <FolderOpen size={15} className="text-warning" />
              : <Folder size={15} className="text-warning" />
            : getFileIcon(node)}
        </span>

        {/* Name */}
        <span
          className={`text-small font-mono truncate flex-1 ${
            isDir ? 'text-text-secondary font-medium' : 'text-text-muted'
          }`}
        >
          {node.name}
          {isDir && <span className="text-text-disabled ml-1 text-caption">/ </span>}
        </span>

        {/* Meta */}
        <div className="flex items-center gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          {isDir && (
            <span className="text-caption text-text-disabled">{fileCount} files</span>
          )}
          {!isDir && node.lines !== undefined && (
            <span className="text-caption text-text-disabled">{node.lines} lines</span>
          )}
          {!isDir && node.size !== undefined && (
            <span className="text-caption text-text-disabled">{formatBytes(node.size)}</span>
          )}
        </div>
      </div>

      {/* Folder detail popout */}
      {isDir && selected && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          style={{ paddingLeft: `${depth * 16 + 24}px` }}
          className="mb-1"
        >
          <div className="bg-bg-secondary border border-border-default rounded-card px-3 py-2.5 my-1 mx-2">
            <p className="text-text-muted text-caption mb-1">📁 {getFilePurpose(node.name)}</p>
            <div className="flex gap-4 text-caption">
              <span className="text-primary">{childCount} items</span>
              <span className="text-success">{fileCount} files</span>
              <span className="text-warning">{childCount - fileCount} folders</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Children */}
      <AnimatePresence>
        {isDir && expanded && childCount > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
          >
            {node.children!.map((child) => (
              <TreeNode key={child.relativePath} node={child} depth={depth + 1} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FolderExplorer({ fileTree }: FolderExplorerProps) {
  const [search, setSearch] = useState('');

  const filteredTree = search
    ? filterTree(fileTree, search.toLowerCase())
    : fileTree;

  return (
    <div className="flex h-full">
      {/* Left: Tree panel */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-border-default">
        {/* Toolbar */}
        <div className="flex-shrink-0 px-4 py-3 border-b border-border-default">
          <input
            type="text"
            placeholder="Filter files and folders…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-bg-secondary border border-border-default rounded-input px-3 py-2 text-small text-text-primary placeholder-text-disabled outline-none focus:border-border-active transition-colors duration-150"
          />
        </div>

        {/* Tree */}
        <div className="flex-1 overflow-y-auto p-3 animate-fade-in">
          {filteredTree.length > 0 ? (
            filteredTree.map((node) => (
              <TreeNode key={node.relativePath} node={node} depth={0} />
            ))
          ) : (
            <p className="text-text-disabled text-small p-4">No matching files found.</p>
          )}
        </div>
      </div>

      {/* Right: Legend */}
      <div className="w-56 flex-shrink-0 p-4 space-y-4">
        <h3 className="text-sidebar-heading text-text-primary">Legend</h3>
        <div className="space-y-2">
          {Object.entries(EXT_COLORS).map(([ext, color]) => (
            <div key={ext} className="flex items-center gap-2">
              <FileCode size={13} className={color} />
              <span className="text-caption font-mono text-text-muted">{ext}</span>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <Folder size={13} className="text-warning" />
            <span className="text-caption font-mono text-text-muted">directory</span>
          </div>
        </div>

        <div className="pt-3 border-t border-border-default">
          <p className="text-caption text-text-disabled">
            Click a folder to see its purpose and stats. Click again to collapse.
          </p>
        </div>
      </div>
    </div>
  );
}

function filterTree(nodes: FileNode[], query: string): FileNode[] {
  const result: FileNode[] = [];
  for (const node of nodes) {
    if (node.name.toLowerCase().includes(query)) {
      result.push(node);
    } else if (node.type === 'directory' && node.children) {
      const filteredChildren = filterTree(node.children, query);
      if (filteredChildren.length > 0) {
        result.push({ ...node, children: filteredChildren });
      }
    }
  }
  return result;
}
