/**
 * Reusable Loading Spinner component
 * @param {object} props - Component props
 * @param {string} props.size - Spinner size: 'sm' | 'md' | 'lg' | 'xl'
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.message - Optional loading message
 */
const LoadingSpinner = ({ size = 'md', className = '', message }) => {
    const sizes = {
        sm: 'h-8 w-8 border-2',
        md: 'h-12 w-12 border-3',
        lg: 'h-16 w-16 border-4',
        xl: 'h-24 w-24 border-4',
    };

    return (
        <div className="flex flex-col items-center justify-center gap-4">
            <div
                className={`animate-spin rounded-full border-red-500 border-t-transparent ${sizes[size]} ${className}`}
            />
            {message && <p className="text-gray-400 text-sm">{message}</p>}
        </div>
    );
};

export default LoadingSpinner;
