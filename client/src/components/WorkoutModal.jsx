import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { WORKOUT_TYPES, USER_WORKOUT_TYPES, USER_META, DISTANCE_TYPES, DISTANCE_PTS_PER_KM } from '../constants.js';

export default function WorkoutModal({ date, names, onClose, onSave }) {
  const [user,       setUser]       = useState('chisa');
  const [type,       setType]       = useState(USER_WORKOUT_TYPES.chisa[0]);
  const [inputMode,  setInputMode]  = useState('time');   // 'time' | 'distance'
  const [duration,   setDuration]   = useState(60);
  const [distanceKm, setDistanceKm] = useState(5);
  const [notes,      setNotes]      = useState('');
  const [saving,     setSaving]     = useState(false);

  const availableTypes = USER_WORKOUT_TYPES[user];
  const selectedType   = WORKOUT_TYPES[type];
  const meta           = USER_META[user];
  const isDistanceType = DISTANCE_TYPES.includes(type);

  const handleUserChange = (u) => {
    setUser(u);
    const types = USER_WORKOUT_TYPES[u];
    if (!types.includes(type)) setType(types[0]);
  };

  const handleTypeChange = (t) => {
    setType(t);
    if (!DISTANCE_TYPES.includes(t)) setInputMode('time');
  };

  const computePoints = () => {
    if (isDistanceType && inputMode === 'distance') {
      const ptsPerKm = DISTANCE_PTS_PER_KM[type] ?? 2;
      return Math.max(selectedType.points, Math.round(Number(distanceKm) * ptsPerKm));
    }
    return selectedType.points;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const pts = computePoints();
    const estimatedDuration = inputMode === 'distance'
      ? Math.round(Number(distanceKm) * (type === 'RUNNING' ? 6 : 12))
      : Number(duration);
    await onSave({
      user, date, type,
      duration: estimatedDuration,
      notes,
      points: pts,
      ...(isDistanceType && inputMode === 'distance' ? { distance_km: Number(distanceKm) } : {}),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full sm:max-w-md bg-gray-900 border border-gray-700 rounded-t-2xl sm:rounded-2xl shadow-2xl p-5 animate-bounce-in max-h-[92vh] overflow-y-auto scrollbar-none">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-white">Log Workout</h2>
            <p className="text-xs text-gray-400 mt-0.5">{format(parseISO(date), 'EEEE, MMMM d')}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
          >✕</button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Who */}
          <div>
            <Label>Who worked out?</Label>
            <div className="flex gap-2">
              {['chisa', 'partner'].map(u => {
                const m = USER_META[u];
                return (
                  <button key={u} type="button" onClick={() => handleUserChange(u)}
                    className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                      user === u ? `${m.bg} text-white shadow-lg` : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                    }`}>
                    {names[u]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Type */}
          <div>
            <Label>Workout Type</Label>
            <div className="grid grid-cols-2 gap-2">
              {availableTypes.map(t => {
                const wt = WORKOUT_TYPES[t];
                const active = type === t;
                return (
                  <button key={t} type="button" onClick={() => handleTypeChange(t)}
                    className={`flex items-center gap-2 p-3 rounded-xl text-sm font-medium transition-all border text-left ${
                      active ? 'text-white' : 'border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white bg-gray-800'
                    }`}
                    style={active ? { borderColor: wt.color, backgroundColor: wt.color + '22' } : {}}>
                    <span className="text-xl">{wt.emoji}</span>
                    <div>
                      <div className="font-semibold leading-tight" style={active ? { color: wt.color } : {}}>
                        {wt.label}
                      </div>
                      <div className="text-[11px] opacity-60">+{wt.points} pts</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time / Distance toggle — only for Running & Walking */}
          {isDistanceType && (
            <div>
              <Label>Input Mode</Label>
              <div className="flex gap-2">
                {[['time', '⏱ Time'], ['distance', '📍 Distance (km)']].map(([val, label]) => (
                  <button key={val} type="button" onClick={() => setInputMode(val)}
                    className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
                      inputMode === val
                        ? 'bg-gray-700 text-white ring-1 ring-gray-500'
                        : 'bg-gray-800 text-gray-500 hover:bg-gray-700 hover:text-gray-300'
                    }`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Duration OR Distance slider */}
          {inputMode === 'time' ? (
            <div>
              <Label>Duration — <span className="text-white">{duration} min</span></Label>
              <input type="range" min={10} max={180} step={5} value={duration}
                onChange={e => setDuration(e.target.value)}
                className="w-full accent-orange-500 cursor-pointer" />
              <div className="flex justify-between text-xs text-gray-600 mt-1">
                <span>10 min</span><span>3 hrs</span>
              </div>
            </div>
          ) : (
            <div>
              <Label>
                Distance — <span className="text-white">{distanceKm} km</span>
                <span className="text-gray-600 font-normal ml-2">
                  (+{computePoints()} pts)
                </span>
              </Label>
              <input type="range" min={0.5} max={42} step={0.5} value={distanceKm}
                onChange={e => setDistanceKm(e.target.value)}
                className="w-full accent-orange-500 cursor-pointer" />
              <div className="flex justify-between text-xs text-gray-600 mt-1">
                <span>0.5 km</span><span>42 km</span>
              </div>
              {/* or type it directly */}
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs text-gray-500">Or type:</span>
                <input
                  type="number" min={0.5} max={200} step={0.5}
                  value={distanceKm}
                  onChange={e => setDistanceKm(Math.max(0.5, Number(e.target.value)))}
                  className="w-20 bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 text-sm text-white text-center focus:outline-none focus:border-gray-500"
                />
                <span className="text-xs text-gray-500">km</span>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <Label>Notes (optional)</Label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="How'd it go? PR? Tough day?"
              rows={2}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gray-500 resize-none" />
          </div>

          {/* Submit */}
          <button type="submit" disabled={saving}
            className={`w-full py-3.5 rounded-xl font-black text-base text-white transition-all bg-gradient-to-r ${meta.gradient} shadow-lg ${
              saving ? 'opacity-50' : 'hover:scale-[1.02] active:scale-95'
            }`}>
            {saving ? 'Saving...' : `Log It! 🔥 +${computePoints()} pts`}
          </button>
        </form>
      </div>
    </div>
  );
}

function Label({ children }) {
  return (
    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
      {children}
    </label>
  );
}
