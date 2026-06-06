import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

const GOLD = '252, 163, 17';

const PARTICLE_COUNT = 65;
const CONNECT_DISTANCE = 160;

const createParticles = (width, height) =>
  Array.from({ length: PARTICLE_COUNT }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 1.5,
    vy: (Math.random() - 0.5) * 1.5,
    radius: Math.random() * 1.5 + 0.5,
  }));

const AnimatedBackground = () => {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const frameRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const motionScale = window.matchMedia('(prefers-reduced-motion: reduce)')
      .matches
      ? 0.2
      : 1;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      particlesRef.current = createParticles(w, h);
    };

    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;

      // Clear the canvas completely
      ctx.clearRect(0, 0, w, h);

      const particles = particlesRef.current;

      // Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.x += p.vx * motionScale;
        p.y += p.vy * motionScale;

        // Wrap around edges smoothly
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        // Draw node
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${GOLD}, 0.7)`;
        ctx.fill();

        // Draw connections
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < CONNECT_DISTANCE) {
            ctx.beginPath();
            const opacity = (1 - dist / CONNECT_DISTANCE) * 0.45;
            ctx.strokeStyle = `rgba(${GOLD}, ${opacity})`;
            ctx.lineWidth = 1;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      frameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      if (frameRef.current) 
        cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return createPortal(
    <div className="animated-bg" aria-hidden="true">
      <canvas ref={canvasRef} className="animated-bg__canvas" />
      <div className="animated-bg__glow" />
    </div>,
    document.body
  );
};

export default AnimatedBackground;
