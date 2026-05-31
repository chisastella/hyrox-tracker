import { useState } from 'react';
import {
  format, startOfWeek, endOfWeek, startOfMonth, endOfMonth,
  subMonths, subWeeks,
} from 'date-fns';
import { USER_META, LEVELS, getLevel, getLevelProgress } from '../constants.js';

function filterWorkouts(workouts, tab) {
  const now = new Date();
  if (tab === 'weekly') {
    const s = format(startOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd');
    const e = format(endOfWeek(now,   { weekStartsOn: 1 }), 'yyyy-MM-dd');
    return workouts.filter(w => w.date >= s && w.date <= e);
  }
  if (tab === 'monthly') {
    const s = format(startOfMonth(now), 'yyyy-MM-dd');
    const e = format(endOfMonth(now),   'yyyy-MM-dd');
    return workouts.filter(w => w.date >= s && w.date <= e);
  }
  return workouts;
}

function prevPeriodPts(workouts, tab) {
  const now = new Date();
  if (tab === 'weekly') {
    const prev = subWeeks(now, 1);
    const s = format(startOfWeek(prev, { weekStartsOn: 1 }), 'yyyy-MM-dd');
    const e = format(endOfWeek(prev,   { weekStartsOn: 1 }), 'yyyy-MM-dd');
    return workouts.filter(w => w.date >= s && w.date <= e).reduce((a, w) => a + w.points, 0);
  }
  if (tab === 'monthly') {
    const prev = subMonths(now, 1);
    const s = format(startOfMonth(prev), 'yyyy-MM-dd');
    const e = format(endOfMonth(prev),   'yyyy-MM-dd');
    return workouts.filter(w => w.date >= s && w.date <= e).reduce((a, w) => a + w.points, 0);
  }
  return 0;
}

const sum = (ws, user) => ws.filter(w => w.user === user).reduce((a, w) => a + w.points, 0);

export default function ScoreBoard({ workouts, names, avatars }) {
  const [tab, setTab] = useState('monthly');

  const filtered    = filterWorkouts(workouts, tab);
  const chisaAll    = sum(workouts, 'chisa');
  const partnerAll  = sum(workouts, 'partner');
  const chisaPts    = sum(filtered,  'chisa');
  const partnerPts  = sum(filtered,  'partner');
  const combined    = chisaPts + partnerPts;

  const prev        = prevPeriodPts(workouts, tab);
  const changePct   = prev > 0 ? Math.round((combined / prev - 1) * 100) : null;
  const periodLabel = tab === 'monthly' ? format(new Date(), 'MMMM yyyy') : 'This Week';

  return (
    <div className="overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-gray-800">
        {[['weekly', 'Weekly'], ['monthly', 'Monthly']].map(([val, label]) => (
          <button key={val} onClick={() => setTab(val)}
            className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
              tab === val
                ? 'text-white border-orange-500 bg-orange-500/5'
                : 'text-gray-500 border-transparent hover:text-gray-300'
            }`}>
            {label}
          </button>
        ))}
      </div>

      <div className="p-4 sm:p-5">
        <div className="text-xs font-medium text-gray-500 mb-4">{periodLabel}</div>

        <div className="flex flex-col gap-4 mb-5">
          <UserRow user="chisa"   name={names.chisa}   score={chisaPts}   allTimePts={chisaAll}   avatar={avatars?.chisa} />
          <UserRow user="partner" name={names.partner} score={partnerPts} allTimePts={partnerAll} avatar={avatars?.partner} />
        </div>

        <div className="h-px bg-gray-800 mb-4" />

        <div>
          <div className="text-[11px] text-gray-500 uppercase tracking-wider mb-0.5">Couple Score</div>
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-2xl font-black text-white">{combined.toLocaleString()}</span>
            <span className="text-sm text-gray-400">pts</span>
            {changePct !== null && (
              <span className={`text-xs font-bold ${changePct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {changePct >= 0 ? '+' : ''}{changePct}%
                <span className="text-gray-600 font-normal ml-1">vs last {tab === 'monthly' ? 'month' : 'week'}</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function UserRow({ user, name, score, allTimePts, avatar }) {
  const meta     = USER_META[user];
  const level    = getLevel(allTimePts);
  const progress = getLevelProgress(allTimePts);
  const nextIdx  = LEVELS.findIndex(l => l.level === level.level) - 1;
  const nextPts  = nextIdx >= 0 ? LEVELS[nextIdx].minPts : null;

  return (
    <div className="flex items-center gap-3">
      {/* Avatar */}
      <div className={`w-11 h-11 rounded-full overflow-hidden border-2 ${meta.border}/60 flex-shrink-0 flex items-center justify-center`}
        style={{ background: avatar ? 'transparent' : meta.color + '33' }}>
        {avatar
          ? <img src={avatar} alt={name} className="w-full h-full object-cover" />
          : <span className={`text-lg font-black ${meta.text}`}>{name.charAt(0).toUpperCase()}</span>
        }
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-sm font-semibold text-white truncate">{name}</span>
          <span className={`text-base font-black ${meta.text} tabular-nums`}>
            {score.toLocaleString()} <span className="text-xs font-medium text-gray-500">pts</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${progress}%`, backgroundColor: level.color }} />
          </div>
          <span className="text-[11px] text-gray-500 whitespace-nowrap flex-shrink-0">
            {level.emoji} Lv.{level.level} {level.name}
            {nextPts && <span className="text-gray-600"> · {nextPts - allTimePts}pt to next</span>}
          </span>
        </div>
      </div>
    </div>
  );
}
