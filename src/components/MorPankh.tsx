
import React from 'react';
import { motion } from 'framer-motion';

export const MorPankh = ({ className = "", style = {} }: { className?: string, style?: React.CSSProperties }) => {
  return (
    <motion.div
      className={`relative ${className}`}
      style={style}
      initial={{ rotate: -5, opacity: 0.8 }}
      animate={{
        rotate: 5,
        opacity: [0.8, 1, 0.8]
      }}
      transition={{
        rotate: {
          duration: 4,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut"
        },
        opacity: {
          duration: 3,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut"
        }
      }}
    >
      <img
        src="/mor_pankh_new.png"
        alt="Krishna Mor Pankh"
        className="w-full h-full object-contain drop-shadow-2xl"
      />
    </motion.div>
  );
};
