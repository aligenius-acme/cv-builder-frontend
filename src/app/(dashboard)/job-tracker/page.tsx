'use client';

import { useState, useCallback, useEffect } from 'react';
import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import {
  Plus,
  Briefcase,
  Building2,
  MapPin,
  DollarSign,
  Calendar,
  Clock,
  MoreVertical,
  Trash2,
  Edit2,
  ExternalLink,
  X,
  GripVertical,
  ChevronRight,
  User,
  Mail,
  FileText,
  MessageSquare,
  Target,
  TrendingUp,
  AlertCircle,
  Search,
  Link2,
  Filter,
  Flag,
  Check,
} from 'lucide-react';
import api, { JobApplication, JobActivity } from '@/lib/api';
import toast from 'react-hot-toast';
import { formatDate, getErrorMessage } from '@/lib/utils';
import { useFetchData } from '@/hooks/useFetchData';
import { useModal } from '@/hooks/useModal';

type ApplicationStatus = JobApplication['status'];

const STATUS_CONFIG: Record<ApplicationStatus, { label: string; color: string; bgColor: string }> = {
  WISHLIST: { label: 'Wishlist', color: 'text-slate-600', bgColor: 'bg-slate-100' },
  APPLIED: { label: 'Applied', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  SCREENING: { label: 'Screening', color: 'text-purple-600', bgColor: 'bg-purple-100' },
  INTERVIEWING: { label: 'Interviewing', color: 'text-amber-600', bgColor: 'bg-amber-100' },
  OFFER: { label: 'Offer', color: 'text-emerald-600', bgColor: 'bg-emerald-100' },
  REJECTED: { label: 'Rejected', color: 'text-red-600', bgColor: 'bg-red-100' },
  ACCEPTED: { label: 'Accepted', color: 'text-green-600', bgColor: 'bg-green-100' },
  WITHDRAWN: { label: 'Withdrawn', color: 'text-gray-600', bgColor: 'bg-gray-100' },
};

const VISIBLE_COLUMNS: ApplicationStatus[] = ['WISHLIST', 'APPLIED', 'SCREENING', 'INTERVIEWING', 'OFFER'];

export default function JobTrackerPage() {
  // Use useFetchData hook - replaces 20+ lines!
  const { data: jobData, isLoading, refetch, setData: setJobData } = useFetchData<{
    applications: JobApplication[];
    grouped: Record<string, JobApplication[]>;
    stats: any;
  }>({
    fetchFn: () => api.getJobApplications(),
    errorMessage: 'Failed to load applications',
  });

  const applications = jobData?.applications || [];
  const grouped = jobData?.grouped || {};
  const stats = jobData?.stats || null;
  const loadApplications = useCallback(() => refetch(), [refetch]);

  const addModal = useModal();
  const detailsPanel = useModal();
  const [selectedApp, setSelectedApp] = useState<JobApplication | null>(null);
  const [editingApp, setEditingApp] = useState<Partial<JobApplication> | null>(null);
  const [draggedItem, setDraggedItem] = useState<JobApplication | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleDragStart = (e: React.DragEvent, app: JobApplication) => {
    setDraggedItem(app);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', app.id);
  };

  const handleDragOver = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(status);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = async (e: React.DragEvent, newStatus: ApplicationStatus) => {
    e.preventDefault();
    setDragOverColumn(null);

    if (!draggedItem || draggedItem.status === newStatus) {
      setDraggedItem(null);
      return;
    }

    // Optimistic update
    const updatedApp = { ...draggedItem, status: newStatus };
    setJobData(prev => {
      if (!prev) return prev;
      const newGrouped = { ...prev.grouped };
      newGrouped[draggedItem.status] = (prev.grouped[draggedItem.status] || []).filter(a => a.id !== draggedItem.id);
      newGrouped[newStatus] = [...(prev.grouped[newStatus] || []), updatedApp];
      return {
        ...prev,
        grouped: newGrouped,
        applications: prev.applications.map(a => a.id === draggedItem.id ? updatedApp : a)
      };
    });

    try {
      await api.updateJobApplicationStatus(draggedItem.id, newStatus);
      toast.success(`Moved to ${STATUS_CONFIG[newStatus].label}`);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to update status'));
      loadApplications();
    }

    setDraggedItem(null);
  };

  const handleAddApplication = async (data: Partial<JobApplication>) => {
    try {
      const response = await api.createJobApplication(data);
      if (response.success) {
        toast.success('Application added');
        loadApplications();
        addModal.close();
        setEditingApp(null);
      }
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to add application'));
    }
  };

  const handleUpdateApplication = async (id: string, data: Partial<JobApplication>) => {
    try {
      const response = await api.updateJobApplication(id, data);
      if (response.success) {
        toast.success('Application updated');
        loadApplications();
        if (selectedApp?.id === id && response.data) {
          setSelectedApp(response.data);
        }
        setEditingApp(null);
      }
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to update application'));
    }
  };

  const handleDeleteApplication = async (id: string) => {
    if (!confirm('Are you sure you want to delete this application?')) return;

    try {
      await api.deleteJobApplication(id);
      toast.success('Application deleted');
      loadApplications();
      if (selectedApp?.id === id) {
        setSelectedApp(null);
        detailsPanel.close();
      }
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to delete application'));
    }
  };

  const openDetails = (app: JobApplication) => {
    setSelectedApp(app);
    detailsPanel.open();
  };

  // Filter applications by search query
  const filteredGrouped = Object.entries(grouped).reduce((acc, [status, apps]) => {
    const filtered = (apps || []).filter((app) =>
      app.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.companyName.toLowerCase().includes(searchQuery.toLowerCase())
    );
    acc[status] = filtered;
    return acc;
  }, {} as Record<string, JobApplication[]>);

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <PageHeader
          icon={<Target className="h-5 w-5" />}
          label="Application Management"
          title="Job Tracker"
          description="Track your job applications from wishlist to offer. Drag and drop cards between columns to update status instantly."
          actions={
            <Button
              variant="primary"
              size="md"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => {
                setEditingApp({});
                addModal.open();
              }}
            >
              Add Application
            </Button>
          }
        />

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by job title or company..."
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-slate-400"
          />
        </div>

        {/* Stats Row */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <Card variant="elevated" className="text-center">
              <CardContent className="py-4">
                <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                <p className="text-xs text-slate-500">Total</p>
              </CardContent>
            </Card>
            <Card variant="elevated" className="text-center">
              <CardContent className="py-4">
                <p className="text-2xl font-bold text-slate-600">{stats.wishlist}</p>
                <p className="text-xs text-slate-500">Wishlist</p>
              </CardContent>
            </Card>
            <Card variant="elevated" className="text-center">
              <CardContent className="py-4">
                <p className="text-2xl font-bold text-blue-600">{stats.applied}</p>
                <p className="text-xs text-slate-500">Applied</p>
              </CardContent>
            </Card>
            <Card variant="elevated" className="text-center">
              <CardContent className="py-4">
                <p className="text-2xl font-bold text-amber-600">{stats.interviewing}</p>
                <p className="text-xs text-slate-500">Interviewing</p>
              </CardContent>
            </Card>
            <Card variant="elevated" className="text-center">
              <CardContent className="py-4">
                <p className="text-2xl font-bold text-emerald-600">{stats.offers}</p>
                <p className="text-xs text-slate-500">Offers</p>
              </CardContent>
            </Card>
            <Card variant="elevated" className="text-center">
              <CardContent className="py-4">
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                <p className="text-xs text-slate-500">Rejected</p>
              </CardContent>
            </Card>
            <Card variant="elevated" className="text-center">
              <CardContent className="py-4">
                <p className="text-2xl font-bold text-green-600">{stats.accepted}</p>
                <p className="text-xs text-slate-500">Accepted</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Kanban Board */}
        <div className="flex gap-4 overflow-x-auto pb-4">
          {VISIBLE_COLUMNS.map((status) => (
            <div
              key={status}
              className={`flex-shrink-0 w-72 ${
                dragOverColumn === status ? 'ring-2 ring-indigo-400 ring-offset-2' : ''
              }`}
              onDragOver={(e) => handleDragOver(e, status)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, status)}
            >
              <div className={`rounded-t-xl px-4 py-3 ${STATUS_CONFIG[status].bgColor}`}>
                <div className="flex items-center justify-between">
                  <h3 className={`font-semibold ${STATUS_CONFIG[status].color}`}>
                    {STATUS_CONFIG[status].label}
                  </h3>
                  <Badge variant="default" size="sm">
                    {filteredGrouped[status]?.length || 0}
                  </Badge>
                </div>
              </div>
              <div className="bg-slate-50/50 rounded-b-xl p-2 min-h-[400px] space-y-2">
                {isLoading ? (
                  <div className="space-y-2">
                    {[1, 2].map((i) => (
                      <div key={i} className="bg-white rounded-lg p-4 animate-pulse">
                        <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
                        <div className="h-3 bg-slate-200 rounded w-1/2" />
                      </div>
                    ))}
                  </div>
                ) : (
                  filteredGrouped[status]?.map((app) => (
                    <div
                      key={app.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, app)}
                      onClick={() => openDetails(app)}
                      className={`bg-white rounded-lg p-4 shadow-sm border border-slate-200 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all group ${
                        draggedItem?.id === app.id ? 'opacity-50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <GripVertical className="h-4 w-4 text-slate-300 mt-1 opacity-0 group-hover:opacity-100 cursor-grab" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-slate-900 truncate">{app.jobTitle}</h4>
                          <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                            <Building2 className="h-3 w-3" />
                            {app.companyName}
                          </p>
                          {app.location && (
                            <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                              <MapPin className="h-3 w-3" />
                              {app.location}
                            </p>
                          )}
                          {app.salary && (
                            <p className="text-xs text-emerald-600 flex items-center gap-1 mt-1">
                              <DollarSign className="h-3 w-3" />
                              {app.salary}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            {app.deadline && new Date(app.deadline) > new Date() && (
                              <Badge variant="warning" size="sm">
                                <Calendar className="h-3 w-3 mr-1" />
                                {formatDate(app.deadline)}
                              </Badge>
                            )}
                            {app.interviewDate && new Date(app.interviewDate) > new Date() && (
                              <Badge variant="info" size="sm">
                                <Clock className="h-3 w-3 mr-1" />
                                Interview
                              </Badge>
                            )}
                            {app.priority > 0 && (
                              <Badge variant={app.priority > 1 ? 'error' : 'warning'} size="sm">
                                {app.priority > 1 ? 'Urgent' : 'High'}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                {!isLoading && (!filteredGrouped[status] || filteredGrouped[status].length === 0) && (
                  <div className="text-center py-8 text-slate-400">
                    <Briefcase className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No applications</p>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Collapsed columns for rejected/accepted/withdrawn */}
          <div className="flex-shrink-0 w-48">
            <div className="space-y-2">
              {(['REJECTED', 'ACCEPTED', 'WITHDRAWN'] as ApplicationStatus[]).map((status) => (
                <div
                  key={status}
                  className={`rounded-xl px-4 py-3 ${STATUS_CONFIG[status].bgColor} cursor-pointer hover:opacity-80 transition-opacity`}
                  onDragOver={(e) => handleDragOver(e, status)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, status)}
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-medium text-sm ${STATUS_CONFIG[status].color}`}>
                      {STATUS_CONFIG[status].label}
                    </span>
                    <Badge variant="default" size="sm">
                      {filteredGrouped[status]?.length || 0}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {addModal.isOpen && (
        <ApplicationModal
          application={editingApp}
          onSave={(data) => {
            if (editingApp?.id) {
              handleUpdateApplication(editingApp.id, data);
            } else {
              handleAddApplication(data);
            }
          }}
          onClose={() => {
            addModal.close();
            setEditingApp(null);
          }}
        />
      )}

      {/* Details Panel */}
      {detailsPanel.isOpen && selectedApp && (
        <DetailsPanel
          application={selectedApp}
          onClose={() => {
            detailsPanel.close();
            setSelectedApp(null);
          }}
          onEdit={() => {
            setEditingApp(selectedApp);
            addModal.open();
          }}
          onDelete={() => handleDeleteApplication(selectedApp.id)}
          onUpdate={(data) => handleUpdateApplication(selectedApp.id, data)}
        />
      )}
    </div>
  );
}

// Application Modal Component
function ApplicationModal({
  application,
  onSave,
  onClose,
}: {
  application: Partial<JobApplication> | null;
  onSave: (data: Partial<JobApplication>) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState<Partial<JobApplication>>(
    application || {
      jobTitle: '',
      companyName: '',
      location: '',
      salary: '',
      jobUrl: '',
      jobDescription: '',
      status: 'WISHLIST',
      source: '',
      priority: 0,
      notes: '',
      contactName: '',
      contactEmail: '',
    }
  );

  // Saved jobs state
  const [jobInputMode, setJobInputMode] = useState<'saved' | 'manual'>('manual');
  const [savedJobs, setSavedJobs] = useState<any[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [isLoadingSavedJobs, setIsLoadingSavedJobs] = useState(false);

  // Load saved jobs on mount (only if not editing existing application)
  useEffect(() => {
    if (!application?.id) {
      loadSavedJobs();
    }
  }, [application?.id]);

  const loadSavedJobs = async () => {
    setIsLoadingSavedJobs(true);
    try {
      const response = await api.getSavedJobs();
      if (response.success && response.data) {
        setSavedJobs(response.data.jobs);
        if (response.data.jobs.length > 0) {
          setJobInputMode('saved');
        }
      }
    } catch (error) {
      // Silent fail, fallback to manual mode
      setJobInputMode('manual');
    } finally {
      setIsLoadingSavedJobs(false);
    }
  };

  const handleSelectSavedJob = (jobId: string) => {
    setSelectedJobId(jobId);
    const job = savedJobs.find(j => j.id === jobId);
    if (job) {
      setFormData({
        ...formData,
        jobTitle: job.title || '',
        companyName: job.company || '',
        location: job.location || '',
        salary: job.salary || '',
        jobUrl: job.url || '',
        jobDescription: job.description || '',
        source: job.source || 'Saved Jobs',
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">
            {application?.id ? 'Edit Application' : 'Add Application'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Job Source Selection - Only show when adding new application */}
          {!application?.id && savedJobs.length > 0 && (
            <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-700">Import from Saved Jobs</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setJobInputMode('saved')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                      jobInputMode === 'saved'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    Saved Jobs
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setJobInputMode('manual');
                      setSelectedJobId('');
                    }}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                      jobInputMode === 'manual'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    Manual Entry
                  </button>
                </div>
              </div>

              {jobInputMode === 'saved' && (
                <div>
                  {isLoadingSavedJobs ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="flex items-center gap-2 text-slate-500">
                        <div className="w-4 h-4 border-2 border-slate-300 border-t-indigo-600 rounded-full animate-spin"></div>
                        <span className="text-sm">Loading saved jobs...</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <select
                        value={selectedJobId}
                        onChange={(e) => handleSelectSavedJob(e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      >
                        <option value="">Select a saved job...</option>
                        {savedJobs.map((job) => (
                          <option key={job.id} value={job.id}>
                            {job.title} at {job.company}
                          </option>
                        ))}
                      </select>
                      {selectedJobId && (
                        <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                          <Check className="h-3 w-3 text-emerald-600" />
                          Job details imported. You can edit any field below before saving.
                        </p>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                <Briefcase className="h-4 w-4 inline mr-1" />
                Job Title *
              </label>
              <input
                type="text"
                required
                value={formData.jobTitle || ''}
                onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-slate-400"
                placeholder="Software Engineer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                <Building2 className="h-4 w-4 inline mr-1" />
                Company *
              </label>
              <input
                type="text"
                required
                value={formData.companyName || ''}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-slate-400"
                placeholder="Google"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                <MapPin className="h-4 w-4 inline mr-1" />
                Location
              </label>
              <input
                type="text"
                value={formData.location || ''}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-slate-400"
                placeholder="San Francisco, CA"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                <DollarSign className="h-4 w-4 inline mr-1" />
                Salary
              </label>
              <input
                type="text"
                value={formData.salary || ''}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-slate-400"
                placeholder="$150,000 - $180,000"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              <Link2 className="h-4 w-4 inline mr-1" />
              Job URL
            </label>
            <input
              type="url"
              value={formData.jobUrl || ''}
              onChange={(e) => setFormData({ ...formData, jobUrl: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              placeholder="https://..."
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                <Target className="h-4 w-4 inline mr-1" />
                Status
              </label>
              <select
                value={formData.status || 'WISHLIST'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as ApplicationStatus })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-900"
              >
                {Object.entries(STATUS_CONFIG).map(([key, { label }]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                <Flag className="h-4 w-4 inline mr-1" />
                Priority
              </label>
              <select
                value={formData.priority || 0}
                onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-900"
              >
                <option value={0}>Normal</option>
                <option value={1}>High</option>
                <option value={2}>Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                <ExternalLink className="h-4 w-4 inline mr-1" />
                Source
              </label>
              <select
                value={formData.source || ''}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-900"
              >
                <option value="" className="text-slate-500">Select source</option>
                <option value="linkedin">LinkedIn</option>
                <option value="indeed">Indeed</option>
                <option value="company_website">Company Website</option>
                <option value="referral">Referral</option>
                <option value="recruiter">Recruiter</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                <Calendar className="h-4 w-4 inline mr-1" />
                Deadline
              </label>
              <input
                type="date"
                value={formData.deadline?.split('T')[0] || ''}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-slate-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                <User className="h-4 w-4 inline mr-1" />
                Contact Name
              </label>
              <input
                type="text"
                value={formData.contactName || ''}
                onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-slate-400"
                placeholder="Hiring Manager"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              <FileText className="h-4 w-4 inline mr-1" />
              Notes
            </label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-slate-400"
              placeholder="Any notes about this application..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex-1">
              {application?.id ? 'Save Changes' : 'Add Application'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Details Panel Component
function DetailsPanel({
  application,
  onClose,
  onEdit,
  onDelete,
  onUpdate,
}: {
  application: JobApplication;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onUpdate: (data: Partial<JobApplication>) => void;
}) {
  const noteInputModal = useModal();
  const [newNote, setNewNote] = useState('');

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    try {
      await api.addJobActivity(application.id, { description: newNote });
      toast.success('Note added');
      setNewNote('');
      noteInputModal.close();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to add note'));
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-white shadow-2xl z-50 overflow-y-auto">
      <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">Application Details</h2>
        <div className="flex items-center gap-2">
          <button onClick={onEdit} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <Edit2 className="h-5 w-5 text-slate-600" />
          </button>
          <button onClick={onDelete} className="p-2 hover:bg-red-50 rounded-xl transition-colors">
            <Trash2 className="h-5 w-5 text-red-600" />
          </button>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-900">{application.jobTitle}</h3>
              <p className="text-slate-600 flex items-center gap-2 mt-1">
                <Building2 className="h-4 w-4" />
                {application.companyName}
              </p>
            </div>
            <Badge className={STATUS_CONFIG[application.status].bgColor}>
              <span className={STATUS_CONFIG[application.status].color}>
                {STATUS_CONFIG[application.status].label}
              </span>
            </Badge>
          </div>

          <div className="flex flex-wrap gap-4 mt-4 text-sm">
            {application.location && (
              <span className="flex items-center gap-1 text-slate-500">
                <MapPin className="h-4 w-4" />
                {application.location}
              </span>
            )}
            {application.salary && (
              <span className="flex items-center gap-1 text-emerald-600">
                <DollarSign className="h-4 w-4" />
                {application.salary}
              </span>
            )}
            {application.source && (
              <span className="flex items-center gap-1 text-slate-500">
                <ExternalLink className="h-4 w-4" />
                {application.source}
              </span>
            )}
          </div>

          {application.jobUrl && (
            <a
              href={application.jobUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 mt-3 text-sm"
            >
              View Job Posting <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>

        {/* Key Dates */}
        <div className="grid grid-cols-2 gap-4">
          {application.appliedAt && (
            <div className="bg-blue-50 rounded-xl p-4">
              <p className="text-xs text-blue-600 font-medium">Applied</p>
              <p className="text-sm text-blue-900 mt-1">{formatDate(application.appliedAt)}</p>
            </div>
          )}
          {application.deadline && (
            <div className="bg-amber-50 rounded-xl p-4">
              <p className="text-xs text-amber-600 font-medium">Deadline</p>
              <p className="text-sm text-amber-900 mt-1">{formatDate(application.deadline)}</p>
            </div>
          )}
          {application.interviewDate && (
            <div className="bg-purple-50 rounded-xl p-4">
              <p className="text-xs text-purple-600 font-medium">Interview</p>
              <p className="text-sm text-purple-900 mt-1">
                {formatDate(application.interviewDate)}
                {application.interviewType && ` (${application.interviewType})`}
              </p>
            </div>
          )}
          {application.nextFollowUp && (
            <div className="bg-blue-50 rounded-xl p-4">
              <p className="text-xs text-blue-600 font-medium">Follow Up</p>
              <p className="text-sm text-blue-900 mt-1">{formatDate(application.nextFollowUp)}</p>
            </div>
          )}
        </div>

        {/* Offer Details */}
        {application.offerAmount && (
          <div className="bg-emerald-50 rounded-xl p-4">
            <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
              <Target className="h-3 w-3" /> Offer
            </p>
            <p className="text-lg font-bold text-emerald-900 mt-1">{application.offerAmount}</p>
            {application.offerDeadline && (
              <p className="text-xs text-emerald-600 mt-1">
                Deadline: {formatDate(application.offerDeadline)}
              </p>
            )}
          </div>
        )}

        {/* Contact */}
        {(application.contactName || application.contactEmail) && (
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
              <User className="h-4 w-4" /> Contact
            </h4>
            <div className="bg-slate-50 rounded-xl p-4">
              {application.contactName && (
                <p className="text-sm text-slate-700">{application.contactName}</p>
              )}
              {application.contactEmail && (
                <a
                  href={`mailto:${application.contactEmail}`}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 mt-1"
                >
                  <Mail className="h-3 w-3" /> {application.contactEmail}
                </a>
              )}
            </div>
          </div>
        )}

        {/* Notes */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <FileText className="h-4 w-4" /> Notes
            </h4>
            <button
              onClick={() => noteInputModal.toggle()}
              className="text-xs text-blue-600 hover:text-blue-700"
            >
              + Add Note
            </button>
          </div>

          {noteInputModal.isOpen && (
            <div className="mb-3">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-slate-400"
                placeholder="Add a note..."
              />
              <div className="flex justify-end gap-2 mt-2">
                <Button size="sm" variant="outline" onClick={() => noteInputModal.close()}>
                  Cancel
                </Button>
                <Button size="sm" variant="primary" onClick={handleAddNote}>
                  Save
                </Button>
              </div>
            </div>
          )}

          {application.notes ? (
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{application.notes}</p>
            </div>
          ) : !noteInputModal.isOpen && (
            <p className="text-sm text-slate-400 italic">No notes yet</p>
          )}
        </div>

        {/* Activity Log */}
        {application.activities && application.activities.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> Activity
            </h4>
            <div className="space-y-2">
              {application.activities.map((activity) => (
                <div key={activity.id} className="flex gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-indigo-400 mt-2 flex-shrink-0" />
                  <div>
                    <p className="text-slate-700">{activity.description}</p>
                    <p className="text-xs text-slate-400">{formatDate(activity.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="border-t border-slate-200 pt-4">
          <h4 className="text-sm font-semibold text-slate-900 mb-3">Quick Actions</h4>
          <div className="grid grid-cols-2 gap-2">
            {application.status === 'WISHLIST' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onUpdate({ status: 'APPLIED', appliedAt: new Date().toISOString() })}
                className="w-full"
              >
                Mark Applied
              </Button>
            )}
            {['APPLIED', 'SCREENING'].includes(application.status) && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onUpdate({ status: 'INTERVIEWING' })}
                className="w-full"
              >
                Got Interview
              </Button>
            )}
            {application.status === 'INTERVIEWING' && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onUpdate({ status: 'OFFER' })}
                  className="w-full"
                >
                  Got Offer
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onUpdate({ status: 'REJECTED' })}
                  className="w-full text-red-600 border-red-200 hover:bg-red-50"
                >
                  Rejected
                </Button>
              </>
            )}
            {application.status === 'OFFER' && (
              <>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => onUpdate({ status: 'ACCEPTED' })}
                  className="w-full"
                >
                  Accept Offer
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onUpdate({ status: 'WITHDRAWN' })}
                  className="w-full"
                >
                  Decline
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
