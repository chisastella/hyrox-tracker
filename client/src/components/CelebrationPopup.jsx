import { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { WORKOUT_TYPES, USER_META, MOTIVATION_MESSAGES } from '../constants.js';

export default function CelebrationPopup({ workout, names, onClose }) {
  const messageRef = useRef(
    MOTIVATION_MESSAGES[Math.floor(Math.random() * MOTIVATION_MESSAGES.length)]
  );

  const wtype = WORKOUT_TYPES[workout.type] ?? { label: workout.type, emoji: '💪', points: 0, color: '#9ca3af' };
  const meta = USER_META[workout.user] ?? USER_META.chisa;
  const userName = names[workout.user] ?? workout.user;

  useEffect(() => {
    const colors = workout.user === 'chisa'
      ? ['#f97316', '#fb923c', '#ffffff', '#fbbf24']
      : ['#38bdf8', '#60a5fa', '#ffffff', '#a78bfa'];

    const fire = (particleRatio, opts) => {
      confetti({
        origin: { y: 0.6 },
        colors,
        ...opts,
        particleCount: Math.floor(200 * particleRatio),
      });
    };

    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });

    const timer = setTimeout(onClose, 5000);
    return () => {
      clearTimeout(timer);
      confetti.reset();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div
        className="relative max-w-sm w-full bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-6 text-center animate-bounce-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Glow ring */}
        <div
          className="absolute inset-0 rounded-2xl opacity-20 blur-xl"
          style={{ background: `radial-gradient(circle, ${meta.color}, transparent)` }}
        />

        <div className="relative">
          <div className="text-5xl mb-3">{wtype.emoji}</div>

          <div className={`text-3xl font-black mb-1 ${meta.text}`}>
            +{wtype.points} PTS!
          </div>

          <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
            {userName} · {wtype.label} · {workout.duration} min
          </div>

          <div className="bg-gray-800 rounded-xl px-4 py-3 mb-5">
            <p className="text-base font-semibold text-white leading-snug">
              "{messageRef.current}"
            </p>
          </div>

          <button
            onClick={onClose}
            className={`w-full py-3 rounded-xl font-black text-white bg-gradient-to-r ${meta.gradient} hover:scale-[1.02] active:scale-95 transition-all`}
          >
            LET'S GO! 🚀
          </button>
        </div>
      </div>
    </div>
  );
}
