import { useState, useRef } from 'react';
import { USER_META } from '../constants.js';

// Compress & crop image to a square data URL (max 300px)
function compressImage(file, size = 300) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width  = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        // Centre-crop to square
        const s = Math.min(img.width, img.height);
        const ox = (img.width  - s) / 2;
        const oy = (img.height - s) / 2;
        // Clip to circle
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(img, ox, oy, s, s, 0, 0, size, size);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
    };
  });
}

export default function SettingsModal({ names, avatars, onClose, onSave }) {
  const [chisaName,    setChisaName]    = useState(names.chisa);
  const [partnerName,  setPartnerName]  = useState(names.partner);
  const [chisaAvatar,  setChisaAvatar]  = useState(avatars.chisa   ?? null);
  const [partnerAvatar,setPartnerAvatar]= useState(avatars.partner ?? null);
  const [saving,       setSaving]       = useState(false);

  const chisaRef   = useRef();
  const partnerRef = useRef();

  const handleFileChange = async (e, setAvatar) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const compressed = await compressImage(file);
    setAvatar(compressed);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!chisaName.trim() || !partnerName.trim()) return;
    setSaving(true);
    await onSave({
      names:   { chisa: chisaName.trim(), partner: partnerName.trim() },
      avatars: { chisa: chisaAvatar, partner: partnerAvatar },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-5 animate-bounce-in">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white">Settings</h2>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Chisa */}
          <UserField
            label="Your Profile"
            user="chisa"
            name={chisaName}
            onNameChange={setChisaName}
            avatar={chisaAvatar}
            fileRef={chisaRef}
            onFilePick={() => chisaRef.current?.click()}
            onFileChange={e => handleFileChange(e, setChisaAvatar)}
          />

          {/* Partner */}
          <UserField
            label="Partner's Profile"
            user="partner"
            name={partnerName}
            onNameChange={setPartnerName}
            avatar={partnerAvatar}
            fileRef={partnerRef}
            onFilePick={() => partnerRef.current?.click()}
            onFileChange={e => handleFileChange(e, setPartnerAvatar)}
          />

          <button type="submit" disabled={saving}
            className="w-full py-3 rounded-xl font-bold text-white bg-gray-700 hover:bg-gray-600 transition-colors mt-1 disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}

function UserField({ label, user, name, onNameChange, avatar, fileRef, onFilePick, onFileChange }) {
  const meta = USER_META[user];

  return (
    <div>
      <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{label}</div>
      <div className="flex items-center gap-4">
        {/* Avatar circle — tap to change */}
        <button type="button" onClick={onFilePick}
          className="relative flex-shrink-0 group">
          <div className={`w-16 h-16 rounded-full overflow-hidden border-2 ${meta.border} flex items-center justify-center`}
            style={{ background: avatar ? 'transparent' : meta.color + '33' }}>
            {avatar
              ? <img src={avatar} alt={name} className="w-full h-full object-cover" />
              : <span className={`text-2xl font-black ${meta.text}`}>{name.charAt(0).toUpperCase()}</span>
            }
          </div>
          <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 group-active:opacity-100 flex items-center justify-center transition-opacity">
            <span className="text-white text-xs font-bold">📷</span>
          </div>
        </button>

        {/* Name input */}
        <input type="text" value={name} onChange={e => onNameChange(e.target.value)}
          maxLength={20} required
          className={`flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-${user === 'chisa' ? 'orange' : 'sky'}-500 transition-colors`} />

        <input ref={fileRef} type="file" accept="image/*" className="hidden"
          onChange={onFileChange} />
      </div>
      <p className="text-[11px] text-gray-600 mt-1.5 ml-[80px]">Tap the photo to change</p>
    </div>
  );
}
