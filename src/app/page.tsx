import Link from 'next/link';
import { FileText, Target, Zap, Shield, CheckCircle, ArrowRight, Sparkles, Star } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';

export default function Home() {
  const features = [
    {
      icon: Target,
      title: 'ATS-Optimized',
      description: 'Get higher ATS scores with AI-powered keyword optimization and formatting.',
      color: 'from-indigo-500 to-indigo-600',
    },
    {
      icon: Zap,
      title: 'Instant Customization',
      description: 'Tailor your resume for any job in seconds, not hours.',
      color: 'from-amber-500 to-orange-500',
    },
    {
      icon: Shield,
      title: 'Truth Guard',
      description: 'AI ensures factual accuracy - no fake skills or exaggerated claims.',
      color: 'from-emerald-500 to-teal-500',
    },
    {
      icon: FileText,
      title: 'Version Control',
      description: 'Keep unlimited versions for different jobs. Compare and track changes.',
      color: 'from-purple-500 to-pink-500',
    },
  ];

  const benefits = [
    'AI-powered resume tailoring for each job',
    'ATS compatibility scoring and simulator',
    'Cover letter generation',
    'Multiple professional templates',
    'PDF and DOCX downloads',
    'Version history and comparison',
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500" />
        <div className="absolute inset-0 opacity-30" style={{backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1.22676 0C1.91374 0 2.45351 0.539773 2.45351 1.22676C2.45351 1.91374 1.91374 2.45351 1.22676 2.45351C0.539773 2.45351 0 1.91374 0 1.22676C0 0.539773 0.539773 0 1.22676 0Z' fill='rgba(255,255,255,0.07)'%3E%3C/path%3E%3C/svg%3E\")"}} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-white/90 text-sm mb-6">
              <Sparkles className="h-4 w-4" />
              AI-Powered Resume Builder
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold leading-tight text-white">
              Land More Interviews with AI-Powered Resume Customization
            </h1>
            <p className="mt-6 text-xl text-white/80">
              Tailor your resume for every job application in seconds. Get higher ATS scores,
              match more keywords, and stand out to recruiters.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link
                href="/register"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-indigo-600 font-semibold rounded-xl hover:bg-white/90 transition-all duration-200 shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-0.5"
              >
                Start Free <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-all duration-200"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative circles */}
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-white/5 rounded-full" />
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-white/5 rounded-full" />
      </section>

      {/* Features Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900">
              Everything You Need to Land Your Dream Job
            </h2>
            <p className="mt-4 text-xl text-slate-600 max-w-2xl mx-auto">
              Our AI understands what recruiters and ATS systems look for.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-white p-8 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 hover:border-indigo-200 hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}>
                  <feature.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900">How It Works</h2>
            <p className="mt-4 text-xl text-slate-600">Three simple steps to your tailored resume</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: 1,
                title: 'Upload Your Resume',
                description: 'Upload your existing resume in PDF or DOCX format. Our AI will parse and understand your experience.',
              },
              {
                step: 2,
                title: 'Paste Job Description',
                description: 'Copy and paste the job description you want to apply for. Our AI extracts key requirements and keywords.',
              },
              {
                step: 3,
                title: 'Get Tailored Resume',
                description: 'Receive an ATS-optimized resume tailored specifically for that job, ready to download and submit.',
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-3xl flex items-center justify-center text-3xl font-bold mx-auto mb-8 shadow-lg shadow-indigo-500/30">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">{item.title}</h3>
                <p className="text-slate-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-8">
                Built for Job Seekers Who Want Results
              </h2>
              <ul className="space-y-4">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start">
                    <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                      <CheckCircle className="h-4 w-4 text-emerald-600" />
                    </div>
                    <span className="text-lg text-slate-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-10 lg:mt-0">
              <div className="bg-gradient-to-br from-indigo-100 to-purple-100 rounded-3xl p-8">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-lg font-semibold text-slate-900">ATS Score</span>
                    <span className="text-4xl font-bold text-emerald-600">92%</span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden mb-6">
                    <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full" style={{ width: '92%' }} />
                  </div>
                  <div className="space-y-3">
                    {[
                      '12/15 keywords matched',
                      'ATS-safe formatting',
                      'No truth guard warnings',
                    ].map((item) => (
                      <div key={item} className="flex items-center text-sm">
                        <CheckCircle className="h-5 w-5 text-emerald-500 mr-3" />
                        <span className="text-slate-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500" />
        <div className="absolute inset-0 opacity-30" style={{backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1.22676 0C1.91374 0 2.45351 0.539773 2.45351 1.22676C2.45351 1.91374 1.91374 2.45351 1.22676 2.45351C0.539773 2.45351 0 1.91374 0 1.22676C0 0.539773 0.539773 0 1.22676 0Z' fill='rgba(255,255,255,0.07)'%3E%3C/path%3E%3C/svg%3E\")"}} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Ready to Land More Interviews?
          </h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Join thousands of job seekers who have improved their interview rates with
            AI-optimized resumes.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center justify-center px-8 py-4 bg-white text-indigo-600 font-semibold rounded-xl hover:bg-white/90 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-6 md:mb-0">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-2.5 rounded-xl">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <span className="ml-3 text-xl font-bold text-white">ResumeAI</span>
            </div>
            <div className="text-sm text-center md:text-right max-w-md">
              <p className="mb-2">
                This platform does not fabricate experience or guarantee hiring outcomes.
              </p>
              <p>AI-generated content is based solely on user-provided information.</p>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-slate-800 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} AI Resume & CV Customizer. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
