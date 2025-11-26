import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Save,
  Eye,
  X,
  Plus,
  Minus,
  ArrowLeft,
  Calendar,
  Globe,
  Hash,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AdminLayout from '@/components/admin/AdminLayout';
import ImageUpload from '@/components/admin/ImageUpload';
import BeforeAfterPreview from '@/components/admin/BeforeAfterPreview';
import { useCreateCaseStudy } from '@/hooks/useCreateCaseStudy';
import { useUpdateCaseStudy, useAutoSaveCaseStudy } from '@/hooks/useUpdateCaseStudy';
import {
  CaseStudy,
  CaseStudyFormData,
  CaseStudyStatus,
  INDUSTRY_OPTIONS,
  TAG_OPTIONS,
  IndustryOption,
  TagOption
} from '@/types/case-studies';
import {
  generateSlug,
  validateSlug,
  caseStudyToFormData,
  formatDateTimeLocal
} from '@/lib/case-study-utils';

// Form validation schema
const caseStudyFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title must be 100 characters or less'),
  slug: z.string().min(3, 'Slug must be at least 3 characters').max(100, 'Slug must be 100 characters or less'),
  client_name: z.string().min(2, 'Client name must be at least 2 characters'),
  client_industry: z.string().min(1, 'Please select an industry'),
  client_location: z.string().optional(),
  challenge: z.string().min(100, 'Challenge description must be at least 100 characters').max(2000, 'Challenge description must be 2000 characters or less'),
  solution: z.string().min(100, 'Solution description must be at least 100 characters').max(2000, 'Solution description must be 2000 characters or less'),
  results: z.string().min(100, 'Results description must be at least 100 characters').max(2000, 'Results description must be 2000 characters or less'),
  testimonial: z.string().max(500, 'Testimonial must be 500 characters or less').optional(),
  testimonial_author: z.string().optional(),
  before_image_url: z.string().optional(),
  after_image_url: z.string().optional(),
  featured_image_url: z.string().optional(),
  metrics: z.record(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(['draft', 'published', 'archived']),
  published_at: z.string().nullable().optional()
});

type FormData = z.infer<typeof caseStudyFormSchema>;

interface CaseStudyFormProps {
  mode: 'create' | 'edit';
  initialData?: CaseStudy;
  onSuccess?: (caseStudy: CaseStudy) => void;
  onCancel?: () => void;
}

interface MetricEntry {
  id: string;
  label: string;
  value: string;
}

