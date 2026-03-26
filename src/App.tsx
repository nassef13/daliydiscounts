import React, { useState, useEffect, useRef } from 'react';
import { Copy, CheckCircle, ShoppingBag, Clock, Zap, Tag, X, ArrowRight, Star } from 'lucide-react';

const COUPON_CODE = "M56";
const NOON_URL = "https://www.noon.com/egypt-en/";

/* ─── Animated Canvas Background ─── */
function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let W = window.innerWidth;
    let H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);

    /* Particles */
    const NUM_PARTICLES = 80;
    interface Particle {
      x: number; y: number; r: number;
      vx: number; vy: number;
      alpha: number; color: string;
    }
    const colors = ['#facc15', '#f97316', '#fb923c', '#fbbf24', '#ffffff'];
    const particles: Particle[] = Array.from({ length: NUM_PARTICLES }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 2 + 0.5,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      alpha: Math.random() * 0.6 + 0.2,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));

    /* Shooting stars */
    interface Meteor {
      x: number; y: number;
      len: number; speed: number;
      alpha: number; life: number; maxLife: number;
    }
    const meteors: Meteor[] = [];
    const spawnMeteor = () => {
      meteors.push({
        x: Math.random() * W,
        y: Math.random() * H * 0.5,
        len: Math.random() * 120 + 60,
        speed: Math.random() * 6 + 4,
        alpha: 1,
        life: 0,
        maxLife: Math.random() * 40 + 30,
      });
    };
    let meteorTimer = 0;

    /* Floating orbs */
    interface Orb {
      x: number; y: number;
      r: number; color: string;
      angle: number; speed: number; radius: number;
      cx: number; cy: number;
    }
    const orbs: Orb[] = [
      { cx: W * 0.25, cy: H * 0.3, r: 180, color: '#facc15', angle: 0, speed: 0.003, radius: 60, x: 0, y: 0 },
      { cx: W * 0.75, cy: H * 0.6, r: 220, color: '#f97316', angle: Math.PI, speed: 0.002, radius: 80, x: 0, y: 0 },
      { cx: W * 0.5, cy: H * 0.8, r: 160, color: '#ef4444', angle: Math.PI / 2, speed: 0.004, radius: 50, x: 0, y: 0 },
    ];

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      /* Draw floating orbs */
      orbs.forEach(orb => {
        orb.angle += orb.speed;
        orb.x = orb.cx + Math.cos(orb.angle) * orb.radius;
        orb.y = orb.cy + Math.sin(orb.angle) * orb.radius;

        const grad = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.r);
        grad.addColorStop(0, orb.color + '18');
        grad.addColorStop(0.5, orb.color + '08');
        grad.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.r, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      });

      /* Draw & update particles */
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 6;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.restore();
      });

      /* Connect nearby particles */
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.save();
            ctx.globalAlpha = (1 - dist / 100) * 0.12;
            ctx.strokeStyle = '#facc1580';
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
            ctx.restore();
          }
        }
      }

      /* Shooting stars */
      meteorTimer++;
      if (meteorTimer > 90) { spawnMeteor(); meteorTimer = 0; }

      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i];
        m.life++;
        m.x += m.speed;
        m.y += m.speed * 0.4;
        const fade = 1 - m.life / m.maxLife;

        ctx.save();
        ctx.globalAlpha = fade * 0.7;
        const grad = ctx.createLinearGradient(m.x, m.y, m.x - m.len, m.y - m.len * 0.4);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.3, '#facc15');
        grad.addColorStop(1, 'transparent');
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(m.x - m.len, m.y - m.len * 0.4);
        ctx.stroke();
        ctx.restore();

        if (m.life >= m.maxLife) meteors.splice(i, 1);
      }

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
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
    <div className="flex items-center justify-center gap-3" dir="ltr">
      {[
        { value: time.hours, label: 'HRS' },
        { value: time.minutes, label: 'MIN' },
        { value: time.seconds, label: 'SEC' },
      ].map(({ value, label }, i) => (
        <React.Fragment key={label}>
          <div className="flex flex-col items-center">
            <div className="bg-black/40 border border-white/10 rounded-xl w-16 h-16 flex items-center justify-center shadow-inner">
              <span className="text-3xl font-black text-white tabular-nums tracking-tight">{pad(value)}</span>
            </div>
            <span className="text-[10px] font-bold text-yellow-400/80 mt-1 tracking-widest">{label}</span>
          </div>
          {i < 2 && <span className="text-2xl font-black text-yellow-400 mb-4">:</span>}
        </React.Fragment>
      ))}
    </div>
  );
}

