import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileRelationship } from '../types';
import {
  Search, FileCode, ArrowUpRight, ArrowDownLeft,
  Package, File, Info,
} from 'lucide-react';

interface FileRelationshipsProps {
  relationships: Record<string, FileRelationship>;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

export default function FileRelationships({ relationships }: FileRelationshipsProps) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string | null>(null);

  const allFiles = useMemo(
    () =>
      Object.entries(relationships)
        .filter(([, r]) => r.imports.length > 0 || r.importedBy.length > 0)
        .sort(([, a], [, b]) => {
          const sA = a.imports.length + a.importedBy.length;
          const sB = b.imports.length + b.importedBy.length;
          return sB - sA;
        }),
    [relationships]
  );

  const filtered = useMemo(
    () =>
      allFiles.filter(([path]) =>
        path.toLowerCase().includes(search.toLowerCase())
      ),
    [allFiles, search]
  );

  const selectedRel = selected ? relationships[selected] : null;

  const localImports = selectedRel?.imports.filter((i) => i.isLocal) ?? [];
  const npmImports = selectedRel?.imports.filter((i) => !i.isLocal) ?? [];

  return (
    <div className="flex h-full">
      {/* Left panel: file list */}
      <div className="w-72 flex-shrink-0 flex flex-col border-r border-border-default bg-bg-sidebar">
        {/* Search */}
        <div className="p-3 border-b border-border-default">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-disabled" />
            <input
              type="text"
              placeholder="Search files…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-bg-secondary border border-border-default rounded-input py-2 pl-8 pr-3 text-small text-text-primary placeholder-text-disabled outline-none focus:border-border-active transition-colors duration-150"
            />
          </div>
        </div>

        {/* File list */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="text-text-disabled text-small p-4">No files with imports found.</p>
          ) : (
            filtered.map(([path, rel]) => {
              const localCount = rel.imports.filter((i) => i.isLocal).length;
              const npmCount = rel.imports.filter((i) => !i.isLocal).length;
              return (
                <button
                  key={path}
                  onClick={() => setSelected(path === selected ? null : path)}
                  className={`w-full text-left px-3 py-2.5 border-b border-border-default/50 transition-colors duration-150 ${
                    selected === path
                      ? 'bg-bg-selected/20 border-l-2 border-l-primary'
                      : 'hover:bg-bg-hover/40'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <FileCode size={14} className="text-accent-cyan flex-shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <p className="text-small font-mono text-text-secondary truncate">
                        {rel.name}
                      </p>
                      <p className="text-caption text-text-disabled truncate">{path}</p>
                      <div className="flex gap-2 mt-1">
                        {localCount > 0 && (
                          <span className="text-caption bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                            {localCount} local
                          </span>
                        )}
                        {npmCount > 0 && (
                          <span className="text-caption bg-warning/10 text-warning px-1.5 py-0.5 rounded-full">
                            {npmCount} npm
                          </span>
                        )}
                        {rel.importedBy.length > 0 && (
                          <span className="text-caption bg-success/10 text-success px-1.5 py-0.5 rounded-full">
                            ↑{rel.importedBy.length}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Right panel: detail */}
      <div className="flex-1 overflow-y-auto p-6">
        <AnimatePresence mode="wait">
          {selectedRel ? (
            <motion.div
              key={selected}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
              className="space-y-6 animate-fade-in"
            >
              {/* File header */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-card bg-bg-secondary border border-border-default flex items-center justify-center flex-shrink-0">
                  <FileCode size={18} className="text-accent-cyan" />
                </div>
                <div>
                  <h2 className="text-card-title text-text-primary font-mono">{selectedRel.name}</h2>
                  <p className="text-text-muted text-small">{selectedRel.relativePath}</p>
                  <div className="flex gap-4 mt-2">
                    <span className="text-caption text-text-disabled">
                      {selectedRel.lines.toLocaleString()} lines
                    </span>
                    <span className="text-caption text-text-disabled">
                      {formatBytes(selectedRel.size)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Local imports */}
                <div className="bg-bg-card border border-border-default rounded-card p-4 shadow-card">
                  <div className="flex items-center gap-2 mb-3">
                    <ArrowUpRight size={14} className="text-primary" />
                    <h3 className="text-small font-semibold text-text-primary">
                      Local Imports
                    </h3>
                    <span className="ml-auto text-caption bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      {localImports.length}
                    </span>
                  </div>
                  {localImports.length > 0 ? (
                    <div className="space-y-1.5">
                      {localImports.map((imp, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 py-1.5 px-2 rounded-input bg-bg-secondary hover:bg-bg-hover transition-colors duration-100"
                        >
                          <File size={12} className="text-primary flex-shrink-0" />
                          <span className="text-caption font-mono text-text-secondary truncate" title={imp.source}>
                            {imp.resolvedPath
                              ? imp.resolvedPath.split('/').pop()
                              : imp.source}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-text-disabled text-caption">No local imports</p>
                  )}
                </div>

                {/* npm imports */}
                <div className="bg-bg-card border border-border-default rounded-card p-4 shadow-card">
                  <div className="flex items-center gap-2 mb-3">
                    <Package size={14} className="text-warning" />
                    <h3 className="text-small font-semibold text-text-primary">
                      npm Imports
                    </h3>
                    <span className="ml-auto text-caption bg-warning/10 text-warning px-2 py-0.5 rounded-full">
                      {npmImports.length}
                    </span>
                  </div>
                  {npmImports.length > 0 ? (
                    <div className="space-y-1.5">
                      {npmImports.map((imp, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 py-1.5 px-2 rounded-input bg-bg-secondary hover:bg-bg-hover transition-colors duration-100"
                        >
                          <Package size={12} className="text-warning flex-shrink-0" />
                          <span className="text-caption font-mono text-warning/80 truncate" title={imp.source}>
                            {imp.source}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-text-disabled text-caption">No npm imports</p>
                  )}
                </div>

                {/* Imported by */}
                <div className="bg-bg-card border border-border-default rounded-card p-4 shadow-card">
                  <div className="flex items-center gap-2 mb-3">
                    <ArrowDownLeft size={14} className="text-success" />
                    <h3 className="text-small font-semibold text-text-primary">
                      Used By
                    </h3>
                    <span className="ml-auto text-caption bg-success/10 text-success px-2 py-0.5 rounded-full">
                      {selectedRel.importedBy.length}
                    </span>
                  </div>
                  {selectedRel.importedBy.length > 0 ? (
                    <div className="space-y-1.5">
                      {selectedRel.importedBy.map((path, i) => (
                        <button
                          key={i}
                          onClick={() => setSelected(path)}
                          className="w-full flex items-center gap-2 py-1.5 px-2 rounded-input bg-bg-secondary hover:bg-success/10 transition-colors duration-100 text-left"
                        >
                          <FileCode size={12} className="text-success flex-shrink-0" />
                          <span className="text-caption font-mono text-success/80 truncate" title={path}>
                            {path.split('/').pop()}
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-text-disabled text-caption">Not used by any file</p>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-full gap-4 text-center"
            >
              <div className="w-16 h-16 rounded-card bg-bg-card border border-border-default flex items-center justify-center">
                <Info size={24} className="text-text-muted" />
              </div>
              <div>
                <p className="text-text-secondary text-body font-medium">Select a file</p>
                <p className="text-text-disabled text-small mt-1 max-w-xs">
                  Click any file from the list to view its local imports,
                  npm dependencies, and which files use it.
                </p>
              </div>
              <div className="flex items-center gap-4 text-caption mt-2">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block" />
                  <span className="text-text-muted">Local imports</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-warning inline-block" />
                  <span className="text-text-muted">npm packages</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-success inline-block" />
                  <span className="text-text-muted">Referenced by</span>
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
