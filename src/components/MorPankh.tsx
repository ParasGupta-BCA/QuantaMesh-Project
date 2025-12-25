
import React from 'react';
import { motion } from 'framer-motion';

export const MorPankh = ({ className = "", style = {} }: { className?: string, style?: React.CSSProperties }) => {
  return (
    <motion.div
      className={`relative ${className}`}
      style={style}
      initial={{ rotate: -2, opacity: 0.9 }}
      animate={{
        rotate: [0, 8, 0], // Gentle sway from wind
        x: [0, 2, 0], // Slight horizontal push
      }}
      transition={{
        rotate: {
          duration: 8, // Much slower
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut"
        },
        x: {
          duration: 8,
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
