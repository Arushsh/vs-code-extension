import { motion } from 'framer-motion';
import { ProjectInfo, FileNode, FileRelationship } from '../types';
import SummaryCards from './SummaryCards';
import {
  FileCode, Package, ArrowRight, Activity,
} from 'lucide-react';

interface DashboardProps {
  info: ProjectInfo;
  fileTree: FileNode[];
  relationships: Record<string, FileRelationship>;
}

export default function Dashboard({ info, fileTree, relationships }: DashboardProps) {
  const topImported = Object.entries(relationships)
    .filter(([, r]) => r.importedBy.length > 0)
    .sort(([, a], [, b]) => b.importedBy.length - a.importedBy.length)
    .slice(0, 6);

  const topDeps = Object.entries(info.dependencies)
    .slice(0, 8);

  // Calculate dependency breakdown
  const localImports = Object.values(relationships).reduce(
    (acc, r) => acc + r.imports.filter((i) => i.isLocal).length, 0
  );
  const npmImports = Object.values(relationships).reduce(
    (acc, r) => acc + r.imports.filter((i) => !i.isLocal).length, 0
  );

  return (
    <div className="p-6 max-w-content mx-auto space-y-8 animate-fade-in">
      {/* Project Hero */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between"
      >
        <div>
          <h1 className="font-display text-5xl text-text-primary leading-tight mb-1">
            {info.name}
          </h1>
          {info.description && (
            <p className="text-text-muted text-body max-w-xl">{info.description}</p>
          )}
        </div>
        <div className="flex gap-3 mt-1">
          <Badge label={info.framework} color="blue" />
          <Badge label={info.language} color="cyan" />
          <Badge label={`v${info.version}`} color="purple" />
        </div>
      </motion.div>

      {/* Stat Cards */}
      <SummaryCards info={info} />

      {/* Two-column section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Imported Files */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-bg-card border border-border-default rounded-card p-5 shadow-card"
        >
          <div className="flex items-center gap-2 mb-4">
            <Activity size={16} className="text-primary" />
            <h2 className="text-sidebar-heading text-text-primary">Most Referenced Files</h2>
          </div>
          {topImported.length > 0 ? (
            <div className="space-y-2">
              {topImported.map(([relPath, rel], i) => (
                <div
                  key={relPath}
                  className="flex items-center justify-between py-2 px-3 rounded-input bg-bg-secondary hover:bg-bg-hover transition-colors duration-150"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-text-disabled text-caption w-4 text-right">{i + 1}</span>
                    <FileCode size={14} className="text-accent-cyan flex-shrink-0" />
                    <span className="text-text-secondary text-small font-mono truncate">
                      {rel.name}
                    </span>
                  </div>
                  <span className="text-success text-caption flex-shrink-0 ml-2 bg-success/10 px-2 py-0.5 rounded-full">
                    ↑ {rel.importedBy.length} refs
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-text-disabled text-small">No import data found.</p>
          )}
        </motion.div>

        {/* Import Analysis Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-bg-card border border-border-default rounded-card p-5 shadow-card"
        >
          <div className="flex items-center gap-2 mb-4">
            <ArrowRight size={16} className="text-accent-cyan" />
            <h2 className="text-sidebar-heading text-text-primary">Import Analysis</h2>
          </div>
          <div className="space-y-4">
            {/* Local imports bar */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary inline-block" />
                  <span className="text-small text-text-secondary">Local File Imports</span>
                </div>
                <span className="text-small font-mono text-primary">{localImports}</span>
              </div>
              <div className="h-2 bg-bg-secondary rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${localImports + npmImports === 0 ? 0 : (localImports / (localImports + npmImports)) * 100}%` }}
                  transition={{ delay: 0.5, duration: 0.6, ease: 'easeOut' }}
                  className="h-full bg-primary rounded-full"
                />
              </div>
            </div>
            {/* npm imports bar */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-warning inline-block" />
                  <span className="text-small text-text-secondary">npm Package Imports</span>
                </div>
                <span className="text-small font-mono text-warning">{npmImports}</span>
              </div>
              <div className="h-2 bg-bg-secondary rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${localImports + npmImports === 0 ? 0 : (npmImports / (localImports + npmImports)) * 100}%` }}
                  transition={{ delay: 0.6, duration: 0.6, ease: 'easeOut' }}
                  className="h-full bg-warning rounded-full"
                />
              </div>
            </div>
            <div className="pt-2 border-t border-border-default flex items-center justify-between">
              <span className="text-text-muted text-small">Total imports scanned</span>
              <span className="text-text-primary font-mono text-small font-semibold">
                {(localImports + npmImports).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Key Dependencies */}
          {topDeps.length > 0 && (
            <div className="mt-5 pt-4 border-t border-border-default">
              <div className="flex items-center gap-2 mb-3">
                <Package size={14} className="text-warning" />
                <span className="text-small text-text-muted">Key Dependencies</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {topDeps.map(([name, version]) => (
                  <span
                    key={name}
                    className="text-caption font-mono bg-bg-secondary border border-border-default px-2 py-1 rounded-input text-text-secondary hover:border-border-active hover:text-text-primary transition-colors duration-150 cursor-default"
                    title={version}
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

function Badge({ label, color }: { label: string; color: 'blue' | 'cyan' | 'purple' | 'green' }) {
  const colorMap = {
    blue: 'bg-primary/10 border-primary/30 text-primary',
    cyan: 'bg-accent-cyan/10 border-accent-cyan/30 text-accent-cyan',
    purple: 'bg-accent-purple/10 border-accent-purple/30 text-accent-purple',
    green: 'bg-success/10 border-success/30 text-success',
  };
  return (
    <span className={`text-caption font-medium px-3 py-1 rounded-full border ${colorMap[color]}`}>
      {label}
    </span>
  );
}
