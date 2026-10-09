import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, FolderTree, GitBranch,
  BookOpen, RefreshCw, AlertCircle,
} from 'lucide-react';
import { ProjectInfo, FileNode, FileRelationship, AppTab, ExtensionMessage } from './types';
import LoadingScreen from './components/LoadingScreen';
import Dashboard from './components/Dashboard';
import FolderExplorer from './components/FolderExplorer';
import FileRelationships from './components/FileRelationships';
import ReadmeGenerator from './components/ReadmeGenerator';
import { useVSCode } from './hooks/useVSCode';

type AppState =
  | { status: 'idle' }
  | { status: 'loading'; message: string; percent: number }
  | {
      status: 'ready';
      projectInfo: ProjectInfo;
      fileTree: FileNode[];
      relationships: Record<string, FileRelationship>;
    }
  | { status: 'error'; message: string };

const TABS: { id: AppTab; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
  { id: 'explorer', label: 'Folder Explorer', icon: <FolderTree size={16} /> },
  { id: 'relationships', label: 'File Relationships', icon: <GitBranch size={16} /> },
  { id: 'readme', label: 'README Generator', icon: <BookOpen size={16} /> },
];

export default function App() {
  const [state, setState] = useState<AppState>({ status: 'idle' });
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const { postMessage } = useVSCode();

  useEffect(() => {
    // Notify extension host that webview React app has mounted and is ready
    postMessage({ type: 'ready' });

    const handler = (event: MessageEvent) => {
      const msg = event.data as ExtensionMessage;

      if (msg.type === 'progress') {
        const p = msg.payload as { message: string; percent: number };
        setState({ status: 'loading', message: p.message, percent: p.percent });
      }

      if (msg.type === 'projectData') {
        const payload = msg.payload as {
          projectInfo: ProjectInfo;
          fileTree: FileNode[];
          relationships: Record<string, FileRelationship>;
        };
        setState({
          status: 'ready',
          projectInfo: payload.projectInfo,
          fileTree: payload.fileTree,
          relationships: payload.relationships,
        });
        setActiveTab('dashboard');
      }

      if (msg.type === 'error') {
        const p = msg.payload as { message: string };
        setState({ status: 'error', message: p.message });
      }
    };

    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  if (state.status === 'idle') {
    return <IdleScreen />;
  }

  if (state.status === 'loading') {
    return <LoadingScreen message={state.message} percent={state.percent} />;
  }

  if (state.status === 'error') {
    return <ErrorScreen message={state.message} />;
  }

  const { projectInfo, fileTree, relationships } = state;

  return (
    <div className="flex flex-col h-screen bg-bg-main overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 flex items-center justify-between px-6 py-3 bg-bg-sidebar border-b border-border-default">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-node bg-bg-secondary flex items-center justify-center border border-border-default">
            <svg width="18" height="18" viewBox="0 0 28 28" fill="none">
              <path d="M4 6C4 4.9 4.9 4 6 4H22C23.1 4 24 4.9 24 6V20L18 24H6C4.9 24 4 23.1 4 22V6Z" stroke="#3B82F6" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M18 20V24L24 20" stroke="#3B82F6" strokeWidth="1.5" strokeLinejoin="round"/>
              <circle cx="14" cy="13" r="3" stroke="#06B6D4" strokeWidth="1.5"/>
              <path d="M14 10V7M14 16V19M11 13H8M17 13H20" stroke="#06B6D4" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <span className="font-display text-2xl text-text-primary leading-none">CodeAtlas</span>
            <span className="text-text-muted text-caption ml-2 hidden sm:inline">
              {projectInfo.name} · {projectInfo.framework}
            </span>
          </div>
        </div>

        {/* Re-analyze button */}
        <button
          onClick={() => setState({ status: 'idle' })}
          className="flex items-center gap-2 text-text-muted hover:text-text-primary text-small border border-border-default hover:border-border-active px-3 py-1.5 rounded-btn transition-all duration-200"
        >
          <RefreshCw size={14} />
          <span>Re-analyze</span>
        </button>
      </header>

      {/* Tab Bar */}
      <nav className="flex-shrink-0 flex items-center px-6 bg-bg-sidebar border-b border-border-default gap-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative flex items-center gap-2 px-4 py-3 text-small font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? 'text-text-primary'
                : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            {tab.icon}
            {tab.label}
            {activeTab === tab.id && (
              <motion.div
                layoutId="tab-indicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t"
              />
            )}
          </button>
        ))}
      </nav>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {activeTab === 'dashboard' && (
              <Dashboard info={projectInfo} fileTree={fileTree} relationships={relationships} />
            )}
            {activeTab === 'explorer' && (
              <FolderExplorer fileTree={fileTree} />
            )}
            {activeTab === 'relationships' && (
              <FileRelationships relationships={relationships} />
            )}
            {activeTab === 'readme' && (
              <ReadmeGenerator
                projectInfo={projectInfo}
                fileTree={fileTree}
                relationships={relationships}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

function IdleScreen() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-bg-main gap-6">
      <div className="w-24 h-24 rounded-card bg-bg-secondary border border-border-default flex items-center justify-center shadow-card">
        <svg width="44" height="44" viewBox="0 0 28 28" fill="none">
          <path d="M4 6C4 4.9 4.9 4 6 4H22C23.1 4 24 4.9 24 6V20L18 24H6C4.9 24 4 23.1 4 22V6Z" stroke="#3B82F6" strokeWidth="1.5" strokeLinejoin="round"/>
          <path d="M18 20V24L24 20" stroke="#3B82F6" strokeWidth="1.5" strokeLinejoin="round"/>
          <circle cx="14" cy="13" r="3" stroke="#06B6D4" strokeWidth="1.5"/>
          <path d="M14 10V7M14 16V19M11 13H8M17 13H20" stroke="#06B6D4" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>
      <div className="text-center">
        <h1 className="font-display text-5xl text-text-primary mb-2">CodeAtlas</h1>
        <p className="text-text-muted text-body">Understand any codebase in minutes</p>
      </div>
      <p className="text-text-disabled text-small text-center max-w-xs">
        Run <code className="bg-bg-secondary px-2 py-0.5 rounded text-accent-cyan">CodeAtlas: Analyze Project</code> from the Command Palette to get started.
      </p>
    </div>
  );
}

function ErrorScreen({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-bg-main gap-6">
      <div className="w-16 h-16 rounded-card bg-red-950/40 border border-error/30 flex items-center justify-center">
        <AlertCircle size={28} className="text-error" />
      </div>
      <div className="text-center">
        <h2 className="text-xl font-semibold text-text-primary mb-2">Analysis Failed</h2>
        <p className="text-text-muted text-small font-mono bg-bg-secondary px-4 py-3 rounded-card max-w-md border border-border-default">
          {message}
        </p>
      </div>
    </div>
  );
}
