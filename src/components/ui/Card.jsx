import React from 'react';
import { motion } from 'framer-motion';

const spring = { type: 'spring', stiffness: 300, damping: 22 };

export default function Card({
  children,
  className = '',
  onClick,
  clickable = false,
  layoutId,
  as: Tag = motion.section,
  padding = 'p-5',
  ...rest
}) {
  const interactiveProps = clickable
    ? {
        whileHover: { y: -3, boxShadow: '0 24px 60px -20px rgba(0,196,167,0.25)' },
        whileTap: { scale: 0.985 },
        onClick,
        role: 'button',
        tabIndex: 0,
        onKeyDown: (e) => {
          if ((e.key === 'Enter' || e.key === ' ') && onClick) onClick(e);
        },
      }
    : {};

  return (
    <Tag
      layoutId={layoutId}
      transition={spring}
      className={`glass-panel rounded-2xl border border-white/[0.06] shadow-glow ${padding} ${
        clickable ? 'cursor-pointer select-none' : ''
      } ${className}`}
      {...interactiveProps}
      {...rest}
    >
      {children}
    </Tag>
  );
}
