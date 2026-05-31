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

  return (
    <div className="grid grid-cols-2 gap-3">
      <StoryCard user="chisa"   name={names.chisa}   streak={chisaStreak}   avatar={avatars?.chisa} />
      <StoryCard user="partner" name={names.partner} streak={partnerStreak} avatar={avatars?.partner} />
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
