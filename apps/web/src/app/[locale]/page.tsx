'use client';

export default function HomePage() {
  const rows = [
    { icon: '🌐', name: 'public-data-aggregator.io', found: 'Found: Today, 06:16 AM', status: 'HIGH RISK', cls: 'bg-[#3b0a0a] text-[#f87171]' },
    { icon: '↗', name: 'social-lookup-service.net', found: 'Found: Yesterday, 11:20 PM', status: 'PENDING', cls: 'bg-[#451a03] text-[#fb923c]' },
    { icon: '🗃', name: 'archives-database.com', found: 'Found: 2 days ago', status: 'VERIFIED', cls: 'bg-[#052e16] text-[#4ade80]' },
  ];

  return (
    <div className="flex flex-col h-full bg-[#0d0f14]">
      {/* Page Header */}
      <div className="px-8 py-5 border-b border-[#1e2235] flex-shrink-0">
        <h1 className="text-xl font-semibold text-white">Dashboard</h1>
      </div>

      {/* Content */}
      <div className="flex flex-1 gap-5 p-5 overflow-auto min-h-0">

        {/* Left Main Column */}
        <div className="flex-1 flex flex-col gap-5 min-w-0">

          {/* System Integrity Card */}
          <div className="bg-[#161820] rounded-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-2">System Integrity Status</h2>
            <p className="text-[#8b90a0] text-sm leading-relaxed max-w-lg mb-5">
              Welcome back to the Vault. Your digital footprint is being monitored in real-time.
              All automated removal scripts are currently operational and executing within expected latency.
            </p>
            <button className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#22c55e]/40 text-[#22c55e] text-xs font-semibold tracking-wide hover:bg-[#22c55e]/10 transition-colors">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse inline-block" />
              LIVE PROTECTION ACTIVE
            </button>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#161820] rounded-xl p-5">
              <p className="text-[#8b90a0] text-xs uppercase tracking-wider mb-2">Overall Risk</p>
              <p className="text-white text-2xl font-bold mb-1">Secure</p>
              <p className="text-[#5a5f70] text-xs">3 high-risk vulnerabilities found</p>
            </div>
            <div className="bg-[#161820] rounded-xl p-5">
              <p className="text-[#8b90a0] text-xs uppercase tracking-wider mb-2">Scans Done Today</p>
              <p className="text-white text-2xl font-bold mb-1">14</p>
              <p className="text-[#5a5f70] text-xs">Last scan: 12m ago</p>
            </div>
          </div>

          {/* Review Queue */}
          <div className="bg-[#161820] rounded-xl flex-1">
            <div className="px-6 py-4 flex items-center justify-between border-b border-[#1e2235]">
              <div>
                <h3 className="text-white font-semibold">Review Queue</h3>
                <p className="text-[#5a5f70] text-xs mt-0.5">Found instances awaiting verification or automatic removal.</p>
              </div>
              <button className="text-xs text-[#8b90a0] hover:text-white font-semibold tracking-wider uppercase transition-colors">
                View All Activity
              </button>
            </div>
            <div className="px-6 py-3 grid grid-cols-[1fr_130px_110px] gap-4">
              <span className="text-[#5a5f70] text-xs uppercase tracking-wider">Source / URL</span>
              <span className="text-[#5a5f70] text-xs uppercase tracking-wider">Status</span>
              <span className="text-[#5a5f70] text-xs uppercase tracking-wider">Action</span>
            </div>
            {rows.map((row, i) => (
              <div key={i} className="px-6 py-4 grid grid-cols-[1fr_130px_110px] gap-4 items-center hover:bg-[#1c1f29] transition-colors border-t border-[#1e2235]/40">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[#1c1f29] flex items-center justify-center text-sm flex-shrink-0">
                    {row.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[#c8cad4] text-sm font-medium truncate">{row.name}</p>
                    <p className="text-[#5a5f70] text-xs">{row.found}</p>
                  </div>
                </div>
                <div>
                  <span className={`inline-block px-2.5 py-1 rounded text-xs font-bold tracking-wide ${row.cls}`}>
                    {row.status}
                  </span>
                </div>
                <div>
                  <button className="text-xs text-[#8b90a0] hover:text-white font-semibold uppercase tracking-wide transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className="w-[210px] flex-shrink-0 flex flex-col gap-4">

          {/* Quick Actions */}
          <div className="bg-[#161820] rounded-xl p-4">
            <h3 className="text-white font-semibold text-sm mb-3">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { label: 'Start New Check', icon: '→' },
                { label: 'Report Manual Finding', icon: '+' },
                { label: 'Contact Specialist', icon: '↗' },
              ].map((btn) => (
                <button
                  key={btn.label}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg bg-[#1c1f29] hover:bg-[#242836] text-[#8b90a0] hover:text-white text-xs font-semibold uppercase tracking-wide transition-all"
                >
                  <span>{btn.label}</span>
                  <span className="w-5 h-5 rounded bg-[#242836] flex items-center justify-center text-xs">{btn.icon}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Privacy Shield */}
          <div className="bg-[#161820] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-[#052e16] flex items-center justify-center flex-shrink-0">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="#22c55e" />
                </svg>
              </div>
              <span className="text-white text-sm font-semibold">Privacy Shield</span>
            </div>
            <p className="text-[#5a5f70] text-xs leading-relaxed mb-3">
              Our Zero-Knowledge architecture ensures that not even Trustshield employees can view your specific PII data. All reports are encrypted with your private key.
            </p>
            <button className="text-xs text-[#3b82f6] hover:text-[#60a5fa] font-semibold uppercase tracking-wide transition-colors">
              Read Retention Policy
            </button>
          </div>

          {/* Removal Progress */}
          <div className="bg-[#161820] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-white font-semibold text-sm">Removal Progress</h3>
              <span className="px-2 py-0.5 rounded bg-[#1a2035] text-[#3b82f6] text-xs font-bold">3 Active</span>
            </div>
            <div className="space-y-4">
              {[
                { label: 'CASE #8821 - DMCA REQUEST', pct: 75 },
                { label: 'CASE #8819 - OPT-OUT SCRIPT', pct: 30 },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between items-center mb-1.5">
                    <p className="text-[#8b90a0] text-[10px] uppercase tracking-wide font-semibold">{item.label}</p>
                    <p className="text-[#5a5f70] text-[10px]">{item.pct}%</p>
                  </div>
                  <div className="h-1 bg-[#1c1f29] rounded-full overflow-hidden">
                    <div className="h-full bg-[#3b82f6] rounded-full" style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="px-6 py-3 border-t border-[#1e2235] flex items-center justify-between text-[#5a5f70] text-[10px] uppercase tracking-widest flex-shrink-0">
        <span>2026 YoureFuture - TrustShield. All rights reserved.</span>
        <div className="flex gap-6">
          <button className="hover:text-[#8b90a0] transition-colors">Terms</button>
          <button className="hover:text-[#8b90a0] transition-colors">Privacy</button>
          <button className="hover:text-[#8b90a0] transition-colors">Data Retention Policy</button>
        </div>
      </footer>
    </div>
  );
}
