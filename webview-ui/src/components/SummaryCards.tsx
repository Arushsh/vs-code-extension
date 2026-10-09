import { motion } from 'framer-motion';
import { ProjectInfo } from '../types';
import {
  Code2, Package, FileCode, Folder, GitBranch,
  Cpu, Terminal, BookOpen, Layers,
} from 'lucide-react';

interface SummaryCardsProps {
  info: ProjectInfo;
}

const frameworkIcon: Record<string, React.ReactNode> = {
  'React': <Code2 size={20} className="text-blue-400" />,
  'Next.js': <Layers size={20} className="text-white" />,
  'Vue.js': <Code2 size={20} className="text-green-400" />,
  'Angular': <Code2 size={20} className="text-red-400" />,
  'Express.js': <Terminal size={20} className="text-green-400" />,
  'Node.js': <Terminal size={20} className="text-green-400" />,
  'SvelteKit': <Cpu size={20} className="text-orange-400" />,
};

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
  delay?: number;
}

function StatCard({ icon, label, value, sub, color = 'text-primary', delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      whileHover={{ scale: 1.02, boxShadow: '0 15px 40px rgba(59,130,246,0.18)' }}
      className="bg-bg-card border border-border-default rounded-card p-5 flex flex-col gap-3 transition-all duration-200 cursor-default shadow-card"
    >
      <div className="flex items-center justify-between">
        <span className="text-text-muted text-small font-medium uppercase tracking-wider">{label}</span>
        <div className="w-9 h-9 rounded-node bg-bg-secondary flex items-center justify-center">
          {icon}
        </div>
      </div>
      <div>
        <p className={`text-2xl font-bold ${color} font-mono`}>{value}</p>
        {sub && <p className="text-text-muted text-caption mt-1">{sub}</p>}
      </div>
    </motion.div>
  );
}

export default function SummaryCards({ info }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        icon={frameworkIcon[info.framework] ?? <Layers size={20} className="text-primary" />}
        label="Framework"
        value={info.framework}
        sub={info.buildTool !== 'None / Custom' ? `Build: ${info.buildTool}` : undefined}
        color="text-text-primary"
        delay={0}
      />
      <StatCard
        icon={<Code2 size={20} className="text-accent-cyan" />}
        label="Language"
        value={info.language}
        sub={`v${info.version}`}
        color="text-accent-cyan"
        delay={0.05}
      />
      <StatCard
        icon={<FileCode size={20} className="text-success" />}
        label="Files"
        value={info.totalFiles.toLocaleString()}
        sub={`${info.totalFolders} folders`}
        color="text-success"
        delay={0.1}
      />
      <StatCard
        icon={<Package size={20} className="text-warning" />}
        label="Dependencies"
        value={info.totalDependencies}
        sub={`${info.devDependencies} dev deps`}
        color="text-warning"
        delay={0.15}
      />
      <StatCard
        icon={<GitBranch size={20} className="text-accent-purple" />}
        label="Entry Point"
        value={info.entryPoint}
        color="text-accent-purple"
        delay={0.2}
      />
      <StatCard
        icon={<Package size={20} className="text-info" />}
        label="Package Manager"
        value={info.packageManager}
        color="text-info"
        delay={0.25}
      />
      <StatCard
        icon={<Terminal size={20} className="text-text-secondary" />}
        label="Scripts"
        value={Object.keys(info.scripts).length}
        sub={Object.keys(info.scripts).slice(0, 3).join(', ')}
        color="text-text-secondary"
        delay={0.3}
      />
      <StatCard
        icon={<BookOpen size={20} className="text-success" />}
        label="Description"
        value={info.description || 'No description'}
        color="text-text-secondary"
        delay={0.35}
      />
    </div>
  );
}
