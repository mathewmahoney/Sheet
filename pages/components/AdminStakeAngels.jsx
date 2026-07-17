import { useState } from 'react';

export default function AdminStakeAngels() {
  const [winners, setWinners] = useState({ sa_1: '', sa_2: '', sa_3: '' });
  const [loading, setLoading] = useState({});

  const handleLockWinner = async (id) => {
    setLoading(prev => ({ ...prev, [id]: true }));
    try {
      const res = await fetch('/api/admin/save-winner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entryId: id, winner: winners[id] }),
      });
      if (res.ok) alert(`Winner locked for ${id}!`);
    } catch (err) {
      alert("Error locking winner");
    }
    setLoading(prev => ({ ...prev, [id]: false }));
  };

  return (
    <div className="bg-slate-950 border border-slate-800 text-white p-6 rounded-xl max-w-lg mx-auto">
      <h2 className="text-xl font-bold text-yellow-400 mb-2">👼 Stake Angels Controls</h2>
      <p className="text-xs text-slate-400 mb-6">Enter drawn Kick usernames below to unlock their claim dashboards.</p>
      
      <div className="space-y-4">
        {['sa_1', 'sa_2', 'sa_3'].map((id, idx) => (
          <div key={id} className="flex gap-2 items-center bg-slate-900 p-3 rounded-lg">
            <span className="text-sm font-semibold text-slate-400 w-16">Draw {idx+1}:</span>
            <input
              type="text"
              placeholder="Kick Username"
              className="bg-slate-800 p-2 rounded text-sm flex-1 outline-none border border-slate-700"
              value={winners[id]}
              onChange={(e) => setWinners({ ...winners, [id]: e.target.value })}
            />
            <button
              onClick={() => handleLockWinner(id)}
              className="bg-yellow-500 hover:bg-yellow-600 text-slate-950 font-bold px-4 py-2 rounded text-xs transition"
              disabled={loading[id]}
            >
              {loading[id] ? 'Saving...' : 'Lock'}
     9              \n        </button>
          </div>
        ))}
      </div>
    </div>
  );
}
