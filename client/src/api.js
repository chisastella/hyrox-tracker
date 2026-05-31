const STORAGE_KEY = 'hyrox_workouts';
const SETTINGS_KEY = 'hyrox_settings';

export async function apiFetch(path, opts = {}) {
  const method = opts.method || 'GET';
  const body = opts.body ? JSON.parse(opts.body) : null;

  if (path === '/workouts') {
    if (method === 'GET') {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      return data;
    }
    if (method === 'POST') {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      const newItem = { ...body, id: Date.now() };
      data.push(newItem);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return newItem;
    }
  }

  if (path.startsWith('/workouts/') && method === 'DELETE') {
    const id = parseInt(path.split('/')[2]);
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const filtered = data.filter(w => w.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return {};
  }

  if (path === '/settings') {
    if (method === 'GET') {
      return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
    }
    if (method === 'PATCH') {
      const current = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
      const updated = { ...current, ...body };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
      return updated;
    }
  }
}
