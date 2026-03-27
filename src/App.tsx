import React, { useState, useEffect, useRef } from 'react';
import { Copy, CheckCircle, ShoppingBag, Clock, Zap, Tag, X, ArrowRight, Star } from 'lucide-react';

const COUPON_CODE = "M56";
const NOON_URL = "https://www.noon.com/egypt-en/";

/* ─── Premium Animated Canvas Background ─── */
function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Set alpha to false to let browser know there's no transparency behind canvas (optimization)
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animId: number;
    let W = window.innerWidth;
    let H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    // Smooth Mouse Tracking for Parallax & Interactions
    let mouseX = W / 2;
    let mouseY = H / 2;
    let targetMouseX = W / 2;
    let targetMouseY = H / 2;

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const resize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W;
      canvas.height = H;
    };
    window.addEventListener('resize', resize);

    /* ── Floating Particles ── */
    const PARTICLE_COUNT = Math.min(Math.floor((W * H) / 10000), 120); // Responsive count
    interface Particle {
      x: number; y: number;
      baseR: number; r: number;
      vx: number; vy: number;
      color: string;
      angle: number; spin: number;
      pulseRate: number; pulseVal: number;
    }
    const colors = ['#3b82f6', '#9333ea', '#fbbf24', '#ffffff', '#60a5fa']; // Blue, Purple, Gold, White, Light Blue
    const particles: Particle[] = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      baseR: Math.random() * 1.5 + 0.5,
      r: 1,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      color: colors[Math.floor(Math.random() * colors.length)],
      angle: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.02,
      pulseRate: Math.random() * 0.02 + 0.005,
      pulseVal: Math.random() * Math.PI * 2,
    }));

    /* ── Morphing Gradient Orbs ── */
    const orbs = [
      { baseX: 0.2, baseY: 0.3, size: 0.6, color: 'rgba(59, 130, 246, 0.12)', angle: 0, speed: 0.0015, offset: 120 },
      { baseX: 0.8, baseY: 0.6, size: 0.5, color: 'rgba(147, 51, 234, 0.12)', angle: 2, speed: 0.001, offset: 150 },
      { baseX: 0.5, baseY: 0.8, size: 0.6, color: 'rgba(59, 130, 246, 0.08)', angle: 3, speed: 0.0012, offset: 100 },
      { baseX: 0.4, baseY: 0.4, size: 0.4, color: 'rgba(251, 191, 36, 0.06)', angle: 5, speed: 0.0008, offset: 200 },
    ];

    const draw = () => {
      // Lerp mouse coordinates
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      // Dark Base background
      ctx.fillStyle = '#030712'; // Tailwind gray-950 deep black
      ctx.fillRect(0, 0, W, H);

      ctx.globalCompositeOperation = 'screen';

      // ── Draw Morphing Glowing Orbs (Parallax) ──
      orbs.forEach((orb, i) => {
        orb.angle += orb.speed;
        const radius = Math.max(W, H) * orb.size;
        
        // Organic orbit
        const offsetX = Math.cos(orb.angle) * orb.offset;
        const offsetY = Math.sin(orb.angle) * orb.offset;
        
        // Depth parallax based on mouse
        const parallaxX = (mouseX - W / 2) * (i + 1) * 0.04;
        const parallaxY = (mouseY - H / 2) * (i + 1) * 0.04;

        const cx = W * orb.baseX + offsetX + parallaxX;
        const cy = H * orb.baseY + offsetY + parallaxY;

        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        grad.addColorStop(0, orb.color);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      });

      // ── Connect Nearby Particles (Network lines) ──
      ctx.lineWidth = 0.5;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distSq = dx * dx + dy * dy;
          if (distSq < 10000) {
            const alpha = (1 - Math.sqrt(distSq) / 100) * 0.25;
            ctx.strokeStyle = `rgba(147, 51, 234, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      ctx.globalCompositeOperation = 'source-over';

      // ── Draw Particles ──
      particles.forEach(p => {
        p.pulseVal += p.pulseRate;
        const pulse = (Math.sin(p.pulseVal) + 1) / 2; // 0 to 1

        p.angle += p.spin;
        // Fluid sine-wave movement
        p.x += p.vx + Math.cos(p.angle) * 0.4;
        p.y += p.vy + Math.sin(p.angle) * 0.4;

        // Hover effect: Repel / Attract and enlarge
        const dx = mouseX - p.x;
        const dy = mouseY - p.y;
        const distSq = dx * dx + dy * dy;
        const dist = Math.sqrt(distSq);
        
        if (dist < 150) {
          const force = (150 - dist) / 150;
          p.x -= dx * force * 0.02; // Subtle push
          p.y -= dy * force * 0.02;
          p.r = p.baseR + force * 2.5; // Grow near mouse
        } else {
          // Return to normal size smoothly
          p.r += (p.baseR - p.r) * 0.1;
        }

        // Screen wrapping (seamless)
        if (p.x < -20) p.x = W + 20;
        if (p.x > W + 20) p.x = -20;
        if (p.y < -20) p.y = H + 20;
        if (p.y > H + 20) p.y = -20;

        // Outer Glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 3.5, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.15 * pulse;
        ctx.fill();

        // Inner Core
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.globalAlpha = 0.6 + pulse * 0.4;
        ctx.fill();
        ctx.globalAlpha = 1.0;
      });

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 0 }}
      />
      {/* ── Subtle Noise / Grain Overlay for cinematic realism ── */}
      <div 
        className="fixed inset-0 pointer-events-none mix-blend-overlay" 
        style={{ 
          zIndex: 1, 
          opacity: 0.15,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` 
        }}
        aria-hidden="true"
      />
    </>
  );
}

