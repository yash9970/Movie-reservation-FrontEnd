import { forwardRef } from 'react';

/**
 * Reusable Button component with variants
 * @param {object} props - Component props
 * @param {string} props.variant - Button variant: 'primary' | 'secondary' | 'ghost' | 'danger'
 * @param {string} props.size - Button size: 'sm' | 'md' | 'lg'
 * @param {boolean} props.disabled - Disabled state
 * @param {boolean} props.loading - Loading state
 * @param {string} props.className - Additional CSS classes
 * @param {React.ReactNode} props.children - Button content
 */
const Button = forwardRef(
    (
        {
            variant = 'primary',
            size = 'md',
            disabled = false,
            loading = false,
            className = '',
            children,
            ...props
        },
        ref
    ) => {
        const baseStyles =
            'font-semibold rounded-xl transition-all duration-300 inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed';

        const variants = {
            primary:
                'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white transform hover:scale-105 shadow-lg hover:shadow-red-500/50',
            secondary:
                'bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm border border-white/20',
            ghost: 'bg-transparent hover:bg-white/10 text-white',
            danger:
                'bg-gradient-to-r from-red-700 to-red-900 hover:from-red-800 hover:to-red-950 text-white',
        };

        const sizes = {
            sm: 'py-2 px-4 text-sm',
            md: 'py-3 px-6 text-base',
            lg: 'py-4 px-8 text-lg',
        };

        return (
            <button
                ref={ref}
                disabled={disabled || loading}
                className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
                {...props}
            >
                {loading && (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                )}
                {children}
            </button>
        );
    }
);

Button.displayName = 'Button';

export default Button;
