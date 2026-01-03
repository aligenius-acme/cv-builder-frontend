import Link from 'next/link';
import { FileText, Target, Zap, Shield, CheckCircle, ArrowRight } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';

export default function Home() {
  const features = [
    {
      icon: Target,
      title: 'ATS-Optimized',
      description: 'Get higher ATS scores with AI-powered keyword optimization and formatting.',
    },
    {
      icon: Zap,
      title: 'Instant Customization',
      description: 'Tailor your resume for any job in seconds, not hours.',
    },
    {
      icon: Shield,
      title: 'Truth Guard',
      description: 'AI ensures factual accuracy - no fake skills or exaggerated claims.',
    },
    {
      icon: FileText,
      title: 'Version Control',
      description: 'Keep unlimited versions for different jobs. Compare and track changes.',
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
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="max-w-3xl">
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
              Land More Interviews with AI-Powered Resume Customization
            </h1>
            <p className="mt-6 text-xl text-blue-100">
              Tailor your resume for every job application in seconds. Get higher ATS scores,
              match more keywords, and stand out to recruiters.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link
                href="/register"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
              >
                Start Free <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">
              Everything You Need to Land Your Dream Job
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Our AI understands what recruiters and ATS systems look for.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="p-6 bg-gray-50 rounded-xl">
                <feature.icon className="h-12 w-12 text-blue-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
            <p className="mt-4 text-xl text-gray-600">Three simple steps to your tailored resume</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Upload Your Resume</h3>
              <p className="text-gray-600">
                Upload your existing resume in PDF or DOCX format. Our AI will parse and understand
                your experience.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Paste Job Description</h3>
              <p className="text-gray-600">
                Copy and paste the job description you want to apply for. Our AI extracts key
                requirements and keywords.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Get Tailored Resume</h3>
              <p className="text-gray-600">
                Receive an ATS-optimized resume tailored specifically for that job, ready to
                download and submit.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                Built for Job Seekers Who Want Results
              </h2>
              <ul className="space-y-4">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-lg text-gray-600">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-10 lg:mt-0">
              <div className="bg-gray-100 rounded-2xl p-8">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-semibold text-gray-900">ATS Score</span>
                    <span className="text-3xl font-bold text-green-600">92%</span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: '92%' }} />
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-gray-600">12/15 keywords matched</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-gray-600">ATS-safe formatting</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-gray-600">No truth guard warnings</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Land More Interviews?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of job seekers who have improved their interview rates with
            AI-optimized resumes.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
          >
            Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <FileText className="h-8 w-8 text-blue-500" />
              <span className="ml-2 text-xl font-bold text-white">ResumeAI</span>
            </div>
            <div className="text-sm">
              <p className="mb-2">
                This platform does not fabricate experience or guarantee hiring outcomes.
              </p>
              <p>AI-generated content is based solely on user-provided information.</p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} AI Resume & CV Customizer. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
