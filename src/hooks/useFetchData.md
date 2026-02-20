# useFetchData Hook Documentation

## Overview

The `useFetchData` hook provides a standardized way to fetch data with automatic loading state, error handling, and toast notifications. It eliminates the need for repetitive `useState`, `useEffect`, and try-catch boilerplate.

## Basic Usage

### Before (Old Pattern - 15+ lines)
```tsx
const [resumes, setResumes] = useState<Resume[]>([]);
const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  loadResumes();
}, []);

const loadResumes = async () => {
  try {
    const response = await api.getResumes();
    if (response.success && response.data) {
      setResumes(response.data);
    }
  } catch (error) {
    toast.error(getErrorMessage(error, 'Failed to load resumes'));
  } finally {
    setIsLoading(false);
  }
};
```

### After (New Pattern - 4 lines)
```tsx
const { data: resumes, isLoading, refetch } = useFetchData({
  fetchFn: () => api.getResumes(),
  errorMessage: 'Failed to load resumes',
});
```

## API Reference

### Parameters

```typescript
interface UseFetchDataOptions<T> {
  // Required: The API function to call
  fetchFn: () => Promise<{ success: boolean; data?: T }>;

  // Optional: Error message for toast (default: 'Failed to load data')
  errorMessage?: string;

  // Optional: Show error toast (default: true)
  showErrorToast?: boolean;

  // Optional: Fetch immediately on mount (default: true)
  immediate?: boolean;

  // Optional: Success callback
  onSuccess?: (data: T) => void;

  // Optional: Error callback
  onError?: (error: any) => void;

  // Optional: Dependencies for refetching
  deps?: any[];
}
```

### Return Values

```typescript
{
  data: T | null;           // The fetched data
  isLoading: boolean;       // Loading state
  error: Error | null;      // Error object if failed
  refetch: () => void;      // Manual refetch function
  setData: Dispatch<T>;     // Manual data setter
}
```

## Usage Examples

### 1. Simple Data Fetching
```tsx
function ResumesPage() {
  const { data: resumes, isLoading, error } = useFetchData({
    fetchFn: () => api.getResumes(),
    errorMessage: 'Failed to load resumes',
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage />;

  return <ResumeList resumes={resumes} />;
}
```

### 2. With Success Callback
```tsx
const { data: coverLetters, isLoading } = useFetchData({
  fetchFn: () => api.getCoverLetters(),
  errorMessage: 'Failed to load cover letters',
  onSuccess: (data) => {
    console.log(`Loaded ${data.length} cover letters`);
  },
});
```

### 3. Manual Trigger (No Immediate Fetch)
```tsx
const { data: jobDetails, isLoading, refetch } = useFetchData({
  fetchFn: () => api.getJobDetails(jobId),
  errorMessage: 'Failed to load job details',
  immediate: false, // Don't fetch on mount
});

// Later, trigger manually
const handleViewDetails = () => {
  refetch();
};
```

### 4. With Dependencies (Refetch on Change)
```tsx
const { data: filteredJobs, isLoading } = useFetchData({
  fetchFn: () => api.searchJobs(searchQuery),
  errorMessage: 'Failed to search jobs',
  deps: [searchQuery], // Refetch when searchQuery changes
});
```

### 5. Silent Error Handling
```tsx
const { data: stats, isLoading } = useFetchData({
  fetchFn: () => api.getStats(),
  showErrorToast: false, // Don't show toast on error
  onError: (error) => {
    // Custom error handling
    logError(error);
  },
});
```

### 6. Optimistic Updates
```tsx
const { data: jobs, setData, refetch } = useFetchData({
  fetchFn: () => api.getSavedJobs(),
  errorMessage: 'Failed to load saved jobs',
});

const handleSaveJob = async (newJob: Job) => {
  // Optimistic update
  setData(prev => [...(prev || []), newJob]);

  try {
    await api.saveJob(newJob);
  } catch (error) {
    // Rollback on error
    refetch();
  }
};
```

### 7. Multiple Parallel Requests
```tsx
const { data, isLoading } = useFetchMultiple([
  () => api.getResumes(),
  () => api.getCoverLetters(),
  () => api.getSavedJobs(),
]);

// data[0] = resumes
// data[1] = coverLetters
// data[2] = savedJobs
```

## Migration Guide

### Pattern 1: Basic Page Data Loading

**Before:**
```tsx
const [data, setData] = useState<Resume[]>([]);
const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  loadData();
}, []);

const loadData = async () => {
  try {
    const response = await api.getResumes();
    if (response.success && response.data) {
      setData(response.data);
    }
  } catch (error) {
    toast.error('Failed to load resumes');
  } finally {
    setIsLoading(false);
  }
};
```

**After:**
```tsx
const { data, isLoading, refetch } = useFetchData({
  fetchFn: () => api.getResumes(),
  errorMessage: 'Failed to load resumes',
});
```

### Pattern 2: Conditional Data Loading

**Before:**
```tsx
const [details, setDetails] = useState(null);
const [isLoadingDetails, setIsLoadingDetails] = useState(false);

const loadDetails = async (id: string) => {
  setIsLoadingDetails(true);
  try {
    const response = await api.getDetails(id);
    if (response.success) {
      setDetails(response.data);
    }
  } catch (error) {
    toast.error('Failed to load details');
  } finally {
    setIsLoadingDetails(false);
  }
};
```

**After:**
```tsx
const { data: details, isLoading: isLoadingDetails, refetch } = useFetchData({
  fetchFn: () => api.getDetails(selectedId),
  errorMessage: 'Failed to load details',
  immediate: false,
  deps: [selectedId],
});

// Trigger with refetch() when needed
```

### Pattern 3: Multiple Data Sources

**Before:**
```tsx
const [resumes, setResumes] = useState([]);
const [letters, setLetters] = useState([]);
const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  loadData();
}, []);

const loadData = async () => {
  try {
    const [resumesRes, lettersRes] = await Promise.all([
      api.getResumes(),
      api.getCoverLetters(),
    ]);

    if (resumesRes.success) setResumes(resumesRes.data);
    if (lettersRes.success) setLetters(lettersRes.data);
  } catch (error) {
    toast.error('Failed to load data');
  } finally {
    setIsLoading(false);
  }
};
```

**After:**
```tsx
const { data, isLoading } = useFetchMultiple([
  () => api.getResumes(),
  () => api.getCoverLetters(),
]);

const resumes = data?.[0];
const letters = data?.[1];
```

## Benefits

✅ **Reduced Boilerplate**: 15+ lines → 4 lines
✅ **Consistent Error Handling**: Standardized toast notifications
✅ **Loading States**: Automatic loading state management
✅ **Type Safety**: Full TypeScript support with generics
✅ **Flexible**: Supports callbacks, dependencies, manual triggers
✅ **Optimistic Updates**: Built-in `setData` for immediate UI updates
✅ **Testable**: Easier to mock and test

## Best Practices

1. **Always specify error messages** for better UX
2. **Use deps array** for dynamic refetching instead of manual useEffect
3. **Use immediate: false** for user-triggered fetches (e.g., view details button)
4. **Use onSuccess callback** for side effects like analytics tracking
5. **Use setData** for optimistic updates, then refetch on error to rollback
