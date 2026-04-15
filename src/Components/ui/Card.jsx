/**
 * Reusable Card component
 * @param {object} props - Component props
 * @param {React.ReactNode} props.children - Card content
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.hover - Enable hover effect
 */
const Card = ({ children, className = '', hover = false, ...props }) => {
    const hoverStyles = hover
        ? 'hover:scale-105 hover:shadow-2xl hover:shadow-red-500/20 cursor-pointer'
        : '';

    return (
        <div
            className={`glass-card transition-all duration-300 ${hoverStyles} ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};

export default Card;
