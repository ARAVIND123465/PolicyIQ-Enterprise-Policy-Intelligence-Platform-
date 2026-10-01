export default function LoadingSpinner({ size = 'md', className = '' }) {
  const s = { sm: 'w-4 h-4 border-2', md: 'w-6 h-6 border-2', lg: 'w-9 h-9 border-[3px]' }
  return (
    <div
      className={`${s[size]} rounded-full border-primary-200 border-t-primary-600 animate-spin ${className}`}
      role="status" aria-label="Loading"
    />
  )
}
