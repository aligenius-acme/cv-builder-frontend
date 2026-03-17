'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useModal } from '@/hooks/useModal';
import { useRouter, useSearchParams } from 'next/navigation';
import PageHeader from '@/components/shared/PageHeader';
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
  Sparkles,
  Loader2,
  Check,
  X,
  GripVertical,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Github,
  Globe,
  Building2,
  Calendar,
  Link2,
  Languages,
  Heart,
} from 'lucide-react';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import AIWritingAssistant from '@/components/resume/AIWritingAssistant';
import DownloadModal from '@/components/resume/DownloadModal';
import { PhotoUpload } from '@/components/resume/PhotoUpload';
import { cn, getErrorMessage } from '@/lib/utils';
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
  photoUrl?: string;
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

interface VolunteerWork {
  id: string;
  role: string;
  organization: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string[];
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
  volunteerWork: VolunteerWork[];
}

type Section = 'contact' | 'summary' | 'experience' | 'education' | 'skills' | 'certifications' | 'projects' | 'languages' | 'awards' | 'volunteerWork';

export default function ResumeBuilderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resumeId = searchParams.get('id');

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [currentResumeId, setCurrentResumeId] = useState<string | null>(resumeId);
  const [resumeTitle, setResumeTitle] = useState('Untitled Resume');
  const [activeSection, setActiveSection] = useState<Section>('contact');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const downloadModal = useModal();
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
      photoUrl: '',
    },
    summary: '',
    experience: [],
    education: [],
    skills: [],
    certifications: [],
    projects: [],
    languages: [],
    awards: [],
    volunteerWork: [],
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
              // Merge loaded data with defaults to ensure new fields exist
              setResumeData({
                ...response.data.parsedData,
                languages: response.data.parsedData.languages || [],
                awards: response.data.parsedData.awards || [],
                volunteerWork: response.data.parsedData.volunteerWork || [],
              } as unknown as ResumeData);
            }
          }
        }
      } catch (error) {
        toast.error(getErrorMessage(error, 'Failed to load resume'));
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
      toast.error(getErrorMessage(error, 'Failed to create resume'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async (isAutoSave = false) => {
    if (!currentResumeId) {
      // Create resume first, then save data
      try {
        if (!isAutoSave) setIsSaving(true);
        const response = await api.createBlankResume({ title: resumeTitle });
        if (response.success && response.data) {
          const newResumeId = response.data.id;
          setCurrentResumeId(newResumeId);
          router.replace(`/resume-builder?id=${newResumeId}`);

          // Now save the actual data
          await api.updateResumeContent(newResumeId, {
            parsedData: resumeData,
            title: resumeTitle,
            photoUrl: resumeData.contact.photoUrl,
          });
          setHasUnsavedChanges(false);
          toast.success('Resume created and saved!');
        }
      } catch (error) {
        toast.error(getErrorMessage(error, 'Failed to create resume'));
      } finally {
        if (!isAutoSave) setIsSaving(false);
      }
      return;
    }

    try {
      if (!isAutoSave) setIsSaving(true);
      await api.updateResumeContent(currentResumeId, {
        parsedData: resumeData,
        title: resumeTitle,
        photoUrl: resumeData.contact.photoUrl,
      });
      setHasUnsavedChanges(false);
      if (!isAutoSave) {
        toast.success('Resume saved!');
      }
    } catch (error) {
      if (!isAutoSave) toast.error(getErrorMessage(error, 'Failed to save resume'));
    } finally {
      if (!isAutoSave) setIsSaving(false);
    }
  };

  const handleOpenDownloadModal = async () => {
    if (!currentResumeId) {
      toast.error('Please save your resume first');
      return;
    }
    // Save before opening modal to ensure latest data
    await handleSave(true);
    downloadModal.open();
  };

  // Section navigation
  const sections = [
    { id: 'contact' as Section, label: 'Contact', icon: User },
    { id: 'summary' as Section, label: 'Summary', icon: FileText },
    { id: 'experience' as Section, label: 'Experience', icon: Briefcase },
    { id: 'education' as Section, label: 'Education', icon: GraduationCap },
    { id: 'skills' as Section, label: 'Skills', icon: Code },
    { id: 'projects' as Section, label: 'Projects', icon: FolderOpen },
    { id: 'certifications' as Section, label: 'Certifications', icon: Award },
    { id: 'languages' as Section, label: 'Languages', icon: Languages },
    { id: 'awards' as Section, label: 'Awards', icon: Award },
    { id: 'volunteerWork' as Section, label: 'Volunteer Work', icon: Heart },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <LoadingSpinner text="Loading resume builder..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Page Header */}
        <PageHeader
          icon={<Sparkles className="h-5 w-5" />}
          label="Resume Builder"
          title="Build Your Resume"
          description="Create a professional resume with AI-powered suggestions and real-time preview."
          actions={
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSave()}
                disabled={isSaving}
                leftIcon={isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              >
                Save
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleOpenDownloadModal}
                leftIcon={<Download className="h-4 w-4" />}
              >
                Download
              </Button>
            </div>
          }
        />

        {/* Resume Title Bar */}
        <div className="flex items-center gap-3 px-4 py-3 bg-[var(--surface)] rounded-xl border border-[var(--border)]">
          <input
            type="text"
            value={resumeTitle}
            onChange={(e) => {
              setResumeTitle(e.target.value);
              setHasUnsavedChanges(true);
            }}
            className="flex-1 text-lg font-semibold text-slate-900 dark:text-white bg-transparent border-none focus:outline-none focus:ring-0 placeholder:text-slate-400"
            placeholder="Resume Title"
          />
          {hasUnsavedChanges && (
            <Badge variant="warning" size="sm">Unsaved changes</Badge>
          )}
        </div>

        <div className="flex gap-6">
          {/* Section Navigation */}
          <div className="w-48 shrink-0">
            <div className="sticky top-24 space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                    activeSection === section.id
                      ? 'bg-blue-600 text-white'
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
          <div className="flex-1">
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

                {activeSection === 'languages' && (
                  <LanguagesEditor
                    data={resumeData.languages}
                    onChange={(languages) => updateData({ languages })}
                  />
                )}

                {activeSection === 'awards' && (
                  <AwardsEditor
                    data={resumeData.awards}
                    onChange={(awards) => updateData({ awards })}
                  />
                )}

                {activeSection === 'volunteerWork' && (
                  <VolunteerWorkEditor
                    data={resumeData.volunteerWork}
                    onChange={(volunteerWork) => updateData({ volunteerWork })}
                  />
                )}
              </CardContent>
            </Card>
          </div>

        </div>
      </div>

      {/* Download Modal */}
      {currentResumeId && (
        <DownloadModal
          isOpen={downloadModal.isOpen}
          onClose={() => downloadModal.close()}
          resumeId={currentResumeId}
          label={resumeTitle}
        />
      )}
    </div>
  );
}

// Contact Editor Component
function ContactEditor({ data, onChange }: { data: Contact; onChange: (data: Contact) => void }) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-slate-900">Contact Information</h3>

      {/* Photo Upload */}
      <PhotoUpload
        photoUrl={data.photoUrl}
        onPhotoChange={(url) => onChange({ ...data, photoUrl: url || '' })}
      />

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
            placeholder="Ali Yousaf"
            className="w-full px-4 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
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
            placeholder="you@example.com"
            className="w-full px-4 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
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
            placeholder="+44 7700 900000"
            className="w-full px-4 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
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
            placeholder="London, UK"
            className="w-full px-4 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
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
            placeholder="linkedin.com/in/yourname"
            className="w-full px-4 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
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
            placeholder="github.com/yourname"
            className="w-full px-4 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
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
            placeholder="yourname.com"
            className="w-full px-4 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
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
                  <Button variant="ghost" size="icon" className="p-1" onClick={() => moveExperience(index, 'up')} disabled={index === 0}>
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="p-1" onClick={() => moveExperience(index, 'down')} disabled={index === data.length - 1}>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="p-1 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => removeExperience(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
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
                    className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
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
                    className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
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
                    placeholder="London, UK"
                    className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
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
                      className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
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
                      className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
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
                        <Button variant="ghost" size="icon" className="text-red-600 hover:bg-red-50 hover:text-red-700 self-start" onClick={() => removeBullet(index, bIndex)}>
                          <X className="h-4 w-4" />
                        </Button>
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
                <Button variant="ghost" size="icon" className="p-1 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => removeEducation(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
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
                    className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
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
                    className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
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
                    className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
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
                    className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
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
                    className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
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
          className="flex-1 px-4 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
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
                <Button variant="ghost" size="icon" className="p-1 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => removeProject(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
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
                    className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
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
                    className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
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
                    className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
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
          className="flex-1 px-4 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
        />
        <Button variant="outline" onClick={addCertification}>Add</Button>
      </div>
      {data.length > 0 && (
        <ul className="space-y-2">
          {data.map((cert, index) => (
            <li key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-700">{cert}</span>
              <Button variant="ghost" size="icon" className="p-1 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => removeCertification(index)}>
                <X className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Languages Editor Component
function LanguagesEditor({ data, onChange }: { data: string[]; onChange: (data: string[]) => void }) {
  const [newLanguage, setNewLanguage] = useState('');

  const addLanguage = () => {
    if (newLanguage.trim() && !data.includes(newLanguage.trim())) {
      onChange([...data, newLanguage.trim()]);
      setNewLanguage('');
    }
  };

  const removeLanguage = (index: number) => {
    onChange(data.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-900">Languages</h3>
      <p className="text-sm text-slate-500">Add languages you speak and your proficiency level (e.g., "English (Native)", "Spanish (Fluent)")</p>
      <div className="flex gap-2">
        <input
          type="text"
          value={newLanguage}
          onChange={(e) => setNewLanguage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addLanguage())}
          placeholder="e.g., English (Native), Spanish (Fluent)"
          className="flex-1 px-4 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
        />
        <Button variant="outline" onClick={addLanguage}>Add</Button>
      </div>
      {data.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {data.map((language, index) => (
            <Badge key={index} variant="info" size="lg" className="group">
              {language}
              <button
                onClick={() => removeLanguage(index)}
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

// Awards Editor Component
function AwardsEditor({ data, onChange }: { data: string[]; onChange: (data: string[]) => void }) {
  const [newAward, setNewAward] = useState('');

  const addAward = () => {
    if (newAward.trim() && !data.includes(newAward.trim())) {
      onChange([...data, newAward.trim()]);
      setNewAward('');
    }
  };

  const removeAward = (index: number) => {
    onChange(data.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-900">Awards & Honors</h3>
      <p className="text-sm text-slate-500">Add awards, honors, or recognitions you've received</p>
      <div className="flex gap-2">
        <input
          type="text"
          value={newAward}
          onChange={(e) => setNewAward(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAward())}
          placeholder="e.g., Employee of the Year 2023, Dean's List"
          className="flex-1 px-4 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
        />
        <Button variant="outline" onClick={addAward}>Add</Button>
      </div>
      {data.length > 0 && (
        <ul className="space-y-2">
          {data.map((award, index) => (
            <li key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-amber-600" />
                <span className="text-slate-700">{award}</span>
              </div>
              <Button variant="ghost" size="icon" className="p-1 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => removeAward(index)}>
                <X className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Volunteer Work Editor Component
function VolunteerWorkEditor({ data, onChange }: { data: VolunteerWork[]; onChange: (data: VolunteerWork[]) => void }) {
  const addVolunteerWork = () => {
    onChange([
      ...data,
      {
        id: Date.now().toString(),
        role: '',
        organization: '',
        location: '',
        startDate: '',
        endDate: '',
        current: false,
        description: [''],
      },
    ]);
  };

  const updateVolunteerWork = (index: number, updates: Partial<VolunteerWork>) => {
    const newData = [...data];
    newData[index] = { ...newData[index], ...updates };
    onChange(newData);
  };

  const removeVolunteerWork = (index: number) => {
    onChange(data.filter((_, i) => i !== index));
  };

  const moveVolunteerWork = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= data.length) return;
    const newData = [...data];
    [newData[index], newData[newIndex]] = [newData[newIndex], newData[index]];
    onChange(newData);
  };

  const addBullet = (volIndex: number) => {
    const newData = [...data];
    newData[volIndex].description.push('');
    onChange(newData);
  };

  const updateBullet = (volIndex: number, bulletIndex: number, value: string) => {
    const newData = [...data];
    newData[volIndex].description[bulletIndex] = value;
    onChange(newData);
  };

  const removeBullet = (volIndex: number, bulletIndex: number) => {
    const newData = [...data];
    newData[volIndex].description = newData[volIndex].description.filter((_, i) => i !== bulletIndex);
    onChange(newData);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Volunteer Work</h3>
        <Button variant="outline" size="sm" onClick={addVolunteerWork} leftIcon={<Plus className="h-4 w-4" />}>
          Add Volunteer Work
        </Button>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          <Heart className="h-12 w-12 mx-auto mb-3 text-slate-300" />
          <p>No volunteer work added yet</p>
          <Button variant="ghost" size="sm" onClick={addVolunteerWork} className="mt-2">
            Add your volunteer experience
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {data.map((vol, index) => (
            <div key={vol.id} className="p-4 border border-slate-200 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-slate-400" />
                  <span className="font-medium text-slate-900">Volunteer Position {index + 1}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="p-1" onClick={() => moveVolunteerWork(index, 'up')} disabled={index === 0}>
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="p-1" onClick={() => moveVolunteerWork(index, 'down')} disabled={index === data.length - 1}>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="p-1 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => removeVolunteerWork(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    <Heart className="h-4 w-4 inline mr-1" />
                    Role
                  </label>
                  <input
                    type="text"
                    value={vol.role}
                    onChange={(e) => updateVolunteerWork(index, { role: e.target.value })}
                    placeholder="Volunteer Tutor"
                    className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    <Building2 className="h-4 w-4 inline mr-1" />
                    Organization
                  </label>
                  <input
                    type="text"
                    value={vol.organization}
                    onChange={(e) => updateVolunteerWork(index, { organization: e.target.value })}
                    placeholder="Local Community Center"
                    className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    <MapPin className="h-4 w-4 inline mr-1" />
                    Location
                  </label>
                  <input
                    type="text"
                    value={vol.location}
                    onChange={(e) => updateVolunteerWork(index, { location: e.target.value })}
                    placeholder="London, UK"
                    className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
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
                      value={vol.startDate}
                      onChange={(e) => updateVolunteerWork(index, { startDate: e.target.value })}
                      placeholder="Jan 2020"
                      className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      <Calendar className="h-4 w-4 inline mr-1" />
                      End Date
                    </label>
                    <input
                      type="text"
                      value={vol.current ? 'Present' : vol.endDate}
                      onChange={(e) => updateVolunteerWork(index, { endDate: e.target.value, current: e.target.value === 'Present' })}
                      placeholder="Present"
                      className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
                    />
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-slate-700">Responsibilities & Impact</label>
                  <Button variant="ghost" size="sm" onClick={() => addBullet(index)}>
                    <Plus className="h-3 w-3 mr-1" /> Add Bullet
                  </Button>
                </div>
                <div className="space-y-2">
                  {vol.description.map((bullet, bIndex) => (
                    <div key={bIndex} className="flex gap-2">
                      <AIWritingAssistant
                        value={bullet}
                        onChange={(val) => updateBullet(index, bIndex, val)}
                        placeholder="Describe your contribution..."
                        context={{ section: 'volunteerWork', role: vol.role }}
                        className="flex-1"
                        minRows={1}
                        maxRows={3}
                      />
                      {vol.description.length > 1 && (
                        <Button variant="ghost" size="icon" className="text-red-600 hover:bg-red-50 hover:text-red-700 self-start" onClick={() => removeBullet(index, bIndex)}>
                          <X className="h-4 w-4" />
                        </Button>
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
