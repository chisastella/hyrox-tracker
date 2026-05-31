import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { USER_META } from '../constants.js';

const MONTHLY_KM_GOAL = 40;

function UserBar({ user, name, avatar, value, max, unit, meta }) {
  const pct = Math.min(100, max > 0 ? Math.round((value / max) * 100) : 0);
  const done = value >= max;

  return (
    <div className="flex items-center gap-2.5">
      <div className={`w-7 h-7 rounded-full overflow-hidden border ${meta.border}/50 flex-shrink-0 flex items-center justify-center`}
        style={{ background: avatar ? 'transparent' : meta.color + '33' }}>
        {avatar
          ? <img src={avatar} alt={name} className="w-full h-full object-cover" />
          : <span className={`text-xs font-black ${meta.text}`}>{name.charAt(0).toUpperCase()}</span>
        }
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold text-gray-300 truncate">{name}</span>
          <span className={`text-xs font-bold tabular-nums ${done ? 'text-emerald-400' : meta.text}`}>
            {value}{unit}
            {done && <span className="ml-1">✓</span>}
          </span>
        </div>
        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, backgroundColor: done ? '#34d399' : meta.color }} />
        </div>
      </div>
    </div>
  );
}

export default function Challenges({ workouts, names, avatars }) {
  const now = new Date();

  // Weekly Running
  const weekStart = format(startOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd');
  const weekEnd   = format(endOfWeek(now,   { weekStartsOn: 1 }), 'yyyy-MM-dd');
  const weekRuns = workouts.filter(w => w.type === 'RUNNING' && w.date >= weekStart && w.date <= weekEnd);
  const chisaWeekRuns   = weekRuns.filter(w => w.user === 'chisa').length;
  const partnerWeekRuns = weekRuns.filter(w => w.user === 'partner').length;
  const weekGoal = 3;

  // Monthly 40km Running
  const monthStart = format(startOfMonth(now), 'yyyy-MM-dd');
  const monthEnd   = format(endOfMonth(now),   'yyyy-MM-dd');
  const monthRuns = workouts.filter(w => w.type === 'RUNNING' && w.date >= monthStart && w.date <= monthEnd);
  const chisaMonthKm   = monthRuns.filter(w => w.user === 'chisa').reduce((a, w) => a + (w.distance_km ?? 0), 0);
  const partnerMonthKm = monthRuns.filter(w => w.user === 'partner').reduce((a, w) => a + (w.distance_km ?? 0), 0);

  const chisaMeta   = USER_META.chisa;
  const partnerMeta = USER_META.partner;

  return (
    <div className="overflow-hidden">
      <div className="px-4 pt-4 pb-1 flex items-center gap-2">
        <span className="text-base">🎯</span>
        <span className="text-sm font-bold text-white uppercase tracking-wider">Challenges</span>
      </div>

      <div className="p-4 flex flex-col gap-5">
        {/* Weekly Running */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-xs font-bold text-white">毎週ランニング</div>
              <div className="text-[11px] text-gray-500">Weekly Running · goal: {weekGoal} runs</div>
            </div>
            <span className="text-lg">🏃</span>
          </div>
          <div className="flex flex-col gap-2">
            <UserBar user="chisa"   name={names.chisa}   avatar={avatars?.chisa}   value={chisaWeekRuns}   max={weekGoal} unit=" runs" meta={chisaMeta} />
            <UserBar user="partner" name={names.partner} avatar={avatars?.partner} value={partnerWeekRuns} max={weekGoal} unit=" runs" meta={partnerMeta} />
          </div>
        </div>

        <div className="h-px bg-gray-800" />

        {/* Monthly 40km */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-xs font-bold text-white">月40kmランニング</div>
              <div className="text-[11px] text-gray-500">Monthly 40km Running · {format(now, 'MMMM yyyy')}</div>
            </div>
            <span className="text-lg">📍</span>
          </div>
          <div className="flex flex-col gap-2">
            <UserBar user="chisa"   name={names.chisa}   avatar={avatars?.chisa}   value={Math.round(chisaMonthKm * 10) / 10}   max={MONTHLY_KM_GOAL} unit="km" meta={chisaMeta} />
            <UserBar user="partner" name={names.partner} avatar={avatars?.partner} value={Math.round(partnerMonthKm * 10) / 10} max={MONTHLY_KM_GOAL} unit="km" meta={partnerMeta} />
          </div>
        </div>
      </div>
    </div>
  );
}
