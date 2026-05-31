import { format, parseISO, isToday } from 'date-fns';
import { WORKOUT_TYPES, USER_META } from '../constants.js';

export default function DayWorkouts({ date, workouts, names, onAdd, onDelete }) {
  const dayWorkouts = workouts.filter(w => w.date === date);
  const dateObj     = parseISO(date);
  const todayStr    = isToday(dateObj) ? ' · Today' : '';

  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4 sm:p-5 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-white">
            {format(dateObj, 'EEEE, MMMM d')}{todayStr}
          </h3>
          {dayWorkouts.length === 0 && (
            <p className="text-xs text-gray-500 mt-0.5">No workouts logged yet</p>
          )}
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white text-sm font-bold rounded-xl transition-colors shadow-lg shadow-orange-500/20"
        >
          <span className="text-base leading-none">+</span> Log Workout
        </button>
      </div>

      {dayWorkouts.length > 0 && (
        <div className="flex flex-col gap-2">
          {dayWorkouts.map(w => {
            const wtype = WORKOUT_TYPES[w.type] ?? { label: w.type, emoji: '💪', color: '#9ca3af' };
            const displayLabel = (w.type === 'OTHER' && w.custom_label) ? w.custom_label : wtype.label;
            const meta  = USER_META[w.user] ?? USER_META.chisa;
            const uName = names[w.user] ?? w.user;

            return (
              <div key={w.id}
                className="flex items-center gap-3 p-3 bg-gray-800/60 rounded-xl group border border-gray-800/50">
                {/* Emoji icon */}
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ backgroundColor: wtype.color + '1a', border: `1px solid ${wtype.color}33` }}>
                  {wtype.emoji}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-white">{displayLabel}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${meta.bgLight} ${meta.text}`}>
                      {uName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400 flex-wrap">
                    {/* Distance or duration */}
                    {w.distance_km
                      ? <span>{w.distance_km} km</span>
                      : <span>{w.duration} min</span>
                    }
                    <span className="text-gray-700">·</span>
                    <span className="font-bold" style={{ color: wtype.color }}>+{w.points} pts</span>
                    {w.notes && (
                      <>
                        <span className="text-gray-700">·</span>
                        <span className="truncate text-gray-500 italic">{w.notes}</span>
                      </>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => onDelete(w.id)}
                  className="opacity-0 group-hover:opacity-100 w-7 h-7 flex items-center justify-center rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-400 transition-all text-xs flex-shrink-0"
                  title="Delete workout"
                >✕</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
