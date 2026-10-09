import { motion } from 'framer-motion';

interface LoadingScreenProps {
  message: string;
  percent: number;
}

export default function LoadingScreen({ message, percent }: LoadingScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-bg-main gap-8">
      {/* Logo mark */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center gap-4"
      >
        <div className="relative w-20 h-20">
          {/* Outer ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary border-r-accent-cyan"
          />
          {/* Inner icon */}
          <div className="absolute inset-3 rounded-full bg-bg-secondary flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 6C4 4.9 4.9 4 6 4H22C23.1 4 24 4.9 24 6V20L18 24H6C4.9 24 4 23.1 4 22V6Z" stroke="#3B82F6" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M18 20V24L24 20" stroke="#3B82F6" strokeWidth="1.5" strokeLinejoin="round"/>
              <circle cx="14" cy="13" r="3" stroke="#06B6D4" strokeWidth="1.5"/>
              <path d="M14 10V7M14 16V19M11 13H8M17 13H20" stroke="#06B6D4" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
        </div>

        <div className="text-center">
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">CodeAtlas</h1>
          <p className="text-text-muted text-sm mt-1">Understand Any Codebase in Minutes</p>
        </div>
      </motion.div>

      {/* Progress section */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-80 flex flex-col gap-3"
      >
        {/* Progress bar */}
        <div className="h-1.5 bg-bg-secondary rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-accent-cyan rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>

        {/* Message */}
        <div className="flex items-center justify-between">
          <p className="text-text-muted text-sm">{message}</p>
          <span className="text-primary text-sm font-mono">{percent}%</span>
        </div>
      </motion.div>

      {/* Dots animation */}
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-primary"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
    </div>
  );
}
