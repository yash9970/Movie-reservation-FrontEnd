/**
 * Loading Skeleton component for better loading states
 * @param {object} props - Component props
 * @param {string} props.variant - Skeleton variant: 'text' | 'card' | 'avatar' | 'rect'
 * @param {number} props.count - Number of skeleton items (for text variant)
 * @param {string} props.className - Additional CSS classes
 */
const LoadingSkeleton = ({ variant = 'text', count = 1, className = '' }) => {
    const baseStyles = 'shimmer rounded-lg';

    const variants = {
        text: 'h-4 w-full',
        card: 'h-64 w-full',
        avatar: 'h-12 w-12 rounded-full',
        rect: 'h-32 w-full',
    };

    if (variant === 'text' && count > 1) {
        return (
            <div className="space-y-3">
                {Array.from({ length: count }).map((_, i) => (
                    <div
                        key={i}
                        className={`${baseStyles} ${variants[variant]} ${className}`}
                        style={{ width: `${100 - i * 10}%` }}
                    />
                ))}
            </div>
        );
    }

    return (
        <div className={`${baseStyles} ${variants[variant]} ${className}`} />
    );
};

export default LoadingSkeleton;
