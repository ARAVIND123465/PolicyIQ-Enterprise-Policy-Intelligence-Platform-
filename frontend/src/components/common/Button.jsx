import LoadingSpinner from './LoadingSpinner'

export default function Button({
  children, variant = 'primary', size = 'md', loading = false,
  icon: Icon, className = '', ...props
}) {
  const variants = {
    primary:  'btn-primary',
    secondary:'btn-secondary',
    ghost:    'btn-ghost',
    danger:   'btn-danger',
  }
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-5 py-2.5 text-sm' }

  return (
    <button
      className={`${variants[variant]} ${sizes[size]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? <LoadingSpinner size="sm" /> : Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
      {children}
    </button>
  )
}
