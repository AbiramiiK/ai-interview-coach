import { motion } from 'framer-motion';

const Button = ({ children, variant = 'primary', isLoading, className = '', ...props }) => {
  const base = variant === 'primary' ? 'btn-primary' : 'btn-secondary';

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      className={`${base} ${className} flex items-center justify-center gap-2`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
      ) : children}
    </motion.button>
  );
};

export default Button;