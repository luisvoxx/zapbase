import { cn } from '@/lib/utils'

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        'flex h-12 w-full rounded-lg border border-border-primary bg-bg-input px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:border-accent-green focus-visible:shadow-[0_0_15px_rgba(0,255,65,0.3)] disabled:cursor-not-allowed disabled:opacity-50 transition-all',
        className
      )}
      {...props}
    />
  )
}
