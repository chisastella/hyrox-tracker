import { useState, useEffect, useCallback, useRef } from 'react';
import { format } from 'date-fns';
import Calendar from './components/Calendar.jsx';
import DayWorkouts from './components/DayWorkouts.jsx';
import WorkoutModal from './components/WorkoutModal.jsx';
import CelebrationPopup from './components/CelebrationPopup.jsx';
import StreakBanner from './components/StreakBanner.jsx';
import ScoreBoard from './components/ScoreBoard.jsx';
import CountdownTimer from './components/CountdownTimer.jsx';
import SettingsModal from './components/SettingsModal.jsx';
import Challenges from './components/Challenges.jsx';
import { WORKOUT_TYPES } from './constants.js';
const API = '/api';

async function apiFetch(path, opts = {}) {
  const res = await fetch(API + path, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export default function App() {
  const [workouts,     setWorkouts]     = useState([]);
  const [names,        setNames]        = useState({ chisa: 'Chisa', partner: 'Luc' });
  const [avatars,      setAvatars]      = useState({ chisa: null, partner: null });
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [showModal,    setShowModal]    = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [celebration,  setCelebration]  = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [mainTab,      setMainTab]      = useState('score');

  // Refs for polling & notifications
  const knownIds  = useRef(null);   // Set of workout IDs seen so far
  const namesRef  = useRef(names);  // always-current names for notification text
  useEffect(() => { namesRef.current = names; }, [names]);

  const loadData = useCallback(async () => {
    try {
      const [ws, settings] = await Promise.all([
        apiFetch('/workouts'),
        apiFetch('/settings'),
      ]);
      setWorkouts(ws);
      // Seed knownIds with existing workouts so polling only notifies for truly NEW ones
      knownIds.current = new Set(ws.map(w => w.id));
      setNames({
        chisa:   settings.name_chisa   ?? 'Chisa',
        partner: settings.name_partner ?? 'Luc',
      });
      setAvatars({
        chisa:   settings.avatar_chisa   ?? null,
        partner: settings.avatar_partner ?? null,
      });
      setError(null);
    } catch (e) {
      setError('Cannot connect to server. Make sure the backend is running (npm run dev).');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load — seed knownIds so first poll doesn't spam notifications
  useEffect(() => {
    loadData().then(() => {
      // knownIds seeded after first successful fetch (see loadData)
    });
  }, [loadData]);

  // Request notification permission once app has loaded
  useEffect(() => {
    if (!loading && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [loading]);

  // Polling — sync every 10 s, notify on new workouts from either person
  useEffect(() => {
    if (loading) return;

    const poll = async () => {
      try {
        const data = await apiFetch('/workouts');

        // Detect newly added workouts since last poll
        if (knownIds.current !== null) {
          const newWorkouts = data.filter(w => !knownIds.current.has(w.id));
          if (newWorkouts.length > 0 && Notification.permission === 'granted') {
            newWorkouts.forEach(w => {
              const n        = namesRef.current;
              const userName = w.user === 'chisa' ? n.chisa : n.partner;
              const wt       = WORKOUT_TYPES[w.type];
              const label    = w.custom_label || wt?.label || w.type;
              try {
                new Notification(`${wt?.emoji ?? '💪'} ${userName} logged a workout!`, {
                  body: `${label} · +${w.points} pts`,
                  icon: '/icon-192.png',
                });
              } catch (_) {}
            });
          }
        }

        knownIds.current = new Set(data.map(w => w.id));
        setWorkouts(data);
      } catch (_) {
        // silent fail — don't break UI on network hiccup
      }
    };

    const id = setInterval(poll, 10_000);
    return () => clearInterval(id);
  }, [loading]);

  const handleSaveWorkout = async (data) => {
    const workout = await apiFetch('/workouts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setWorkouts(prev => [workout, ...prev]);
    setShowModal(false);
    setCelebration(workout);
  };

  const handleDeleteWorkout = async (id) => {
    if (!confirm('Delete this workout?')) return;
    await apiFetch(`/workouts/${id}`, { method: 'DELETE' });
    setWorkouts(prev => prev.filter(w => w.id !== id));
  };

  const handleSaveSettings = async ({ names: newNames, avatars: newAvatars }) => {
    const patch = {
      name_chisa:    newNames.chisa,
      name_partner:  newNames.partner,
    };
    if (newAvatars.chisa   !== undefined) patch.avatar_chisa   = newAvatars.chisa ?? '';
    if (newAvatars.partner !== undefined) patch.avatar_partner = newAvatars.partner ?? '';

    await apiFetch('/settings', { method: 'PATCH', body: JSON.stringify(patch) });
    setNames(newNames);
    setAvatars(prev => ({
      chisa:   newAvatars.chisa   !== undefined ? newAvatars.chisa   : prev.chisa,
      partner: newAvatars.partner !== undefined ? newAvatars.partner : prev.partner,
    }));
    setShowSettings(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-bounce">🏋️</div>
          <div className="text-gray-400 text-sm">Loading your workouts...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="max-w-sm text-center">
          <div className="text-4xl mb-4">⚡</div>
          <h2 className="text-xl font-bold text-white mb-2">Server not running</h2>
          <p className="text-gray-400 text-sm mb-6">{error}</p>
          <code className="block bg-gray-800 text-green-400 text-xs px-4 py-3 rounded-lg mb-4">
            npm run dev
          </code>
          <button onClick={loadData}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition-colors">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-gray-950/90 backdrop-blur-md border-b border-gray-800/60">
        <div className="max-w-2xl mx-auto px-4 pb-3 header-safe">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-rose-600 rounded-xl flex items-center justify-center text-lg">
                🏋️
              </div>
              <div>
                <h1 className="text-base font-black text-white leading-none">HYROX TRACKER</h1>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest leading-none mt-0.5">
                  {names.chisa} & {names.partner}
                </p>
              </div>
            </div>
            <button onClick={() => setShowSettings(true)}
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors text-sm"
              title="Settings">
              ⚙️
            </button>
          </div>
          <CountdownTimer />
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-2xl mx-auto px-4 pt-5 flex flex-col gap-4 pb-safe" style={{ paddingBottom: 'max(2.5rem, env(safe-area-inset-bottom))' }}>
        <StreakBanner workouts={workouts} names={names} avatars={avatars} />
        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
          <div className="flex border-b border-gray-800">
            {[['score', '🏆 Scoreboard'], ['challenges', '🎯 Challenges']].map(([val, label]) => (
              <button key={val} onClick={() => setMainTab(val)}
                className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
                  mainTab === val
                    ? 'text-white border-orange-500 bg-orange-500/5'
                    : 'text-gray-500 border-transparent hover:text-gray-300'
                }`}>
                {label}
              </button>
            ))}
          </div>
          {mainTab === 'score'
            ? <ScoreBoard workouts={workouts} names={names} avatars={avatars} />
            : <Challenges workouts={workouts} names={names} avatars={avatars} />
          }
        </div>
        <Calendar
          workouts={workouts}
          currentMonth={currentMonth}
          onMonthChange={setCurrentMonth}
          onDayClick={setSelectedDate}
          selectedDate={selectedDate}
        />
        {selectedDate && (
          <DayWorkouts
            date={selectedDate}
            workouts={workouts}
            names={names}
            avatars={avatars}
            onAdd={() => setShowModal(true)}
            onDelete={handleDeleteWorkout}
          />
        )}
      </main>

      {showModal && (
        <WorkoutModal date={selectedDate} names={names}
          onClose={() => setShowModal(false)} onSave={handleSaveWorkout} />
      )}
      {celebration && (
        <CelebrationPopup workout={celebration} names={names} avatars={avatars}
          onClose={() => setCelebration(null)} />
      )}
      {showSettings && (
        <SettingsModal names={names} avatars={avatars}
          onClose={() => setShowSettings(false)} onSave={handleSaveSettings} />
      )}
    </div>
  );
}
