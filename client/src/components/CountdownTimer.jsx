import { differenceInDays } from 'date-fns';
import { HYROX_DATE } from '../constants.js';

export default function CountdownTimer() {
  const days = differenceInDays(HYROX_DATE, new Date());

  if (days < 0) {
    return (
      <div className="text-center py-1">
        <span className="text-xl font-black text-amber-400">YOU DID IT! HYROX COMPLETE! 🏅</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-3">
      <span className="text-gray-500 text-xs font-semibold uppercase tracking-widest">HYROX IN</span>
      <div className="flex items-baseline gap-1.5 bg-amber-500/15 border border-amber-500/30 px-4 py-1.5 rounded-xl">
        <span className="text-3xl font-black text-amber-400 tabular-nums leading-none">{days}</span>
        <span className="text-amber-500/70 text-sm font-semibold uppercase tracking-wider">days</span>
      </div>
    </div>
  );
}
