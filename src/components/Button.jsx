import { cn } from '@/lib/utils'

const variants = {
  default: 'bg-gradient-to-br from-accent-green to-[#00CC33] text-black font-bold shadow-glow-green hover:shadow-[0_0_30px_rgba(0,255,65,0.7)] hover:scale-[1.02]',
  destructive: 'bg-gradient-to-br from-accent-red to-[#CC0033] text-white font-bold shadow-glow-red hover:shadow-[0_0_30px_rgba(255,0,64,0.7)] hover:scale-[1.02]',
  outline: 'border-2 border-white bg-transparent text-white hover:bg-white/10 hover:scale-[1.02]',
  secondary: 'bg-bg-secondary text-text-primary border border-border-primary hover:bg-bg-tertiary hover:border-accent-green/30',
  orange: 'bg-accent-orange text-white font-semibold shadow-glow-orange hover:shadow-[0_0_25px_rgba(255,140,0,0.6)] hover:scale-[1.02]',
}

export function Button({
  children,
  variant = 'default',
  className,
  disabled,
  ...props
}) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg px-6 py-3 text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
