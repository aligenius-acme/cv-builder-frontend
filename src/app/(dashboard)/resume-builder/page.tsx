'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  User,
  Briefcase,
  GraduationCap,
  Code,
  Award,
  FolderOpen,
  FileText,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Save,
  Download,
  Eye,
  Sparkles,
  Loader2,
  Check,
  X,
  GripVertical,
  Palette,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Github,
  Globe,
  Building2,
  Calendar,
  Link2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import AIWritingAssistant from '@/components/resume/AIWritingAssistant';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { downloadBlob } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Contact {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  website: string;
}

interface Experience {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string[];
}

interface Education {
  id: string;
  degree: string;
  institution: string;
  location: string;
  graduationDate: string;
  gpa: string;
  highlights: string[];
}

interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  url: string;
}

interface ResumeData {
  contact: Contact;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: string[];
  certifications: string[];
  projects: Project[];
  languages: string[];
  awards: string[];
}

type Section = 'contact' | 'summary' | 'experience' | 'education' | 'skills' | 'certifications' | 'projects';

const TEMPLATES = [
  { id: 'london-navy', name: 'London', color: 'Navy', category: 'Professional' },
  { id: 'berlin-slate', name: 'Berlin', color: 'Slate', category: 'Modern' },
  { id: 'tokyo-indigo', name: 'Tokyo', color: 'Indigo', category: 'Creative' },
  { id: 'toronto-emerald', name: 'Toronto', color: 'Emerald', category: 'Simple' },
  { id: 'chicago-sky', name: 'Chicago', color: 'Sky', category: 'Professional' },
  { id: 'amsterdam-violet', name: 'Amsterdam', color: 'Violet', category: 'Modern' },
];

