import { m } from 'framer-motion'

interface ProgressBarProps {
  current: number
  total: number
}

export default function ProgressBar({ current, total }: ProgressBarProps) {
  const percentage = Math.min(Math.max((current / total) * 100, 0), 100)

  return (
    <div className="w-full flex flex-col gap-2.5 px-6">
      <div className="flex justify-between items-center text-xs font-semibold tracking-wider text-zinc-400 uppercase">
        <span>Question {current} of {total}</span>
        <span className="text-purple-400 font-mono">{Math.round(percentage)}%</span>
      </div>
      
      <div className="w-full h-2 bg-zinc-800/80 rounded-full overflow-hidden border border-zinc-700/30 p-[1px]">
        <m.div
          className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ type: 'spring', stiffness: 80, damping: 15 }}
        />
      </div>
    </div>
  )
}