const CaseStudyForm: React.FC<CaseStudyFormProps> = ({
  mode,
  initialData,
  onSuccess,
  onCancel
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Form state
  const [metrics, setMetrics] = useState<MetricEntry[]>([
    { id: '1', label: '', value: '' },
    { id: '2', label: '', value: '' },
    { id: '3', label: '', value: '' }
  ]);
  const [selectedTags, setSelectedTags] = useState<TagOption[]>([]);
  const [imageFiles, setImageFiles] = useState<{
    featured?: File;
    before?: File;
    after?: File;
  }>({});
  const [isDirty, setIsDirty] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'error' | null>(null);

  // Mutations
  const createMutation = useCreateCaseStudy();
  const updateMutation = useUpdateCaseStudy();
  const autoSaveMutation = useAutoSaveCaseStudy();

  // Form setup
  const form = useForm<FormData>({
    resolver: zodResolver(caseStudyFormSchema),
    defaultValues: {
      title: '',
      slug: '',
      client_name: '',
      client_industry: '',
      client_location: '',
      challenge: '',
      solution: '',
      results: '',
      testimonial: '',
      testimonial_author: '',
      before_image_url: '',
      after_image_url: '',
      featured_image_url: '',
      metrics: {},
      tags: [],
      status: 'draft',
      published_at: null
    }
  });

  const { watch, setValue, getValues, control, handleSubmit, formState: { errors, isSubmitting } } = form;
  const watchedTitle = watch('title');
  const watchedSlug = watch('slug');

  // Initialize form data
  useEffect(() => {
    if (initialData && mode === 'edit') {
      const formData = caseStudyToFormData(initialData);

      // Set form values
      Object.entries(formData).forEach(([key, value]) => {
        setValue(key as keyof FormData, value as any);
      });

      // Set metrics
      if (initialData.metrics) {
        const metricsArray = Object.entries(initialData.metrics).map(([label, value], index) => ({
          id: String(index + 1),
          label,
          value
        }));
        setMetrics(metricsArray.length > 0 ? metricsArray : [
          { id: '1', label: '', value: '' },
          { id: '2', label: '', value: '' },
          { id: '3', label: '', value: '' }
        ]);
      }

      // Set tags
      if (initialData.tags) {
        setSelectedTags(initialData.tags as TagOption[]);
      }
    }
  }, [initialData, mode, setValue]);

  // Auto-generate slug from title
  useEffect(() => {
    if (watchedTitle && (!watchedSlug || mode === 'create')) {
      const newSlug = generateSlug(watchedTitle);
      setValue('slug', newSlug, { shouldDirty: true });
    }
  }, [watchedTitle, watchedSlug, mode, setValue]);

  // Track form changes
  useEffect(() => {
    const subscription = watch(() => {
      if (!isDirty) {
        setIsDirty(true);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, isDirty]);

  // Auto-save functionality
  const performAutoSave = useCallback(async () => {
    if (!isDirty) return;

    try {
      setAutoSaveStatus('saving');
      const formData = getValues();

      await autoSaveMutation.mutateAsync({
        id: initialData?.id,
        formData: {
          ...formData,
          metrics: metrics.reduce((acc, metric) => {
            if (metric.label && metric.value) {
              acc[metric.label] = metric.value;
            }
            return acc;
          }, {} as Record<string, string>),
          tags: selectedTags
        }
      });

      setAutoSaveStatus('saved');
      setTimeout(() => setAutoSaveStatus(null), 3000);
    } catch (error) {
      setAutoSaveStatus('error');
      setTimeout(() => setAutoSaveStatus(null), 5000);
    }
  }, [isDirty, getValues, metrics, selectedTags, autoSaveMutation, initialData?.id]);

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      performAutoSave();
    }, 30000);

    return () => clearInterval(interval);
  }, [performAutoSave]);

  // Handle metrics
  const addMetric = () => {
    setMetrics(prev => [...prev, { id: Date.now().toString(), label: '', value: '' }]);
  };

  const removeMetric = (id: string) => {
    setMetrics(prev => prev.filter(metric => metric.id !== id));
  };

  const updateMetric = (id: string, field: 'label' | 'value', value: string) => {
    setMetrics(prev => prev.map(metric =>
      metric.id === id ? { ...metric, [field]: value } : metric
    ));
  };

  // Handle tags
  const toggleTag = (tag: TagOption) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const removeTag = (tagToRemove: TagOption) => {
    setSelectedTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  // Handle image uploads
  const handleImageUpload = (type: 'featured' | 'before' | 'after') => (url: string, path: string) => {
    setValue(`${type}_image_url` as keyof FormData, url, { shouldDirty: true });
    setIsDirty(true);
  };

  const handleImageFile = (type: 'featured' | 'before' | 'after') => (file: File) => {
    setImageFiles(prev => ({ ...prev, [type]: file }));
  };

  // Form submission
  const onSubmit = async (data: FormData) => {
    try {
      // Prepare form data with metrics and tags
      const formData: CaseStudyFormData = {
        ...data,
        metrics: metrics.reduce((acc, metric) => {
          if (metric.label && metric.value) {
            acc[metric.label] = metric.value;
          }
          return acc;
        }, {} as Record<string, string>),
        tags: selectedTags
      };

      // Handle different submission types based on mode
      if (mode === 'create') {
        const result = await createMutation.mutateAsync({
          formData,
          imageFiles
        });

        if (result.success && result.data) {
          toast({
            title: 'Success',
            description: 'Case study created successfully!'
          });

          if (onSuccess) {
            onSuccess(result.data);
          } else {
            navigate('/admin/case-studies');
          }
        }
      } else {
        if (!initialData?.id) {
          throw new Error('Case study ID is required for updates');
        }

        const result = await updateMutation.mutateAsync({
          id: initialData.id,
          formData,
          imageFiles
        });

        if (result.success && result.data) {
          toast({
            title: 'Success',
            description: 'Case study updated successfully!'
          });

          setIsDirty(false);

          if (onSuccess) {
            onSuccess(result.data);
          }
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive'
      });
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      const confirm = window.confirm('You have unsaved changes. Are you sure you want to leave?');
      if (!confirm) return;
    }

    if (onCancel) {
      onCancel();
    } else {
      navigate('/admin/case-studies');
    }
  };

  const isLoading = isSubmitting || createMutation.isPending || updateMutation.isPending;

  return (
    <AdminLayout>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">
              {mode === 'create' ? 'Create New Case Study' : 'Edit Case Study'}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {mode === 'create'
                ? 'Add a new client success story to your portfolio'
                : 'Update your client success story'
              }
            </p>
          </div>

          <div className="flex items-center space-x-2 mt-4 sm:mt-0">
            {autoSaveStatus && (
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                {autoSaveStatus === 'saving' && <Loader2 className="w-3 h-3 animate-spin" />}
                <span>
                  {autoSaveStatus === 'saving' && 'Auto-saving...'}
                  {autoSaveStatus === 'saved' && 'Auto-saved'}
                  {autoSaveStatus === 'error' && 'Auto-save failed'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Form Sections */}
        <Accordion type="multiple" defaultValue={['basic', 'story', 'images']} className="w-full">
          {/* Basic Information */}
          <AccordionItem value="basic">
            <AccordionTrigger className="text-lg font-semibold">
              Basic Information
            </AccordionTrigger>
            <AccordionContent>
              <Card>
                <CardHeader>
                  <CardTitle>Case Study Details</CardTitle>
                  <CardDescription>
                    Enter the basic information about this case study
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Title */}
                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="title">
                        Case Study Title *
                      </Label>
                      <Controller
                        name="title"
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            id="title"
                            placeholder="e.g., Local Cafe Doubles Online Orders"
                            className={errors.title ? 'border-destructive' : ''}
                          />
                        )}
                      />
                      {errors.title && (
                        <p className="text-sm text-destructive">{errors.title.message}</p>
                      )}
                      <div className="flex justify-between">
                        <p className="text-xs text-muted-foreground">
                          This will be the main heading on your case study page
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {watchedTitle?.length || 0}/100
                        </p>
                      </div>
                    </div>

                    {/* Slug */}
                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="slug">
                        URL Slug *
                      </Label>
                      <div className="flex">
                        <div className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                          <Globe className="w-4 h-4 mr-2" />
                          yourmate.com.au/expertise/
                        </div>
                        <Controller
                          name="slug"
                          control={control}
                          render={({ field }) => (
                            <Input
                              {...field}
                              id="slug"
                              placeholder="url-friendly-slug"
                              className={`rounded-l-none ${errors.slug ? 'border-destructive' : ''}`}
                            />
                          )}
                        />
                      </div>
                      {errors.slug && (
                        <p className="text-sm text-destructive">{errors.slug.message}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Auto-generated from title, but you can customize it
                      </p>
                    </div>

                    {/* Client Name */}
                    <div className="space-y-2">
                      <Label htmlFor="client_name">
                        Client Name *
                      </Label>
                      <Controller
                        name="client_name"
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            id="client_name"
                            placeholder="e.g., Geelong Coffee Co."
                            className={errors.client_name ? 'border-destructive' : ''}
                          />
                        )}
                      />
                      {errors.client_name && (
                        <p className="text-sm text-destructive">{errors.client_name.message}</p>
                      )}
                    </div>

                    {/* Client Location */}
                    <div className="space-y-2">
                      <Label htmlFor="client_location">
                        Client Location
                      </Label>
                      <Controller
                        name="client_location"
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            id="client_location"
                            placeholder="e.g., Mallacoota, VIC"
                          />
                        )}
                      />
                    </div>

                    {/* Industry */}
                    <div className="space-y-2">
                      <Label htmlFor="client_industry">
                        Industry *
                      </Label>
                      <Controller
                        name="client_industry"
                        control={control}
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger className={errors.client_industry ? 'border-destructive' : ''}>
                              <SelectValue placeholder="Select industry" />
                            </SelectTrigger>
                            <SelectContent>
                              {INDUSTRY_OPTIONS.map((industry) => (
                                <SelectItem key={industry} value={industry}>
                                  {industry}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.client_industry && (
                        <p className="text-sm text-destructive">{errors.client_industry.message}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>

          {/* Story Content */}
          <AccordionItem value="story">
            <AccordionTrigger className="text-lg font-semibold">
              Story Content
            </AccordionTrigger>
            <AccordionContent>
              <Card>
                <CardHeader>
                  <CardTitle>The Client Journey</CardTitle>
                  <CardDescription>
                    Tell the story of how you helped your client succeed
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Challenge */}
                  <div className="space-y-2">
                    <Label htmlFor="challenge">
                      The Challenge *
                    </Label>
                    <Controller
                      name="challenge"
                      control={control}
                      render={({ field }) => (
                        <Textarea
                          {...field}
                          id="challenge"
                          placeholder="What problem was your client facing? Describe their situation before working with you..."
                          className={`min-h-32 ${errors.challenge ? 'border-destructive' : ''}`}
                        />
                      )}
                    />
                    {errors.challenge && (
                      <p className="text-sm text-destructive">{errors.challenge.message}</p>
                    )}
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Minimum 100 characters</span>
                      <span>{watch('challenge')?.length || 0}/2000</span>
                    </div>
                  </div>

                  {/* Solution */}
                  <div className="space-y-2">
                    <Label htmlFor="solution">
                      Our Solution *
                    </Label>
                    <Controller
                      name="solution"
                      control={control}
                      render={({ field }) => (
                        <Textarea
                          {...field}
                          id="solution"
                          placeholder="What did you do to help them? Describe your approach and strategy..."
                          className={`min-h-32 ${errors.solution ? 'border-destructive' : ''}`}
                        />
                      )}
                    />
                    {errors.solution && (
                      <p className="text-sm text-destructive">{errors.solution.message}</p>
                    )}
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Minimum 100 characters</span>
                      <span>{watch('solution')?.length || 0}/2000</span>
                    </div>
                  </div>

                  {/* Results */}
                  <div className="space-y-2">
                    <Label htmlFor="results">
                      The Results *
                    </Label>
                    <Controller
                      name="results"
                      control={control}
                      render={({ field }) => (
                        <Textarea
                          {...field}
                          id="results"
                          placeholder="What outcomes did they achieve? Include specific numbers and improvements..."
                          className={`min-h-32 ${errors.results ? 'border-destructive' : ''}`}
                        />
                      )}
                    />
                    {errors.results && (
                      <p className="text-sm text-destructive">{errors.results.message}</p>
                    )}
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Minimum 100 characters</span>
                      <span>{watch('results')?.length || 0}/2000</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>

          {/* Testimonial */}
          <AccordionItem value="testimonial">
            <AccordionTrigger className="text-lg font-semibold">
              Client Testimonial
            </AccordionTrigger>
            <AccordionContent>
              <Card>
                <CardHeader>
                  <CardTitle>What the Client Said</CardTitle>
                  <CardDescription>
                    Add a testimonial to build credibility (optional but recommended)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="testimonial">
                      Testimonial Quote
                    </Label>
                    <Controller
                      name="testimonial"
                      control={control}
                      render={({ field }) => (
                        <Textarea
                          {...field}
                          id="testimonial"
                          placeholder="What did the client say about working with you?"
                          className="min-h-24"
                        />
                      )}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Optional field</span>
                      <span>{watch('testimonial')?.length || 0}/500</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="testimonial_author">
                      Testimonial Author
                    </Label>
                    <Controller
                      name="testimonial_author"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="testimonial_author"
                          placeholder="e.g., Sarah Mitchell, Owner"
                        />
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>

          {/* Images */}
          <AccordionItem value="images">
            <AccordionTrigger className="text-lg font-semibold">
              Images & Visuals
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-6">
                {/* Featured Image */}
                <Card>
                  <CardHeader>
                    <CardTitle>Featured Image</CardTitle>
                    <CardDescription>
                      Main hero image displayed in case study listings and social shares
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ImageUpload
                      caseStudyId={initialData?.id || 'new'}
                      imageType="featured"
                      existingImageUrl={watch('featured_image_url')}
                      onUploadSuccess={handleImageUpload('featured')}
                      recommendedSize="1200x630px"
                      label="Featured Image"
                      description="Used as the main image in case study listings"
                    />
                  </CardContent>
                </Card>

                {/* Before/After Images */}
                <Card>
                  <CardHeader>
                    <CardTitle>Before & After Comparison</CardTitle>
                    <CardDescription>
                      Show the transformation you achieved for your client
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <ImageUpload
                        caseStudyId={initialData?.id || 'new'}
                        imageType="before"
                        existingImageUrl={watch('before_image_url')}
                        onUploadSuccess={handleImageUpload('before')}
                        recommendedSize="1200x800px"
                        label="Before Image"
                        description="Show the situation before your work"
                      />

                      <ImageUpload
                        caseStudyId={initialData?.id || 'new'}
                        imageType="after"
                        existingImageUrl={watch('after_image_url')}
                        onUploadSuccess={handleImageUpload('after')}
                        recommendedSize="1200x800px"
                        label="After Image"
                        description="Show the results after your work"
                      />
                    </div>

                    {/* Before/After Preview */}
                    <BeforeAfterPreview
                      beforeImageUrl={watch('before_image_url')}
                      afterImageUrl={watch('after_image_url')}
                    />
                  </CardContent>
                </Card>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Key Metrics */}
          <AccordionItem value="metrics">
            <AccordionTrigger className="text-lg font-semibold">
              Key Metrics & Results
            </AccordionTrigger>
            <AccordionContent>
              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                  <CardDescription>
                    Add key performance indicators to highlight your success
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    {metrics.map((metric, index) => (
                      <div key={metric.id} className="flex space-x-3 items-start">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <Label className="sr-only">Metric Label</Label>
                            <Input
                              placeholder="e.g., Revenue Increase"
                              value={metric.label}
                              onChange={(e) => updateMetric(metric.id, 'label', e.target.value)}
                            />
                          </div>
                          <div>
                            <Label className="sr-only">Metric Value</Label>
                            <Input
                              placeholder="e.g., 40%"
                              value={metric.value}
                              onChange={(e) => updateMetric(metric.id, 'value', e.target.value)}
                            />
                          </div>
                        </div>
                        {index >= 3 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => removeMetric(metric.id)}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={addMetric}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Another Metric
                  </Button>

                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="text-sm font-medium mb-2">Example Metrics:</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <div>• Revenue Increase: 40%</div>
                      <div>• Traffic Growth: 150%</div>
                      <div>• Lead Conversion: 3x</div>
                      <div>• ROI: 5:1</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>

          {/* Tags */}
          <AccordionItem value="tags">
            <AccordionTrigger className="text-lg font-semibold">
              Categories & Tags
            </AccordionTrigger>
            <AccordionContent>
              <Card>
                <CardHeader>
                  <CardTitle>Marketing Categories</CardTitle>
                  <CardDescription>
                    Tag this case study to help organize and filter your portfolio
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {TAG_OPTIONS.map((tag) => (
                      <label
                        key={tag}
                        className="flex items-center space-x-2 cursor-pointer p-2 rounded border hover:bg-accent"
                      >
                        <Checkbox
                          checked={selectedTags.includes(tag)}
                          onCheckedChange={() => toggleTag(tag)}
                        />
                        <span className="text-sm capitalize">
                          {tag.replace('-', ' ')}
                        </span>
                      </label>
                    ))}
                  </div>

                  {selectedTags.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Selected Tags:</Label>
                      <div className="flex flex-wrap gap-2">
                        {selectedTags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                            <Hash className="w-3 h-3" />
                            {tag.replace('-', ' ')}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-auto p-1 hover:bg-transparent"
                              onClick={() => removeTag(tag)}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>

          {/* Publishing */}
          <AccordionItem value="publishing">
            <AccordionTrigger className="text-lg font-semibold">
              Publishing Options
            </AccordionTrigger>
            <AccordionContent>
              <Card>
                <CardHeader>
                  <CardTitle>Publication Settings</CardTitle>
                  <CardDescription>
                    Control when and how this case study is published
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <Label className="text-sm font-medium">Publication Status</Label>
                    <Controller
                      name="status"
                      control={control}
                      render={({ field }) => (
                        <RadioGroup
                          value={field.value}
                          onValueChange={field.onChange}
                          className="grid grid-cols-1 md:grid-cols-3 gap-4"
                        >
                          <div className="flex items-center space-x-2 p-3 border rounded-lg">
                            <RadioGroupItem value="draft" id="draft" />
                            <Label htmlFor="draft" className="cursor-pointer">
                              <div>
                                <div className="font-medium">Draft</div>
                                <div className="text-xs text-muted-foreground">
                                  Save but don't publish yet
                                </div>
                              </div>
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2 p-3 border rounded-lg">
                            <RadioGroupItem value="published" id="published" />
                            <Label htmlFor="published" className="cursor-pointer">
                              <div>
                                <div className="font-medium">Published</div>
                                <div className="text-xs text-muted-foreground">
                                  Make live on your website
                                </div>
                              </div>
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2 p-3 border rounded-lg">
                            <RadioGroupItem value="archived" id="archived" />
                            <Label htmlFor="archived" className="cursor-pointer">
                              <div>
                                <div className="font-medium">Archived</div>
                                <div className="text-xs text-muted-foreground">
                                  Hide from public view
                                </div>
                              </div>
                            </Label>
                          </div>
                        </RadioGroup>
                      )}
                    />
                  </div>

                  {watch('status') === 'published' && (
                    <div className="space-y-2">
                      <Label htmlFor="published_at">
                        Publish Date & Time
                      </Label>
                      <Controller
                        name="published_at"
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            type="datetime-local"
                            id="published_at"
                            value={field.value ? formatDateTimeLocal(field.value) : ''}
                            onChange={(e) => {
                              const dateValue = e.target.value ? new Date(e.target.value).toISOString() : null;
                              field.onChange(dateValue);
                            }}
                          />
                        )}
                      />
                      <p className="text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3 inline mr-1" />
                        Leave empty to publish immediately when saved
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Sticky Footer */}
        <div className="sticky bottom-0 bg-background border-t p-4 flex justify-between items-center">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Cancel
          </Button>

          <div className="flex space-x-3">
            {mode === 'edit' && (
              <Button
                type="button"
                variant="outline"
                disabled={isLoading}
                onClick={() => performAutoSave()}
              >
                <Save className="w-4 h-4 mr-2" />
                Save Draft
              </Button>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="mate-button-primary"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : mode === 'create' ? (
                <Save className="w-4 h-4 mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {mode === 'create' ? 'Create Case Study' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
};

export default CaseStudyForm;