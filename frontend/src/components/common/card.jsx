import { motion } from 'framer-motion';

const Card = ({ children, className = '', delay = 0, ...props }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    className={`glass-card p-6 ${className}`}
    {...props}
  >
    {children}
  </motion.div>
);

export default Card;