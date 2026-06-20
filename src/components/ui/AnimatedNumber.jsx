import React, { useEffect, useRef } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

export default function AnimatedNumber({
  value = 0,
  formatter = (v) => Math.round(v).toLocaleString('en-US'),
  className = '',
  springConfig = { stiffness: 120, damping: 20, mass: 0.6 },
}) {
  const numeric = typeof value === 'number' ? value : parseFloat(value) || 0;
  const spring = useSpring(numeric, springConfig);
  const display = useTransform(spring, (v) => formatter(v));
  const isFirst = useRef(true);

  useEffect(() => {
    spring.set(numeric);
    isFirst.current = false;
  }, [numeric, spring]);

  return (
    <motion.span className={`tabular-nums ${className}`}>
      <motion.span>{display}</motion.span>
    </motion.span>
  );
}
