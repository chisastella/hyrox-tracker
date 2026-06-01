import { format, subDays } from 'date-fns';
import { USER_META, getStreakMessage } from '../constants.js';

function calcStreak(workouts) {
  if (!workouts.length) return 0;
  const days = new Set(workouts.map(w => w.date));
  const today = format(new Date(), 'yyyy-MM-dd');
  let cursor = new Date();
  if (!days.has(today)) cursor = subDays(cursor, 1);
  let n = 0;
  while (true) {
    const d = format(cursor, 'yyyy-MM-dd');
    if (!days.has(d)) break;
    n++;
    cursor = subDays(cursor, 1);
  }
  return n;
}

export function calculateStreak(workouts) { return calcStreak(workouts); }
export function calculateUserStreak(workouts, user) {
  return calcStreak(workouts.filter(w => w.user === user));
}

export default function StreakBanner({ workouts, names, avatars }) {
  const chisaStreak   = calculateUserStreak(workouts, 'chisa');
  const partnerStreak = calculateUserStreak(workouts, 'partner');
  const coupleStreak  = calcStreak(workouts); // any workout from either person counts

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <StoryCard user="chisa"   name={names.chisa}   streak={chisaStreak}   avatar={avatars?.chisa} />
        <StoryCard user="partner" name={names.partner} streak={partnerStreak} avatar={avatars?.partner} />
      </div>
      <CoupleStreakCard streak={coupleStreak} names={names} avatars={avatars} />
    </div>
  );
}

function CoupleStreakCard({ streak, names, avatars }) {
  return (
    <div className="relative overflow-hidden rounded-2xl px-5 py-4 bg-gray-900 border border-amber-500/30">
      {/* glow */}
      <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-40 h-20 rounded-full blur-2xl opacity-10 pointer-events-none bg-amber-400" />

      <div className="relative flex items-center justify-between gap-4">
        {/* left: avatars + label */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5">
            {/* two mini avatars stacked */}
            {['chisa', 'partner'].map((u, i) => {
              const av   = u === 'chisa' ? avatars?.chisa : avatars?.partner;
              const name = u === 'chisa' ? names.chisa    : names.partner;
              const color = u === 'chisa' ? '#f97316' : '#38bdf8';
              return (
                <div key={u}
                  className={`w-7 h-7 rounded-full overflow-hidden border-2 flex-shrink-0 flex items-center justify-center ${i === 1 ? '-ml-2' : ''}`}
                  style={{ borderColor: color, background: av ? 'transparent' : color + '33', zIndex: i === 0 ? 1 : 0 }}>
                  {av
                    ? <img src={av} alt={name} className="w-full h-full object-cover" />
                    : <span className="text-[10px] font-black" style={{ color }}>{name.charAt(0)}</span>
                  }
                </div>
              );
            })}
            <span className="text-xs font-semibold text-gray-300 ml-1">Couple Streak</span>
          </div>
          <div className="text-[11px] text-gray-500">
            {streak === 0 ? 'Log a workout to start!' : getStreakMessage(streak)}
          </div>
        </div>

        {/* right: big number */}
        <div className="flex items-end gap-1.5 flex-shrink-0">
          <span className="text-5xl font-black leading-none text-amber-400">{streak}</span>
          {streak > 0 && <span className="text-2xl leading-none pb-0.5">🔥</span>}
          <span className="text-xs text-gray-500 pb-1 ml-0.5">days</span>
        </div>
      </div>
    </div>
  );
}

function StoryCard({ user, name, streak, avatar }) {
  const meta = USER_META[user];

  return (
    <div className={`relative overflow-hidden rounded-2xl p-4 bg-gray-900 border ${meta.border}/30`}>
      {/* glow blob */}
      <div
        className="absolute -top-8 -right-8 w-28 h-28 rounded-full blur-2xl opacity-15 pointer-events-none"
        style={{ background: meta.color }}
      />

      <div className="relative flex flex-col gap-1">
        {/* name + avatar */}
        <div className="flex items-center gap-2 mb-1">
          <div className={`w-7 h-7 rounded-full overflow-hidden border ${meta.border}/50 flex items-center justify-center flex-shrink-0`}
            style={{ background: avatar ? 'transparent' : meta.color + '33' }}>
            {avatar
              ? <img src={avatar} alt={name} className="w-full h-full object-cover" />
              : <span className={`text-xs font-black ${meta.text}`}>{name.charAt(0)}</span>
            }
          </div>
          <span className="text-xs font-semibold text-gray-300 truncate">{name}'s Streak</span>
        </div>

        {/* big number + flame */}
        <div className="flex items-end gap-1.5">
          <span className={`text-5xl font-black leading-none ${meta.text}`}>
            {streak}
          </span>
          {streak > 0 && <span className="text-2xl leading-none pb-0.5">🔥</span>}
        </div>

        <div className="text-xs font-medium text-gray-400">
          {streak === 0 ? 'No streak yet' : streak === 1 ? 'day in a row!' : 'days in a row!'}
        </div>

        <div className="text-[11px] text-gray-500 leading-snug mt-1 min-h-[28px]">
          {getStreakMessage(streak)}
        </div>
      </div>
    </div>
  );
}
