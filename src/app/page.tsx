'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, CheckCircle } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import { useAuthStore } from '@/store/auth';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Navbar />

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-36">
          <div className="max-w-4xl">
            <p className="text-slate-400 text-sm font-medium uppercase tracking-widest mb-7">
              Resume tailoring &amp; ATS optimisation
            </p>
            <h1 className="text-5xl lg:text-7xl font-bold leading-[1.05] text-white">
              Most resumes<br />
              never reach<br />
              <span className="text-blue-400">a human.</span>
            </h1>
            <p className="mt-8 text-lg text-slate-400 max-w-xl leading-relaxed">
              75% of applications are rejected by ATS filters before a recruiter
              sees them. Paste a job description — we'll rewrite your resume to
              pass the filter, match the keywords, and reach the shortlist.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link
                href="/register"
                className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5"
              >
                Try it free <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-8 py-4 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/10 transition-all duration-200"
              >
                Sign in
              </Link>
            </div>
            <div className="mt-12 pt-8 border-t border-white/10 flex flex-wrap gap-8 text-slate-400 text-sm">
              <span>No credit card required</span>
              <span>Free credits included</span>
              <span>PDF &amp; DOCX download</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Editorial: The Problem ──────────────────────────────── */}
      <section className="py-24" style={{ background: 'var(--surface)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-20 items-center">

            {/* Left: text */}
            <div>
              <p className="text-blue-600 text-sm font-semibold uppercase tracking-widest mb-4">
                The problem
              </p>
              <h2 className="text-3xl lg:text-4xl font-bold leading-tight mb-6 text-[var(--text)]">
                One resume can't fit every job description
              </h2>
              <p className="text-lg mb-5 leading-relaxed text-[var(--text-secondary)]">
                ATS software scans for exact keywords from the job posting. If
                your resume doesn't contain them — even if you're qualified —
                it's filtered out before a recruiter ever reads it.
              </p>
              <p className="text-lg mb-8 leading-relaxed text-[var(--text-secondary)]">
                Manually tailoring your resume for each application takes hours.
                We do it in seconds.
              </p>
              <div className="space-y-3">
                {[
                  'Extracts keywords directly from the job description',
                  'Rewrites your bullet points using your real experience',
                  'Flags ATS formatting issues before you apply',
                  'Keeps a separate version for every role you target',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-[var(--text-secondary)]">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: keyword match mockup */}
            <div className="mt-12 lg:mt-0">
              <div
                className="rounded-2xl border p-6"
                style={{ background: 'var(--surface-raised)', borderColor: 'var(--border)' }}
              >
                <p className="text-xs font-semibold uppercase tracking-widest mb-5 text-[var(--text-muted)]">
                  Keyword matching — example output
                </p>
                <div className="space-y-2 mb-6">
                  {[
                    { keyword: 'React',             before: false, after: true },
                    { keyword: 'TypeScript',        before: true,  after: true },
                    { keyword: 'REST APIs',         before: false, after: true },
                    { keyword: 'CI/CD pipelines',   before: false, after: true },
                    { keyword: 'Agile methodology', before: true,  after: true },
                    { keyword: 'AWS',               before: false, after: true },
                  ].map(({ keyword, before, after }) => (
                    <div key={keyword} className="flex items-center justify-between text-sm py-1.5">
                      <span className="text-[var(--text)] w-36">{keyword}</span>
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-16 text-center text-xs px-2 py-1 rounded-full font-medium ${
                            before
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          {before ? 'matched' : 'missing'}
                        </span>
                        <ArrowRight className="h-3 w-3 text-[var(--text-muted)]" />
                        <span
                          className={`w-16 text-center text-xs px-2 py-1 rounded-full font-medium ${
                            after
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          {after ? 'matched' : 'missing'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-5" style={{ borderColor: 'var(--border)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-[var(--text)]">
                      ATS score after tailoring
                    </span>
                    <span className="text-2xl font-bold text-emerald-600">91%</span>
                  </div>
                  <div
                    className="h-2 rounded-full overflow-hidden"
                    style={{ background: 'var(--border)' }}
                  >
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '91%' }} />
                  </div>
                  <p className="text-xs mt-2 text-[var(--text-muted)]">
                    Up from 43% before tailoring
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ───────────────────────────────────────── */}
      <section className="py-24 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-14">
            <h2 className="text-3xl lg:text-4xl font-bold text-[var(--text)]">
              How it works
            </h2>
            <p className="mt-3 text-lg text-[var(--text-secondary)]">
              From upload to tailored resume in under a minute.
            </p>
          </div>

          <div className="grid md:grid-cols-3">
            {[
              {
                number: '01',
                title: 'Upload your resume',
                body: 'PDF or DOCX. We parse your experience, skills, and history — nothing is stored beyond what you need.',
              },
              {
                number: '02',
                title: 'Paste the job description',
                body: 'Copy the full job posting. Our AI extracts required skills, keywords, and seniority signals.',
              },
              {
                number: '03',
                title: 'Download your tailored resume',
                body: 'Get an ATS-optimised version built from your real experience — ready to submit.',
              },
            ].map((step, index) => (
              <div
                key={step.number}
                className={`p-8 border-b md:border-b-0 ${index < 2 ? 'md:border-r' : ''}`}
                style={{ borderColor: 'var(--border)' }}
              >
                <span
                  className="text-7xl font-black leading-none select-none"
                  style={{ color: 'var(--border)' }}
                >
                  {step.number}
                </span>
                <h3 className="text-lg font-semibold mt-5 mb-2 text-[var(--text)]">
                  {step.title}
                </h3>
                <p className="text-[var(--text-secondary)] leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Full Toolkit ────────────────────────────────────────── */}
      <section
        className="py-24 border-t"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-20 items-start">
            <div>
              <p className="text-blue-600 text-sm font-semibold uppercase tracking-widest mb-4">
                More than tailoring
              </p>
              <h2 className="text-3xl lg:text-4xl font-bold leading-tight mb-6 text-[var(--text)]">
                A full job search toolkit — not just a resume editor
              </h2>
              <p className="text-lg leading-relaxed text-[var(--text-secondary)]">
                Tailoring gets you to the interview. The rest of the tools help
                you prepare, track, and close.
              </p>
            </div>

            {/* Window-pane grid */}
            <div className="mt-10 lg:mt-0">
              <div
                className="grid grid-cols-1 sm:grid-cols-2 gap-px"
                style={{ background: 'var(--border)' }}
              >
                {[
                  {
                    title: 'Cover letter generator',
                    desc: 'Matched to the job, written in your voice.',
                  },
                  {
                    title: 'ATS score simulator',
                    desc: 'See your score before you hit submit.',
                  },
                  {
                    title: 'Job application tracker',
                    desc: 'Kanban board for every role you\'ve applied to.',
                  },
                  {
                    title: 'Interview prep',
                    desc: 'Questions based on the actual job description.',
                  },
                  {
                    title: 'Skill gap analyser',
                    desc: 'Know exactly what to learn for your target role.',
                  },
                  {
                    title: 'Salary analyser',
                    desc: 'Market data for your role, level, and location.',
                  },
                ].map((tool) => (
                  <div
                    key={tool.title}
                    className="p-6"
                    style={{ background: 'var(--surface)' }}
                  >
                    <h4 className="font-semibold mb-1 text-[var(--text)]">{tool.title}</h4>
                    <p className="text-sm text-[var(--text-muted)]">{tool.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────── */}
      <section className="bg-blue-600 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold text-white">
              Stop applying blind.
            </h2>
            <p className="mt-2 text-blue-100 text-lg">
              Free to start — no credit card needed.
            </p>
          </div>
          <Link
            href="/register"
            className="flex-shrink-0 inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5"
          >
            Get started free <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            <div>
              <span className="text-white font-bold text-lg">Job Tools</span>
              <p className="mt-2 text-sm max-w-xs leading-relaxed">
                Built for job seekers who are tired of applying into a black hole.
              </p>
            </div>
            <div className="text-sm md:text-right max-w-sm">
              <p>AI-generated content is based solely on your provided information.</p>
              <p className="mt-1">We don't fabricate experience or guarantee outcomes.</p>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-slate-800 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} Job Tools. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