/* ─── Countdown Timer ─── */
function CountdownTimer() {
  const [time, setTime] = useState({ hours: 23, minutes: 59, seconds: 59 });

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4" dir="ltr" aria-label="Countdown timer">
      {[
        { value: time.hours, label: 'HRS' },
        { value: time.minutes, label: 'MIN' },
        { value: time.seconds, label: 'SEC' },
      ].map(({ value, label }, i) => (
        <React.Fragment key={label}>
          <div className="flex flex-col items-center">
            <div className="bg-white/5 border border-white/10 rounded-2xl w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center shadow-[inset_0_2px_10px_rgba(255,255,255,0.05)] backdrop-blur-md">
              <span className="text-2xl sm:text-3xl font-black text-white tabular-nums tracking-tight">{pad(value)}</span>
            </div>
            <span className="text-[10px] font-bold text-yellow-400 mt-2 tracking-widest opacity-80">{label}</span>
          </div>
          {i < 2 && <span className="text-2xl font-black text-white/30 mb-5 pb-1">:</span>}
        </React.Fragment>
      ))}
    </div>
  );
}

/* ─── Modal ─── */
function Modal({ couponCode, onClose, onShop }: { couponCode: string; onClose: () => void; onShop: () => void }) {
  // Trap focus / escape logic for accessibility (UX rule)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/80 backdrop-blur-lg transition-all duration-300"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="relative bg-[#0A0F1C] border border-white/10 rounded-3xl shadow-2xl max-w-sm w-full p-8 overflow-hidden transform transition-all duration-300 scale-100 opacity-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-yellow-400/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none" />

        <button 
          onClick={onClose} 
          className="absolute top-5 right-5 text-gray-400 hover:text-white transition-colors duration-200 cursor-pointer p-2 rounded-full hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400" 
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative text-center space-y-6">
          <div className="w-16 h-16 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(34,197,94,0.2)]">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-white mb-2">تم النسخ بنجاح!</h3>
            <p className="text-gray-400 text-sm leading-relaxed" dir="rtl">
              كود الخصم <strong className="text-yellow-400 font-bold">{couponCode}</strong> اتنسخ. روح نون دلوقتي واستخدمه عند الدفع!
            </p>
          </div>
          
          <div className="bg-[#111827] border border-white/5 rounded-2xl p-4 shadow-inner">
            <p className="text-xs text-gray-500 mb-1">كود الخصم المستنسخ</p>
            <p className="text-3xl font-black text-white tracking-[0.2em]">{couponCode}</p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={onShop}
              className="w-full bg-white text-black hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 font-black py-4 px-6 rounded-2xl transition-all duration-200 cursor-pointer shadow-lg flex items-center justify-center gap-2 text-lg group"
            >
              <ShoppingBag className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
              <span>اشتري من نون دلوقتي</span>
              <ArrowRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" />
            </button>
            <button
              onClick={onClose}
              className="w-full bg-transparent hover:bg-white/5 border border-white/10 text-gray-400 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 font-semibold py-3 px-6 rounded-2xl transition-all duration-200 cursor-pointer"
            >
              رجوع
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main App ─── */
export default function App() {
  const [copied, setCopied] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(COUPON_CODE).then(() => {
      setCopied(true);
      setShowModal(true);
      // Reset copied state after 3 seconds
      setTimeout(() => setCopied(false), 3000);
    });
  };

  const handleShop = () => {
    setShowModal(false);
    window.open(NOON_URL, '_blank', 'noopener,noreferrer'); // Security best practice
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-x-hidden relative selection:bg-yellow-400 selection:text-black" style={{ fontFamily: "'Inter', sans-serif" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@700;800&display=swap');
        
        * { box-sizing: border-box; }
        body { margin: 0; padding: 0; background-color: #030712; }

        @media (prefers-reduced-motion: no-preference) {
          @keyframes float    { 0%,100%{ transform:translateY(0) }   50%{ transform:translateY(-12px) } }
          @keyframes shimmer  { 0%{ background-position:200% center } 100%{ background-position:-200% center } }
          @keyframes pulse-ring { 0%{ transform:scale(0.95); opacity:.8 } 100%{ transform:scale(1.1); opacity:0 } }
          @keyframes glow-pulse { 0%,100%{ box-shadow:0 0 20px #facc1510 } 50%{ box-shadow:0 0 40px #facc1520, 0 0 60px #f9731610 } }
          @keyframes slide-up { from{ opacity:0; transform:translateY(20px) } to{ opacity:1; transform:translateY(0) } }
          
          .motion-safe-float { animation: float 4s ease-in-out infinite; }
          .motion-safe-shimmer { animation: shimmer 4s linear infinite; }
          .motion-safe-pulse-ring { animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
          .motion-safe-glow-pulse { animation: glow-pulse 3s ease-in-out infinite; }
          .motion-safe-slide-up { animation: slide-up .6s cubic-bezier(0.16, 1, 0.3, 1) both; }
        }

        .shimmer-text {
          background: linear-gradient(90deg, #FFFFFF 0%, #cbd5e1 25%, #FFFFFF 50%, #facc15 75%, #FFFFFF 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .pulse-ring-wrapper { position: relative; }
        .pulse-ring-wrapper::before {
          content:'';
          position:absolute; inset:0;
          border-radius:inherit;
          border:1px solid rgba(251,191,36,.4);
          pointer-events:none;
        }

        .glass-panel {
          background: rgba(10, 15, 28, 0.6);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }
      `}</style>

      {/* ── Animated Canvas Background ── */}
      <AnimatedBackground />

      {/* ── Navbar Space (Best Practice) ── */}
      <nav className="fixed top-0 left-0 right-0 p-6 flex justify-between items-center z-10 pointer-events-none">
        <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md">
          <Zap className="w-4 h-4 text-yellow-400" />
        </div>
      </nav>

      {/* ── Static radial vignette ── */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 1 }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(circle at center, transparent 30%, rgba(3,7,18,0.95) 100%)'
        }} />
      </div>

      {/* ── Main Content ── */}
      <main className="relative flex flex-col items-center justify-center min-h-[100dvh] px-4 py-20" style={{ zIndex: 2 }}>

        {/* Badge */}
        <div className="flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/20 rounded-full px-5 py-2.5 mb-8 cursor-default transition-transform hover:scale-105 duration-300">
          <Zap className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
          <span className="text-yellow-400 font-bold text-xs tracking-[0.15em] uppercase" dir="rtl">
            عرض حصري لفترة محدودة
          </span>
          <Zap className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
        </div>

        {/* Card */}
        <div className="glass-panel rounded-[2rem] p-8 sm:p-12 max-w-[480px] w-full relative transition-all duration-300 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6)] motion-safe-glow-pulse motion-safe-slide-up">

          {/* Card inner subtle glow line */}
          <div className="absolute inset-0 rounded-[2rem] pointer-events-none overflow-hidden">
            <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-yellow-400/30 to-transparent" />
          </div>

          {/* Noon Logo */}
          <div className="flex justify-center mb-8">
            <div className="bg-[#FEE000] rounded-2xl p-4 w-20 h-20 flex items-center justify-center shadow-[0_0_30px_rgba(254,224,0,0.15)] motion-safe-float">
              <img
                src="https://f.nooncdn.com/s/app/com/noon/design-system/logos/noon-logo-ar.svg"
                alt="Noon Egypt Logo"
                className="w-14 h-auto"
                draggable="false"
                onError={(e) => { e.currentTarget.src = "https://f.nooncdn.com/s/app/com/noon/design-system/logos/noon-logo-en.svg"; }}
              />
            </div>
          </div>

          {/* Headline */}
          <div className="text-center mb-10 space-y-4" dir="rtl">
            <h1 className="text-3xl sm:text-[2.5rem] font-black leading-tight tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              <span className="text-transparent bg-clip-text bg-gradient-to-br from-white via-gray-200 to-gray-400">
                أقوى خصم من نون
              </span>
            </h1>
            <p className="text-gray-400 text-[15px] font-medium leading-relaxed max-w-[90%] mx-auto">
              استخدم الكود ده دلوقتي واشتري كل اللي محتاجه من <span className="text-yellow-400 font-bold">نون مصر</span> بأقل الأسعار الممكنة.
            </p>
          </div>

          {/* User Trust */}
          <div className="flex justify-center items-center gap-2 mb-8 bg-white/5 border border-white/5 rounded-full py-2 w-max mx-auto px-4">
            <div className="flex -space-x-2 mr-2">
              <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-[#0A0F1C]" />
              <div className="w-6 h-6 rounded-full bg-purple-500 border-2 border-[#0A0F1C]" />
              <div className="w-6 h-6 rounded-full bg-yellow-400 border-2 border-[#0A0F1C]" />
            </div>
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
              ))}
            </div>
            <span className="text-gray-300 text-[11px] font-semibold tracking-wide ml-1 pr-1 border-l border-white/10">مُجرّب ويعمل 100%</span>
          </div>

          {/* Coupon Box Container */}
          <div className="relative mb-8">
            <button
              id="copy-coupon-box"
              onClick={handleCopy}
              className="w-full relative bg-[#0A0F1C]/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex flex-col items-center gap-2 cursor-pointer transition-all duration-300 hover:border-yellow-400/50 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0F1C] group"
              aria-label={`Copy coupon code ${COUPON_CODE}`}
            >
              <div className="flex items-center gap-2 text-gray-400 text-xs font-semibold tracking-[0.1em] uppercase mb-1">
                <Tag className="w-3.5 h-3.5 text-yellow-400/80" />
                كود الخصم الحصري
              </div>
              <span className="text-6xl font-black tracking-[0.15em] text-white group-hover:text-yellow-400 transition-colors duration-300 motion-safe-shimmer shimmer-text" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {COUPON_CODE}
              </span>
              
              <div className={`absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1 transition-all duration-300 ${copied ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-2 pointer-events-none'}`}>
                <CheckCircle className="w-3 h-3" /> تم النسخ!
              </div>

              {/* Decorative dash line */}
              <div className="absolute inset-x-6 bottom-0 translate-y-1/2 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </button>
          </div>

          {/* Countdown timer */}
          <div className="mb-8">
            <CountdownTimer />
          </div>

          {/* Main CTA */}
          <button
            id="copy-coupon-btn"
            onClick={handleCopy}
            className="w-full bg-white text-black hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0F1C] font-black py-4 sm:py-5 px-6 rounded-2xl transition-all duration-300 cursor-pointer shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] flex items-center justify-center gap-3 text-base sm:text-lg group"
            aria-label="انسخ كود الخصم"
          >
            <Copy className="w-5 h-5 transition-transform duration-300 group-active:scale-90" />
            <span className="tracking-wide">انسخ الكود واشتري دلوقتي</span>
            <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1" />
          </button>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-4 sm:gap-6 mt-8 flex-wrap">
            {[
              { text: 'خصم فوري', icon: Zap },
              { text: 'مضمون 100%', icon: CheckCircle },
              { text: 'شغال بمصر', icon: Star }
            ].map((badge, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-gray-400 text-[11px] font-medium">
                <badge.icon className="w-3.5 h-3.5 text-gray-500" />
                {badge.text}
              </div>
            ))}
          </div>
        </div>

        <p className="text-gray-500 text-[11px] font-medium mt-10 text-center uppercase tracking-widest max-w-sm" dir="rtl">
          تطبق الشروط والأحكام الخاصة بمتجر نون مصر • السعر غير شامل الشحن
        </p>
      </main>

      {/* Footer */}
      <footer className="relative py-6 text-center border-t border-white/5" style={{ zIndex: 2 }}>
        <p className="text-gray-600 text-xs font-medium relative z-10">
          Copyright © {new Date().getFullYear()} <span className="text-gray-500 font-bold">DailyDiscounts</span>. All rights reserved.
        </p>
      </footer>

      {/* Modal */}
      {showModal && (
        <Modal couponCode={COUPON_CODE} onClose={() => setShowModal(false)} onShop={handleShop} />
      )}
    </div>
  );
}
