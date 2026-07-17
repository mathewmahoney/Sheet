import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import ClaimPrizeWidget from "@/components/ClaimPrizeWidget";

export default function Home() {
  const { data: session, status } = useSession();
  const [unclaimedPrizes, setUnclaimedPrizes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session?.user?.kickUsername) {
      setLoading(true);
      // Fetch the prizes assigned to this Kick username
      fetch(`/api/user/my-prizes`)
        .then((res) => res.json())
        .then((data) => {
          setUnclaimedPrizes(data.prizes || []);
          setLoading(false);
        });
    }
  }, [session]);

  if (status === "loading" || loading) {
    return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">Loading portal...</div>;
  }

  // 1. Logged Out State
  if (!session) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6">
        <h1 className="text-3xl font-extrabold text-yellow-400 mb-2">Stream Rewards Portal</h1>
        <p className="text-slate-400 mb-6">Log in with Discord to check and claim your stream prizes.</p>
        <button
          onClick={() => signIn("discord")}
          className="bg-indigo-600 hover:bg-indigo-700 font-bold px-6 py-3 rounded-lg flex items-center gap-2 transition-all"
        >
          Sign in with Discord
        </button>
      </div>
    );
  }

  // 2. Logged In, but Kick Account is not linked
  if (!session.user.kickUsername) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-red-400 mb-2">Kick Account Unlinked</h2>
        <p className="text-slate-400 mb-6">
          Your Discord account (<span className="text-white font-semibold">{session.user.name}</span>) is not yet registered in our rewards system.
        </p>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg text-sm text-left text-slate-300 space-y-2 mb-6">
          <p>👉 <strong>Step 1:</strong> Head over to Kick.com and link your Discord in your connection settings.</p>
          <p>👉 <strong>Step 2:</strong> Join our Discord community so the stream sync database updates your account mapping.</p>
        </div>
        <button onClick={() => signOut()} className="text-slate-500 hover:text-white underline text-sm">
          Sign Out
        </button>
      </div>
    );
  }

  // 3. Successfully Logged In & Linked State
  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <header className="flex justify-between items-center max-w-5xl mx-auto mb-12 border-b border-slate-900 pb-4">
        <div>
          <h1 className="text-2xl font-black text-yellow-400">YOUR STREAM REWARDS</h1>
          <p className="text-xs text-slate-400">Linked to Kick: <span className="text-yellow-500 font-bold">@{session.user.kickUsername}</span></p>
        </div>
        <button onClick={() => signOut()} className="bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white text-xs px-4 py-2 rounded-lg transition-all">
          Logout
        </button>
      </header>

      <main className="max-w-5xl mx-auto space-y-8">
        {/* Render the dynamic Prize Widget if they have a payout waiting */}
        {unclaimedPrizes.length > 0 ? (
          <ClaimPrizeWidget unclaimedPrizes={unclaimedPrizes} />
        ) : (
          <div className="text-center py-16 bg-slate-900/40 border border-slate-900 rounded-2xl max-w-md mx-auto">
            <span className="text-4xl">😎</span>
            <h3 className="text-lg font-bold mt-4">You are all caught up!</h3>
            <p className="text-slate-400 text-xs mt-1 px-4">No pending prizes found. Watch the next stream live to win!</p>
          </div>
        )}
      </main>
    </div>
  );
}
