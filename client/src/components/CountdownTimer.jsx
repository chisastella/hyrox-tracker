import { differenceInDays, differenceInHours, differenceInMinutes } from 'date-fns';
import { HYROX_DATE } from '../constants.js';

export default function CountdownTimer() {
  const now = new Date();
  const totalDays = differenceInDays(HYROX_DATE, now);
  const totalHours = differenceInHours(HYROX_DATE, now) % 24;
  const totalMinutes = differenceInMinutes(HYROX_DATE, now) % 60;

  if (totalDays < 0) {
    return (
      <div className="text-center py-3">
        <span className="text-2xl font-black text-amber-400">YOU DID IT! 🏅 HYROX COMPLETE!</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-1 sm:gap-3">
      <span className="text-gray-400 text-xs sm:text-sm font-medium uppercase tracking-widest">HYROX IN</span>
      <div className="flex items-center gap-2">
        <Chip value={totalDays} label="days" highlight />
        <span className="text-gray-600 font-bold">:</span>
        <Chip value={totalHours} label="hrs" />
        <span className="text-gray-600 font-bold">:</span>
        <Chip value={totalMinutes} label="min" />
      </div>
    </div>
  );
}

function Chip({ value, label, highlight }) {
  return (
    <div className={`flex flex-col items-center px-2 sm:px-3 py-1 rounded-lg ${highlight ? 'bg-amber-500/20 border border-amber-500/40' : 'bg-gray-800'}`}>
      <span className={`text-lg sm:text-2xl font-black tabular-nums leading-none ${highlight ? 'text-amber-400' : 'text-white'}`}>
        {String(value).padStart(2, '0')}
      </span>
      <span className="text-gray-500 text-[10px] uppercase tracking-widest">{label}</span>
    </div>
  );
}