/* ─── Modal ─── */
function Modal({ couponCode, onClose, onShop }: { couponCode: string; onClose: () => void; onShop: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-white/10 rounded-3xl shadow-2xl max-w-sm w-full p-8 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-yellow-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors duration-200 cursor-pointer" aria-label="Close">
          <X className="w-5 h-5" />
        </button>

        <div className="relative text-center space-y-6">
          <div className="w-16 h-16 bg-green-500/20 border border-green-500/30 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-white mb-2">تم النسخ بنجاح!</h3>
            <p className="text-gray-400 text-sm leading-relaxed" dir="rtl">
              كود الخصم <strong className="text-yellow-400">{couponCode}</strong> اتنسخ. روح نون دلوقتي واستخدمه عند الدفع!
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <p className="text-xs text-gray-500 mb-1">كود الخصم</p>
            <p className="text-3xl font-black text-yellow-400 tracking-widest">{couponCode}</p>
          </div>
          <div className="flex flex-col gap-3">
            <button
              onClick={onShop}
              className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 text-black font-black py-4 px-6 rounded-2xl transition-all duration-200 cursor-pointer shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 text-lg"
            >
              <ShoppingBag className="w-5 h-5" />
              اشتري من نون دلوقتي
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-200 cursor-pointer"
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
    });
  };

  const handleShop = () => {
    setShowModal(false);
    window.open(NOON_URL, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-x-hidden relative" style={{ fontFamily: "'Inter', sans-serif" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@700;800&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; padding: 0; }

        @keyframes float    { 0%,100%{ transform:translateY(0) }   50%{ transform:translateY(-12px) } }
        @keyframes shimmer  { 0%{ background-position:-200% center } 100%{ background-position:200% center } }
        @keyframes pulse-ring { 0%{ transform:scale(1); opacity:.8 } 100%{ transform:scale(1.35); opacity:0 } }
        @keyframes glow-pulse { 0%,100%{ box-shadow:0 0 20px #facc1530 } 50%{ box-shadow:0 0 50px #facc1560, 0 0 80px #f9731620 } }
        @keyframes slide-up { from{ opacity:0; transform:translateY(30px) } to{ opacity:1; transform:translateY(0) } }
        @keyframes badge-bounce { 0%,100%{ transform:scale(1) } 50%{ transform:scale(1.05) } }

        .float        { animation: float 4s ease-in-out infinite; }
        .badge-bounce { animation: badge-bounce 2.5s ease-in-out infinite; }
        .glow-pulse   { animation: glow-pulse 3s ease-in-out infinite; }
        .slide-up     { animation: slide-up .6s ease-out both; }

        .shimmer-text {
          background: linear-gradient(90deg, #facc15, #f97316, #facc15, #f97316);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 3s linear infinite;
        }
        .pulse-ring { position: relative; }
        .pulse-ring::after {
          content:'';
          position:absolute; inset:-6px;
          border-radius:inherit;
          border:2px solid rgba(251,191,36,.45);
          animation: pulse-ring 2s ease-out infinite;
          pointer-events:none;
        }
        .glass {
          background: rgba(255,255,255,.04);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,.08);
        }
        .card-hover {
          transition: transform .3s ease, box-shadow .3s ease;
        }
        .card-hover:hover {
          transform: translateY(-4px);
          box-shadow: 0 30px 60px -10px rgba(0,0,0,.5);
        }
      `}</style>

      {/* ── Animated Canvas Background ── */}
      <AnimatedBackground />

      {/* ── Static radial vignette ── */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 1 }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(3,7,18,.85) 100%)'
        }} />
      </div>

      {/* ── Main Content ── */}
      <main className="relative flex flex-col items-center justify-center min-h-screen px-4 py-16" style={{ zIndex: 2 }}>

        {/* Badge */}
        <div className="flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/25 rounded-full px-5 py-2 mb-8 badge-bounce cursor-default" style={{ animationDelay: '0s' }}>
          <Zap className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
          <span className="text-yellow-400 font-bold text-xs tracking-widest uppercase">عرض حصري لفترة محدودة</span>
          <Zap className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
        </div>

        {/* Card */}
        <div className="glass rounded-3xl p-8 sm:p-12 max-w-lg w-full relative card-hover glow-pulse slide-up">

          {/* Card inner glow */}
          <div className="absolute inset-0 rounded-3xl pointer-events-none overflow-hidden">
            <div style={{
              position: 'absolute', top: '-50%', left: '-50%',
              width: '200%', height: '200%',
              background: 'conic-gradient(from 180deg at 50% 50%, transparent 0deg, #facc1508 60deg, transparent 120deg)',
              animation: 'shimmer 8s linear infinite',
            }} />
          </div>

          {/* Noon Logo */}
          <div className="flex justify-center mb-8">
            <div className="bg-[#FEE000] rounded-2xl p-4 w-20 h-20 flex items-center justify-center shadow-lg shadow-yellow-400/20 float">
              <img
                src="https://f.nooncdn.com/s/app/com/noon/design-system/logos/noon-logo-ar.svg"
                alt="Noon Logo"
                className="w-14 h-auto"
                onError={(e) => { e.currentTarget.src = "https://f.nooncdn.com/s/app/com/noon/design-system/logos/noon-logo-en.svg"; }}
              />
            </div>
          </div>

          {/* Headline */}
          <div className="text-center mb-8 space-y-3" dir="rtl">
            <h1 className="text-3xl sm:text-4xl font-black leading-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              <span className="shimmer-text">وفّر أكتر مع كود الخصم</span>
            </h1>
            <p className="text-gray-400 text-base font-medium">
              استخدم الكود دلوقتي واشتري من <span className="text-yellow-400 font-bold">نون</span> بسعر أقل
            </p>
          </div>

          {/* Stars */}
          <div className="flex justify-center gap-1 mb-6">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" style={{ animationDelay: `${i * 0.1}s` }} />
            ))}
            <span className="text-gray-500 text-xs font-medium ml-2 self-center">+١٢,٠٠٠ مستخدم</span>
          </div>

          {/* Coupon Box */}
          <div className="relative mb-6">
            <div
              className="relative bg-gradient-to-r from-yellow-400/10 to-orange-500/10 border-2 border-dashed border-yellow-400/40 rounded-2xl p-6 flex flex-col items-center gap-2 pulse-ring cursor-pointer hover:border-yellow-400/70 transition-colors duration-300"
              onClick={handleCopy}
            >
              <div className="flex items-center gap-2 text-gray-400 text-xs font-semibold tracking-wider uppercase mb-1">
                <Tag className="w-3.5 h-3.5" />
                كود الخصم
              </div>
              <span className="text-5xl sm:text-6xl font-black tracking-[0.2em] text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {COUPON_CODE}
              </span>
              {copied && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> تم النسخ!
                </span>
              )}
            </div>
          </div>

          {/* Countdown */}
          <div className="glass rounded-2xl p-4 mb-6">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-red-400" />
              <span className="text-red-400 font-bold text-xs tracking-wider uppercase">الوقت المتبقي للعرض</span>
            </div>
            <CountdownTimer />
          </div>

          {/* CTA */}
          <button
            id="copy-coupon-btn"
            onClick={handleCopy}
            className="relative w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 text-black font-black py-5 px-8 rounded-2xl transition-all duration-200 cursor-pointer shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-3 text-lg overflow-hidden group"
            aria-label="انسخ كود الخصم"
          >
            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-200" />
            <Copy className="w-5 h-5 relative" />
            <span className="relative">انسخ الكود واشتري دلوقتي</span>
            <ArrowRight className="w-5 h-5 relative group-hover:translate-x-1 transition-transform duration-200" />
          </button>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-4 mt-6 flex-wrap">
            {['خصم فوري', 'آمن 100%', 'سهل الاستخدام'].map((badge) => (
              <div key={badge} className="flex items-center gap-1.5 text-gray-500 text-xs font-medium">
                <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                {badge}
              </div>
            ))}
          </div>
        </div>

        <p className="text-gray-600 text-xs font-medium mt-8 text-center" dir="rtl">
          الكود صالح على نون مصر فقط • العرض لفترة محدودة
        </p>
      </main>

      {/* Footer */}
      <footer className="relative py-6 text-center border-t border-white/5" style={{ zIndex: 2 }}>
        <p className="text-gray-600 text-xs font-medium">
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