export default function ResumeBuilderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resumeId = searchParams.get('id');

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [currentResumeId, setCurrentResumeId] = useState<string | null>(resumeId);
  const [resumeTitle, setResumeTitle] = useState('Untitled Resume');
  const [selectedTemplate, setSelectedTemplate] = useState('london-navy');
  const [activeSection, setActiveSection] = useState<Section>('contact');
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);

  const [resumeData, setResumeData] = useState<ResumeData>({
    contact: {
      name: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      github: '',
      website: '',
    },
    summary: '',
    experience: [],
    education: [],
    skills: [],
    certifications: [],
    projects: [],
    languages: [],
    awards: [],
  });

  // Load existing resume or create new one
  useEffect(() => {
    const initResume = async () => {
      try {
        if (resumeId) {
          // Load existing resume
          const response = await api.getResume(resumeId);
          if (response.success && response.data) {
            setCurrentResumeId(resumeId);
            setResumeTitle(response.data.title || 'Untitled Resume');
            if (response.data.parsedData) {
              setResumeData(response.data.parsedData as ResumeData);
            }
          }
        }
      } catch (error) {
        toast.error('Failed to load resume');
      } finally {
        setIsLoading(false);
      }
    };

    initResume();
  }, [resumeId]);

  // Auto-save functionality
  useEffect(() => {
    if (hasUnsavedChanges && currentResumeId) {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
      autoSaveTimer.current = setTimeout(() => {
        handleSave(true);
      }, 3000);
    }

    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
    };
  }, [hasUnsavedChanges, resumeData, currentResumeId]);

  const updateData = (updates: Partial<ResumeData>) => {
    setResumeData((prev) => ({ ...prev, ...updates }));
    setHasUnsavedChanges(true);
  };

  const handleCreateResume = async () => {
    try {
      setIsSaving(true);
      const response = await api.createBlankResume({ title: resumeTitle });
      if (response.success && response.data) {
        setCurrentResumeId(response.data.id);
        router.replace(`/resume-builder?id=${response.data.id}`);
        toast.success('Resume created!');
      }
    } catch (error) {
      toast.error('Failed to create resume');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async (isAutoSave = false) => {
    if (!currentResumeId) {
      // Create resume first
      await handleCreateResume();
      return;
    }

    try {
      if (!isAutoSave) setIsSaving(true);
      await api.updateResumeContent(currentResumeId, {
        parsedData: resumeData,
        title: resumeTitle,
      });
      setHasUnsavedChanges(false);
      if (!isAutoSave) {
        toast.success('Resume saved!');
        // Refresh preview after manual save
        if (showPreview) {
          loadPreview();
        }
      }
    } catch (error) {
      if (!isAutoSave) toast.error('Failed to save resume');
    } finally {
      if (!isAutoSave) setIsSaving(false);
    }
  };

  const handleDownload = async (format: 'pdf' | 'docx') => {
    if (!currentResumeId) {
      toast.error('Please save your resume first');
      return;
    }

    try {
      const blob = await api.downloadBuiltResume(currentResumeId, format, selectedTemplate);
      downloadBlob(blob, `${resumeTitle}.${format}`);
      toast.success('Download started!');
    } catch (error) {
      toast.error('Failed to download resume');
    }
  };

  const loadPreview = async () => {
    if (!currentResumeId) return;

    setIsLoadingPreview(true);
    try {
      // Save first to ensure preview is up to date
      await handleSave(true);
      const blob = await api.previewBuiltResume(currentResumeId, selectedTemplate);
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
    } catch (error) {
      toast.error('Failed to load preview');
    } finally {
      setIsLoadingPreview(false);
    }
  };

  useEffect(() => {
    if (showPreview && currentResumeId) {
      loadPreview();
    }
  }, [showPreview, selectedTemplate, currentResumeId]);

  // Section navigation
  const sections = [
    { id: 'contact' as Section, label: 'Contact', icon: User },
    { id: 'summary' as Section, label: 'Summary', icon: FileText },
    { id: 'experience' as Section, label: 'Experience', icon: Briefcase },
    { id: 'education' as Section, label: 'Education', icon: GraduationCap },
    { id: 'skills' as Section, label: 'Skills', icon: Code },
    { id: 'projects' as Section, label: 'Projects', icon: FolderOpen },
    { id: 'certifications' as Section, label: 'Certifications', icon: Award },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-mesh flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
          <p className="text-slate-500">Loading resume builder...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mesh">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <input
              type="text"
              value={resumeTitle}
              onChange={(e) => {
                setResumeTitle(e.target.value);
                setHasUnsavedChanges(true);
              }}
              className="text-xl font-bold text-slate-900 bg-transparent border-none focus:outline-none focus:ring-0"
              placeholder="Resume Title"
            />
            {hasUnsavedChanges && (
              <Badge variant="warning" size="sm">Unsaved changes</Badge>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTemplates(!showTemplates)}
              leftIcon={<Palette className="h-4 w-4" />}
            >
              Template
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
              leftIcon={<Eye className="h-4 w-4" />}
            >
              {showPreview ? 'Hide Preview' : 'Preview'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSave()}
              disabled={isSaving}
              leftIcon={isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            >
              Save
            </Button>
            <div className="relative group">
              <Button
                variant="gradient"
                size="sm"
                leftIcon={<Download className="h-4 w-4" />}
              >
                Download
              </Button>
              <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-slate-200 py-1 hidden group-hover:block min-w-[120px]">
                <button
                  onClick={() => handleDownload('pdf')}
                  className="w-full px-4 py-2 text-sm text-left hover:bg-slate-50"
                >
                  Download PDF
                </button>
                <button
                  onClick={() => handleDownload('docx')}
                  className="w-full px-4 py-2 text-sm text-left hover:bg-slate-50"
                >
                  Download DOCX
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Template Selector */}
        {showTemplates && (
          <div className="border-t border-slate-200 bg-slate-50 p-4">
            <div className="max-w-7xl mx-auto">
              <p className="text-sm font-medium text-slate-700 mb-3">Select Template</p>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template.id)}
                    className={cn(
                      'px-4 py-2 rounded-lg border-2 text-sm whitespace-nowrap transition-all',
                      selectedTemplate === template.id
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    )}
                  >
                    {template.name} - {template.color}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hero Banner */}
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 p-6 text-white mb-6">
          <div className="absolute inset-0 opacity-30" style={{backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"}} />
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Resume Builder</h2>
              <p className="text-white/80 text-sm">
                Create a professional resume with AI-powered suggestions and real-time preview
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-6">
        <div className="flex gap-6">
          {/* Section Navigation */}
          <div className="w-48 shrink-0">
            <div className="sticky top-32 space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                    activeSection === section.id
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  )}
                >
                  <section.icon className="h-4 w-4" />
                  {section.label}
                </button>
              ))}
            </div>
          </div>

          {/* Editor */}
          <div className={cn('flex-1', showPreview && 'max-w-xl')}>
            <Card variant="elevated">
              <CardContent className="p-6">
                {activeSection === 'contact' && (
                  <ContactEditor
                    data={resumeData.contact}
                    onChange={(contact) => updateData({ contact })}
                  />
                )}

                {activeSection === 'summary' && (
                  <SummaryEditor
                    data={resumeData.summary}
                    onChange={(summary) => updateData({ summary })}
                  />
                )}

                {activeSection === 'experience' && (
                  <ExperienceEditor
                    data={resumeData.experience}
                    onChange={(experience) => updateData({ experience })}
                  />
                )}

                {activeSection === 'education' && (
                  <EducationEditor
                    data={resumeData.education}
                    onChange={(education) => updateData({ education })}
                  />
                )}

                {activeSection === 'skills' && (
                  <SkillsEditor
                    data={resumeData.skills}
                    onChange={(skills) => updateData({ skills })}
                  />
                )}

                {activeSection === 'projects' && (
                  <ProjectsEditor
                    data={resumeData.projects}
                    onChange={(projects) => updateData({ projects })}
                  />
                )}

                {activeSection === 'certifications' && (
                  <CertificationsEditor
                    data={resumeData.certifications}
                    onChange={(certifications) => updateData({ certifications })}
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Preview */}
          {showPreview && (
            <div className="w-96 shrink-0">
              <div className="sticky top-32">
                <Card variant="elevated">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-slate-700">Preview</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={loadPreview}
                        disabled={isLoadingPreview}
                      >
                        {isLoadingPreview ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Refresh'}
                      </Button>
                    </div>
                    {isLoadingPreview ? (
                      <div className="h-[500px] flex items-center justify-center bg-slate-50 rounded-lg">
                        <Loader2 className="h-6 w-6 text-indigo-600 animate-spin" />
                      </div>
                    ) : previewUrl ? (
                      <iframe
                        src={previewUrl}
                        className="w-full h-[500px] rounded-lg border border-slate-200"
                      />
                    ) : (
                      <div className="h-[500px] flex items-center justify-center bg-slate-50 rounded-lg text-slate-500 text-sm">
                        Save to see preview
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Contact Editor Component
function ContactEditor({ data, onChange }: { data: Contact; onChange: (data: Contact) => void }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-900">Contact Information</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            <User className="h-4 w-4 inline mr-1" />
            Full Name
          </label>
          <input
            type="text"
            value={data.name}
            onChange={(e) => onChange({ ...data, name: e.target.value })}
            placeholder="John Doe"
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            <Mail className="h-4 w-4 inline mr-1" />
            Email
          </label>
          <input
            type="email"
            value={data.email}
            onChange={(e) => onChange({ ...data, email: e.target.value })}
            placeholder="john@example.com"
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            <Phone className="h-4 w-4 inline mr-1" />
            Phone
          </label>
          <input
            type="tel"
            value={data.phone}
            onChange={(e) => onChange({ ...data, phone: e.target.value })}
            placeholder="+1 (555) 123-4567"
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            <MapPin className="h-4 w-4 inline mr-1" />
            Location
          </label>
          <input
            type="text"
            value={data.location}
            onChange={(e) => onChange({ ...data, location: e.target.value })}
            placeholder="San Francisco, CA"
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            <Linkedin className="h-4 w-4 inline mr-1" />
            LinkedIn
          </label>
          <input
            type="url"
            value={data.linkedin}
            onChange={(e) => onChange({ ...data, linkedin: e.target.value })}
            placeholder="linkedin.com/in/johndoe"
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            <Github className="h-4 w-4 inline mr-1" />
            GitHub
          </label>
          <input
            type="url"
            value={data.github}
            onChange={(e) => onChange({ ...data, github: e.target.value })}
            placeholder="github.com/johndoe"
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            <Globe className="h-4 w-4 inline mr-1" />
            Website/Portfolio
          </label>
          <input
            type="url"
            value={data.website}
            onChange={(e) => onChange({ ...data, website: e.target.value })}
            placeholder="johndoe.com"
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>
    </div>
  );
}

// Summary Editor Component
function SummaryEditor({ data, onChange }: { data: string; onChange: (data: string) => void }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-900">Professional Summary</h3>
      <p className="text-sm text-slate-500">Write a brief summary of your professional background and key strengths.</p>
      <AIWritingAssistant
        value={data}
        onChange={onChange}
        placeholder="A results-driven professional with 5+ years of experience..."
        context={{ section: 'summary' }}
        minRows={4}
        maxRows={8}
      />
    </div>
  );
}

// Experience Editor Component
function ExperienceEditor({ data, onChange }: { data: Experience[]; onChange: (data: Experience[]) => void }) {
  const addExperience = () => {
    onChange([
      ...data,
      {
        id: Date.now().toString(),
        title: '',
        company: '',
        location: '',
        startDate: '',
        endDate: '',
        current: false,
        description: [''],
      },
    ]);
  };

  const updateExperience = (index: number, updates: Partial<Experience>) => {
    const newData = [...data];
    newData[index] = { ...newData[index], ...updates };
    onChange(newData);
  };

  const removeExperience = (index: number) => {
    onChange(data.filter((_, i) => i !== index));
  };

  const moveExperience = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= data.length) return;
    const newData = [...data];
    [newData[index], newData[newIndex]] = [newData[newIndex], newData[index]];
    onChange(newData);
  };

  const addBullet = (expIndex: number) => {
    const newData = [...data];
    newData[expIndex].description.push('');
    onChange(newData);
  };

  const updateBullet = (expIndex: number, bulletIndex: number, value: string) => {
    const newData = [...data];
    newData[expIndex].description[bulletIndex] = value;
    onChange(newData);
  };

  const removeBullet = (expIndex: number, bulletIndex: number) => {
    const newData = [...data];
    newData[expIndex].description = newData[expIndex].description.filter((_, i) => i !== bulletIndex);
    onChange(newData);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Work Experience</h3>
        <Button variant="outline" size="sm" onClick={addExperience} leftIcon={<Plus className="h-4 w-4" />}>
          Add Experience
        </Button>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          <Briefcase className="h-12 w-12 mx-auto mb-3 text-slate-300" />
          <p>No experience added yet</p>
          <Button variant="ghost" size="sm" onClick={addExperience} className="mt-2">
            Add your first experience
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {data.map((exp, index) => (
            <div key={exp.id} className="p-4 border border-slate-200 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-slate-400" />
                  <span className="font-medium text-slate-900">Position {index + 1}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => moveExperience(index, 'up')}
                    disabled={index === 0}
                    className="p-1 hover:bg-slate-100 rounded disabled:opacity-50"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => moveExperience(index, 'down')}
                    disabled={index === data.length - 1}
                    className="p-1 hover:bg-slate-100 rounded disabled:opacity-50"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => removeExperience(index)}
                    className="p-1 hover:bg-red-100 rounded text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    <Briefcase className="h-4 w-4 inline mr-1" />
                    Job Title
                  </label>
                  <input
                    type="text"
                    value={exp.title}
                    onChange={(e) => updateExperience(index, { title: e.target.value })}
                    placeholder="Software Engineer"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    <Building2 className="h-4 w-4 inline mr-1" />
                    Company
                  </label>
                  <input
                    type="text"
                    value={exp.company}
                    onChange={(e) => updateExperience(index, { company: e.target.value })}
                    placeholder="Google"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    <MapPin className="h-4 w-4 inline mr-1" />
                    Location
                  </label>
                  <input
                    type="text"
                    value={exp.location}
                    onChange={(e) => updateExperience(index, { location: e.target.value })}
                    placeholder="San Francisco, CA"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      <Calendar className="h-4 w-4 inline mr-1" />
                      Start Date
                    </label>
                    <input
                      type="text"
                      value={exp.startDate}
                      onChange={(e) => updateExperience(index, { startDate: e.target.value })}
                      placeholder="Jan 2020"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      <Calendar className="h-4 w-4 inline mr-1" />
                      End Date
                    </label>
                    <input
                      type="text"
                      value={exp.current ? 'Present' : exp.endDate}
                      onChange={(e) => updateExperience(index, { endDate: e.target.value, current: e.target.value === 'Present' })}
                      placeholder="Present"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-slate-700">Key Achievements</label>
                  <Button variant="ghost" size="sm" onClick={() => addBullet(index)}>
                    <Plus className="h-3 w-3 mr-1" /> Add Bullet
                  </Button>
                </div>
                <div className="space-y-2">
                  {exp.description.map((bullet, bIndex) => (
                    <div key={bIndex} className="flex gap-2">
                      <AIWritingAssistant
                        value={bullet}
                        onChange={(val) => updateBullet(index, bIndex, val)}
                        placeholder="Describe your achievement..."
                        context={{ section: 'experience', jobTitle: exp.title }}
                        className="flex-1"
                        minRows={1}
                        maxRows={3}
                      />
                      {exp.description.length > 1 && (
                        <button
                          onClick={() => removeBullet(index, bIndex)}
                          className="p-2 hover:bg-red-100 rounded text-red-600 self-start"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Education Editor Component
function EducationEditor({ data, onChange }: { data: Education[]; onChange: (data: Education[]) => void }) {
  const addEducation = () => {
    onChange([
      ...data,
      {
        id: Date.now().toString(),
        degree: '',
        institution: '',
        location: '',
        graduationDate: '',
        gpa: '',
        highlights: [],
      },
    ]);
  };

  const updateEducation = (index: number, updates: Partial<Education>) => {
    const newData = [...data];
    newData[index] = { ...newData[index], ...updates };
    onChange(newData);
  };

  const removeEducation = (index: number) => {
    onChange(data.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Education</h3>
        <Button variant="outline" size="sm" onClick={addEducation} leftIcon={<Plus className="h-4 w-4" />}>
          Add Education
        </Button>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          <GraduationCap className="h-12 w-12 mx-auto mb-3 text-slate-300" />
          <p>No education added yet</p>
          <Button variant="ghost" size="sm" onClick={addEducation} className="mt-2">
            Add your education
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((edu, index) => (
            <div key={edu.id} className="p-4 border border-slate-200 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-900">Education {index + 1}</span>
                <button
                  onClick={() => removeEducation(index)}
                  className="p-1 hover:bg-red-100 rounded text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    <GraduationCap className="h-4 w-4 inline mr-1" />
                    Degree
                  </label>
                  <input
                    type="text"
                    value={edu.degree}
                    onChange={(e) => updateEducation(index, { degree: e.target.value })}
                    placeholder="Bachelor of Science in Computer Science"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    <Building2 className="h-4 w-4 inline mr-1" />
                    Institution
                  </label>
                  <input
                    type="text"
                    value={edu.institution}
                    onChange={(e) => updateEducation(index, { institution: e.target.value })}
                    placeholder="Stanford University"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    Graduation Date
                  </label>
                  <input
                    type="text"
                    value={edu.graduationDate}
                    onChange={(e) => updateEducation(index, { graduationDate: e.target.value })}
                    placeholder="May 2020"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    <MapPin className="h-4 w-4 inline mr-1" />
                    Location
                  </label>
                  <input
                    type="text"
                    value={edu.location}
                    onChange={(e) => updateEducation(index, { location: e.target.value })}
                    placeholder="Stanford, CA"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    <Award className="h-4 w-4 inline mr-1" />
                    GPA (optional)
                  </label>
                  <input
                    type="text"
                    value={edu.gpa}
                    onChange={(e) => updateEducation(index, { gpa: e.target.value })}
                    placeholder="3.8/4.0"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Skills Editor Component
function SkillsEditor({ data, onChange }: { data: string[]; onChange: (data: string[]) => void }) {
  const [newSkill, setNewSkill] = useState('');

  const addSkill = () => {
    if (newSkill.trim() && !data.includes(newSkill.trim())) {
      onChange([...data, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (index: number) => {
    onChange(data.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-900">Skills</h3>
      <div className="flex gap-2">
        <input
          type="text"
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
          placeholder="Add a skill (e.g., JavaScript, Project Management)"
          className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <Button variant="outline" onClick={addSkill}>Add</Button>
      </div>
      {data.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {data.map((skill, index) => (
            <Badge key={index} variant="info" size="lg" className="group">
              {skill}
              <button
                onClick={() => removeSkill(index)}
                className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

// Projects Editor Component
function ProjectsEditor({ data, onChange }: { data: Project[]; onChange: (data: Project[]) => void }) {
  const addProject = () => {
    onChange([
      ...data,
      {
        id: Date.now().toString(),
        name: '',
        description: '',
        technologies: [],
        url: '',
      },
    ]);
  };

  const updateProject = (index: number, updates: Partial<Project>) => {
    const newData = [...data];
    newData[index] = { ...newData[index], ...updates };
    onChange(newData);
  };

  const removeProject = (index: number) => {
    onChange(data.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Projects</h3>
        <Button variant="outline" size="sm" onClick={addProject} leftIcon={<Plus className="h-4 w-4" />}>
          Add Project
        </Button>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          <FolderOpen className="h-12 w-12 mx-auto mb-3 text-slate-300" />
          <p>No projects added yet</p>
          <Button variant="ghost" size="sm" onClick={addProject} className="mt-2">
            Add your first project
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((project, index) => (
            <div key={project.id} className="p-4 border border-slate-200 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-900">Project {index + 1}</span>
                <button
                  onClick={() => removeProject(index)}
                  className="p-1 hover:bg-red-100 rounded text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    <FolderOpen className="h-4 w-4 inline mr-1" />
                    Project Name
                  </label>
                  <input
                    type="text"
                    value={project.name}
                    onChange={(e) => updateProject(index, { name: e.target.value })}
                    placeholder="My Awesome Project"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    <Link2 className="h-4 w-4 inline mr-1" />
                    URL (optional)
                  </label>
                  <input
                    type="url"
                    value={project.url}
                    onChange={(e) => updateProject(index, { url: e.target.value })}
                    placeholder="github.com/user/project"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    <FileText className="h-4 w-4 inline mr-1" />
                    Description
                  </label>
                  <AIWritingAssistant
                    value={project.description}
                    onChange={(val) => updateProject(index, { description: val })}
                    placeholder="Describe your project..."
                    context={{ section: 'experience' }}
                    minRows={2}
                    maxRows={4}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    <Code className="h-4 w-4 inline mr-1" />
                    Technologies
                  </label>
                  <input
                    type="text"
                    value={project.technologies.join(', ')}
                    onChange={(e) => updateProject(index, { technologies: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                    placeholder="React, Node.js, PostgreSQL"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Certifications Editor Component
function CertificationsEditor({ data, onChange }: { data: string[]; onChange: (data: string[]) => void }) {
  const [newCert, setNewCert] = useState('');

  const addCertification = () => {
    if (newCert.trim() && !data.includes(newCert.trim())) {
      onChange([...data, newCert.trim()]);
      setNewCert('');
    }
  };

  const removeCertification = (index: number) => {
    onChange(data.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-900">Certifications</h3>
      <div className="flex gap-2">
        <input
          type="text"
          value={newCert}
          onChange={(e) => setNewCert(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCertification())}
          placeholder="Add a certification (e.g., AWS Solutions Architect)"
          className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <Button variant="outline" onClick={addCertification}>Add</Button>
      </div>
      {data.length > 0 && (
        <ul className="space-y-2">
          {data.map((cert, index) => (
            <li key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-700">{cert}</span>
              <button
                onClick={() => removeCertification(index)}
                className="p-1 hover:bg-red-100 rounded text-red-600"
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
