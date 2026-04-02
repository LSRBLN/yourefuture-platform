'use client';

import Link from 'next/link';
import { ArrowRight, Shield, Zap, Target, BarChart3, Lock, Search } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Shield className="w-8 h-8 text-blue-400" />
            <span className="text-xl font-bold text-white">TrustShield</span>
          </div>
          <Link
            href="/osint"
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            OSINT Dashboard →
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight">
              Professional OSINT Intelligence Platform
            </h1>
            <p className="text-xl text-slate-300">
              Search across 10+ OSINT sources simultaneously. Detect breaches, find social media profiles, analyze networks, and generate comprehensive intelligence reports.
            </p>
            <div className="flex gap-4">
              <Link
                href="/osint"
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center gap-2 transition-colors"
              >
                Start Searching <ArrowRight className="w-5 h-5" />
              </Link>
              <button className="px-8 py-3 border border-slate-600 text-white rounded-lg font-semibold hover:bg-slate-800 transition-colors">
                Learn More
              </button>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur-xl opacity-20"></div>
            <div className="relative bg-slate-800/50 border border-slate-700 rounded-lg p-8 backdrop-blur">
              <div className="space-y-4">
                <div className="h-3 bg-slate-700 rounded-full w-3/4"></div>
                <div className="h-3 bg-slate-700 rounded-full w-1/2"></div>
                <div className="h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg mt-6"></div>
                <div className="grid grid-cols-3 gap-3 mt-6">
                  {[...Array(9)].map((_, i) => (
                    <div key={i} className="h-8 bg-slate-700/50 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-slate-800/50 border-t border-slate-700/50">
        <div className="max-w-6xl mx-auto px-6 py-24">
          <h2 className="text-4xl font-bold text-white mb-16 text-center">Powerful Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6 hover:border-blue-500 transition-colors">
              <Search className="w-10 h-10 text-blue-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Multi-Source Search</h3>
              <p className="text-slate-300">Search across username, email, phone, domain, and reverse image search in one query.</p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6 hover:border-blue-500 transition-colors">
              <Target className="w-10 h-10 text-blue-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Breach Detection</h3>
              <p className="text-slate-300">Real-time integration with breach databases. Know if emails are compromised instantly.</p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6 hover:border-blue-500 transition-colors">
              <Zap className="w-10 h-10 text-blue-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Fast Results</h3>
              <p className="text-slate-300">Optimized search algorithms return results in milliseconds.</p>
            </div>

            {/* Feature 4 */}
            <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6 hover:border-blue-500 transition-colors">
              <BarChart3 className="w-10 h-10 text-blue-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Advanced Analytics</h3>
              <p className="text-slate-300">Visualize trends, sources, and patterns with interactive charts.</p>
            </div>

            {/* Feature 5 */}
            <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6 hover:border-blue-500 transition-colors">
              <Lock className="w-10 h-10 text-blue-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Privacy First</h3>
              <p className="text-slate-300">Self-hosted infrastructure. Your data stays with you, always encrypted.</p>
            </div>

            {/* Feature 6 */}
            <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6 hover:border-blue-500 transition-colors">
              <Shield className="w-10 h-10 text-blue-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Enterprise Ready</h3>
              <p className="text-slate-300">RBAC, audit logs, batch operations, and team collaboration features.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Sources Section */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <h2 className="text-4xl font-bold text-white mb-16 text-center">Integrated OSINT Sources</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            'Blackbird',
            'theHarvester',
            'SpiderFoot',
            'PhoneInfoga',
            'Qdrant Vector DB',
            'MRISA',
            'WHOIS Lookup',
            'Reverse DNS'
          ].map((source) => (
            <div
              key={source}
              className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 text-center hover:border-blue-500 transition-colors"
            >
              <p className="text-slate-300 font-medium">{source}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-6xl mx-auto px-6 py-24">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-white mb-2">10+</div>
              <p className="text-blue-100">OSINT Sources</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">500M+</div>
              <p className="text-blue-100">Records Indexed</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">&lt;100ms</div>
              <p className="text-blue-100">Avg Response Time</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">99.9%</div>
              <p className="text-blue-100">Uptime SLA</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <h2 className="text-4xl font-bold text-white mb-6">Ready to Start Investigating?</h2>
        <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
          Access professional-grade OSINT tools. No credit card required. Self-hosted and fully private.
        </p>
        <Link
          href="/osint"
          className="inline-flex px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-lg transition-colors"
        >
          Open OSINT Dashboard <ArrowRight className="w-6 h-6 ml-2" />
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-700/50">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-6 h-6 text-blue-400" />
                <span className="font-bold text-white">TrustShield</span>
              </div>
              <p className="text-slate-400 text-sm">Professional OSINT Intelligence Platform</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-blue-400">Dashboard</a></li>
                <li><a href="#" className="hover:text-blue-400">Features</a></li>
                <li><a href="#" className="hover:text-blue-400">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Developers</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-blue-400">API Docs</a></li>
                <li><a href="#" className="hover:text-blue-400">GitHub</a></li>
                <li><a href="#" className="hover:text-blue-400">Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-blue-400">Privacy</a></li>
                <li><a href="#" className="hover:text-blue-400">Terms</a></li>
                <li><a href="#" className="hover:text-blue-400">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-700 pt-8">
            <p className="text-center text-slate-400 text-sm">© 2026 TrustShield. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
