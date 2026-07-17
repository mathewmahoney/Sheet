import { useState } from 'react';

export default function ClaimPrizeWidget({ unclaimedPrizes }) {
  const [stakeUser, setStakeUser] = useState('');
  const [platform, setPlatform] = useState('.com');
  const [ltcAddress, setLtcAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  if (!unclaimedPrizes || unclaimedPrizes.length === 0) return null;

  const currentPrize = unclaimedPrizes[0];

  const handleClaim = async () => {
    setLoading(true);
    const response = await fetch('/api/user/claim-prize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        entryId: currentPrize.id,
        stakeUser,
        platform,
        ltcAddress
      }),
    });

    if (response.ok) {
      setStatus('Success! Your details have been submitted for processing.');
    } else {
      setStatus('Failed to submit claim. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="bg-emerald-950/40 border border-emerald-500 text-white p-6 rounded-xl max-w-md mx-auto my-6">
      <h3 className="text-xl font-bold text-emerald-400 mb-1">🎉 You Won {currentPrize.type}!</h3>
      <p className="text-xs text-slate-300 mb-4">Complete your account details below to request payout.</p>
      
      {status ? (
        <p className="text-sm font-semibold text-emerald-400 mt-2">{status}</p>
      ) : (
        <div className="space-y-4 text-sm">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Stake Username</label>
            <input 
              type="text" 
              className="w-full bg-slate-900 border border-slate-700 p-2 rounded" 
              value={stakeUser} 
              onChange={e => setStakeUser(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Platform</label>
            <div className="flex gap-4 mt-1">
              {['.com', '.US'].map(p => (
                <label key={p} className="flex items-center gap-1 cursor-pointer">
                  <input type="radio" checked={platform === p} onChange={() => setPlatform(p)} /> {p}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Litecoin (LTC) Payout Address</label>
            <input 
              type="text" 
              className="w-full bg-slate-900 border border-slate-700 p-2 rounded" 
              placeholder="Ltc1q..."
              value={ltcAddress} 
              onChange={e => setLtcAddress(e.target.value)}
            />
          </div>
          <button 
            onClick={handleClaim} 
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-2 rounded transition"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Claim Payout'}
          </button>
        </div>
      )}
    </div>
  );
}
}
