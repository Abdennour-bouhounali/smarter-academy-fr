import { motion, useScroll, useTransform } from 'framer-motion';

export default function BackgroundLayer() {
  const { scrollYProgress } = useScroll();
  const yBg = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {/* Dot grid */}
      <motion.div
        style={{
          position: 'absolute',
          inset: '-50%',
          opacity: 0.035,
          y: yBg,
          backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          willChange: 'transform'
        }}
      />

      {/* Blue blob — top right */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          top: '10%',
          right: '10%',
          width: '40vw',
          height: '40vw',
          background: 'radial-gradient(circle, #3B82F6 0%, transparent 70%)',
          opacity: 0.05,
          willChange: 'transform, opacity'
        }}
      />

      {/* Purple blob — bottom left */}
      <motion.div
        animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        style={{
          position: 'absolute',
          bottom: '20%',
          left: '5%',
          width: '50vw',
          height: '50vw',
          background: 'radial-gradient(circle, #8B5CF6 0%, transparent 70%)',
          opacity: 0.04,
          willChange: 'transform, opacity'
        }}
      />

      {/* Cyan blob — center */}
      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0.3, 0.15] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '30vw',
          height: '30vw',
          background: 'radial-gradient(circle, #06B6D4 0%, transparent 70%)',
          opacity: 0.03,
          willChange: 'transform, opacity'
        }}
      />
    </div>
  );
}
