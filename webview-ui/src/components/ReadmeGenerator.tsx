import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { ProjectInfo, FileNode, FileRelationship } from '../types';
import { useVSCode } from '../hooks/useVSCode';
import {
  Wand2, Copy, Download, CheckCheck, RefreshCw, Eye, Code2,
} from 'lucide-react';

interface ReadmeGeneratorProps {
  projectInfo: ProjectInfo;
  fileTree: FileNode[];
  relationships: Record<string, FileRelationship>;
}

type ViewMode = 'preview' | 'raw';

export default function ReadmeGenerator({
  projectInfo,
  fileTree,
  relationships,
}: ReadmeGeneratorProps) {
  const { postMessage } = useVSCode();
  const [content, setContent] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('preview');

  // Listen for readme response from extension
  useState(() => {
    const handler = (event: MessageEvent) => {
      const msg = event.data;
      if (msg.type === 'readmeGenerated') {
        setContent(msg.payload.content as string);
        setGenerating(false);
      }
      if (msg.type === 'savedReadme') {
        setSaving(false);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  });

  const handleGenerate = useCallback(() => {
    setGenerating(true);
    postMessage({
      type: 'generateReadme',
      payload: { projectInfo, fileTree, relationships },
    });
  }, [postMessage, projectInfo, fileTree, relationships]);

  const handleCopy = useCallback(async () => {
    if (!content) return;
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [content]);

  const handleSave = useCallback(() => {
    if (!content) return;
    setSaving(true);
    postMessage({ type: 'saveReadme', payload: { content } });
  }, [postMessage, content]);

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex-shrink-0 flex items-center justify-between px-6 py-3 border-b border-border-default bg-bg-sidebar">
        <div>
          <h2 className="text-sidebar-heading text-text-primary">README Generator</h2>
          <p className="text-text-muted text-caption">
            Generate a professional README.md for <span className="text-accent-cyan font-mono">{projectInfo.name}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View toggle */}
          {content && (
            <div className="flex items-center bg-bg-secondary border border-border-default rounded-btn overflow-hidden">
              <button
                onClick={() => setViewMode('preview')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-small transition-colors duration-150 ${
                  viewMode === 'preview'
                    ? 'bg-primary text-white'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                <Eye size={13} /> Preview
              </button>
              <button
                onClick={() => setViewMode('raw')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-small transition-colors duration-150 ${
                  viewMode === 'raw'
                    ? 'bg-primary text-white'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                <Code2 size={13} /> Raw
              </button>
            </div>
          )}

          {/* Generate / Re-generate */}
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-btn text-small font-medium transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed shadow-hover"
          >
            {generating ? (
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                <RefreshCw size={14} />
              </motion.div>
            ) : (
              <Wand2 size={14} />
            )}
            {content ? 'Regenerate' : 'Generate README'}
          </button>

          {/* Copy */}
          {content && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 border border-border-default hover:border-border-active text-text-secondary hover:text-text-primary px-4 py-2 rounded-btn text-small font-medium transition-all duration-150"
            >
              {copied ? <CheckCheck size={14} className="text-success" /> : <Copy size={14} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          )}

          {/* Save */}
          {content && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-success/10 hover:bg-success/20 border border-success/30 text-success px-4 py-2 rounded-btn text-small font-medium transition-all duration-150 disabled:opacity-50"
            >
              <Download size={14} />
              {saving ? 'Saving…' : 'Save README.md'}
            </button>
          )}
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto">
        {!content && !generating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center h-full gap-6 text-center"
          >
            <div className="w-20 h-20 rounded-modal bg-bg-card border border-border-default flex items-center justify-center shadow-card">
              <Wand2 size={32} className="text-primary" />
            </div>
            <div>
              <h3 className="text-card-title text-text-primary mb-2">Generate Your README</h3>
              <p className="text-text-muted text-small max-w-sm">
                Click the button above to automatically create a professional README.md based
                on your project structure, dependencies, and detected tech stack.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-left max-w-sm w-full">
              {[
                '📋 Project title & description',
                '🛠 Tech stack table',
                '🚀 Installation instructions',
                '📜 Scripts reference',
                '📁 Folder structure tree',
                '📦 Key dependencies',
                '🔗 Most connected files',
                '📄 License placeholder',
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-text-muted text-small">
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {generating && (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              className="w-10 h-10 rounded-full border-2 border-transparent border-t-primary border-r-accent-cyan"
            />
            <p className="text-text-muted text-small">Generating README…</p>
          </div>
        )}

        {content && !generating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-6 max-w-4xl mx-auto"
          >
            {viewMode === 'preview' ? (
              <div className="markdown-content animate-fade-in">
                <ReactMarkdown>{content}</ReactMarkdown>
              </div>
            ) : (
              <div className="animate-fade-in">
                <pre className="bg-bg-card border border-border-default rounded-card p-5 text-code font-mono text-text-secondary overflow-x-auto whitespace-pre-wrap break-words">
                  {content}
                </pre>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
