import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export default function GlobalCursor() {
  const mx = useMotionValue(-200);
  const my = useMotionValue(-200);
  const rx = useSpring(mx, { stiffness: 280, damping: 22 });
  const ry = useSpring(my, { stiffness: 280, damping: 22 });
  const [hovered, setHovered] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    setIsTouch(window.matchMedia('(pointer: coarse)').matches);
    const move = (e: MouseEvent) => { mx.set(e.clientX); my.set(e.clientY); };
    const over = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      setHovered(!!(el.closest('a,button,[role="button"],.tilt-card')));
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseover', over);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseover', over);
    };
  }, [mx, my]);

  if (isTouch) return null;

  const dotSize = useSpring(hovered ? 6 : 8, { stiffness: 320, damping: 24 });
  const ringSize = useSpring(hovered ? 48 : 36, { stiffness: 260, damping: 22 });
  const ringOpacity = useSpring(hovered ? 0.8 : 0.4, { stiffness: 300, damping: 24 });

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 z-[9998] pointer-events-none rounded-full"
        style={{
          x: mx, y: my,
          translateX: '-50%', translateY: '-50%',
          width: dotSize, height: dotSize,
          background: hovered ? '#ffd166' : '#f5a623',
          boxShadow: '0 0 10px rgba(245,166,35,0.9)',
        }}
      />
      <motion.div
        className="fixed top-0 left-0 z-[9997] pointer-events-none rounded-full"
        style={{
          x: rx, y: ry,
          translateX: '-50%', translateY: '-50%',
          width: ringSize, height: ringSize,
          border: '1.5px solid rgba(245,166,35,0.55)',
          opacity: ringOpacity,
        }}
      />
    </>
  );
}
