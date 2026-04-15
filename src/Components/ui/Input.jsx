import { forwardRef } from 'react';

/**
 * Reusable Input component with icon support
 * @param {object} props - Component props
 * @param {React.ReactNode} props.icon - Icon component to display
 * @param {string} props.error - Error message
 * @param {string} props.label - Input label
 * @param {string} props.className - Additional CSS classes
 */
const Input = forwardRef(
    ({ icon: Icon, error, label, className = '', ...props }, ref) => {
        return (
            <div className="space-y-2">
                {label && <label className="text-sm text-gray-400">{label}</label>}
                <div className="relative">
                    {Icon && (
                        <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    )}
                    <input
                        ref={ref}
                        className={`input-field ${Icon ? 'pl-12' : ''} ${error ? 'border-red-500 focus:ring-red-500' : ''
                            } ${className}`}
                        {...props}
                    />
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
        );
    }
);

Input.displayName = 'Input';

export default Input;
