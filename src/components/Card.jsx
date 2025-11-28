import { cn } from '@/lib/utils'

export function Card({ children, className, ...props }) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border-primary bg-bg-secondary p-6 shadow-[0_4px_24px_rgba(0,0,0,0.4)] transition-all hover:border-accent-green/30 hover:-translate-y-0.5',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className }) {
  return (
    <div className={cn('flex flex-col space-y-1.5 pb-4', className)}>
      {children}
    </div>
  )
}

export function CardTitle({ children, className }) {
  return (
    <h3 className={cn('text-xl font-bold text-text-primary', className)}>
      {children}
    </h3>
  )
}

export function CardContent({ children, className }) {
  return <div className={cn('pt-0', className)}>{children}</div>
}
