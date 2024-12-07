export default function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="w-full max-w-xs">
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-blue-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="mt-2 text-center text-sm text-[var(--text-secondary)]">
        {Math.round(progress)}%
      </div>
    </div>
  )
} 