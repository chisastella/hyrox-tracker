import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  getDay, isToday, addMonths, subMonths,
} from 'date-fns';
import { HYROX_DATE, WORKOUT_TYPES, USER_META } from '../constants.js';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function Calendar({ workouts, currentMonth, onMonthChange, onDayClick, selectedDate }) {
  const monthStart  = startOfMonth(currentMonth);
  const monthEnd    = endOfMonth(currentMonth);
  const days        = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPad    = getDay(monthStart);
  const hyroxStr    = format(HYROX_DATE, 'yyyy-MM-dd');

  // Group workouts by date
  const byDate = {};
  workouts.forEach(w => { (byDate[w.date] ??= []).push(w); });

  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4 sm:p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={() => onMonthChange(subMonths(currentMonth, 1))}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-800 hover:bg-gray-700 transition-colors text-gray-300 hover:text-white text-lg font-bold"
        >‹</button>
        <h2 className="text-base font-bold text-white">{format(currentMonth, 'MMMM yyyy')}</h2>
        <button
          onClick={() => onMonthChange(addMonths(currentMonth, 1))}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-800 hover:bg-gray-700 transition-colors text-gray-300 hover:text-white text-lg font-bold"
        >›</button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map(d => (
          <div key={d} className="text-center text-[10px] font-semibold text-gray-600 uppercase py-1 tracking-wider">
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {Array(startPad).fill(null).map((_, i) => <div key={`p${i}`} />)}

        {days.map(day => {
          const dateStr     = format(day, 'yyyy-MM-dd');
          const dayWorkouts = byDate[dateStr] ?? [];
          const isSelected  = selectedDate === dateStr;
          const isTodayDay  = isToday(day);
          const isHyrox     = dateStr === hyroxStr;

          // Pick up to 2 representative workouts to show emojis
          // prefer one per user if possible
          const chisaW   = dayWorkouts.find(w => w.user === 'chisa');
          const partnerW = dayWorkouts.find(w => w.user === 'partner');
          const shown    = [chisaW, partnerW].filter(Boolean);
          const extra    = dayWorkouts.length - shown.length;

          return (
            <button
              key={dateStr}
              onClick={() => onDayClick(dateStr)}
              className={[
                'relative flex flex-col items-center pt-1.5 pb-2 rounded-xl min-h-[62px] transition-all duration-150 group',
                isSelected  ? 'bg-white/10 ring-2 ring-white/30'     : 'hover:bg-gray-800',
                isTodayDay && !isSelected ? 'ring-2 ring-orange-500/50' : '',
                isHyrox    ? 'ring-2 ring-amber-400/60 bg-amber-500/10' : '',
              ].join(' ')}
            >
              {/* Day number */}
              <span className={[
                'text-sm font-semibold leading-none',
                isTodayDay ? 'text-orange-400' : isHyrox ? 'text-amber-400' : 'text-white',
              ].join(' ')}>
                {format(day, 'd')}
              </span>

              {/* HYROX label */}
              {isHyrox && (
                <span className="text-[8px] font-bold text-amber-400 leading-none mt-0.5 tracking-wide">
                  HYROX
                </span>
              )}

              {/* Workout emojis */}
              {shown.length > 0 ? (
                <div className="flex items-center gap-0.5 mt-1 flex-wrap justify-center">
                  {shown.map((w, i) => {
                    const wt   = WORKOUT_TYPES[w.type];
                    const meta = USER_META[w.user];
                    return (
                      <span
                        key={i}
                        className="text-base leading-none"
                        style={{ filter: `drop-shadow(0 0 4px ${meta.color}88)` }}
                        title={wt?.label}
                      >
                        {wt?.emoji ?? '💪'}
                      </span>
                    );
                  })}
                  {extra > 0 && (
                    <span className="text-[9px] text-gray-500 leading-none">+{extra}</span>
                  )}
                </div>
              ) : (
                <div className="mt-1 h-[18px]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-4 pt-3 border-t border-gray-800">
        <LegendDot color="bg-orange-400" label="Chisa" />
        <LegendDot color="bg-sky-400"    label="Partner" />
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded ring-2 ring-amber-400/60 bg-amber-500/10" />
          <span className="text-xs text-gray-500">HYROX day</span>
        </div>
      </div>
    </div>
  );
}

function LegendDot({ color, label }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-2 h-2 rounded-full ${color}`} />
      <span className="text-xs text-gray-500">{label}</span>
    </div>
  );
}
