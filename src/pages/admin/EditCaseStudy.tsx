import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import AdminLayout from '@/components/admin/AdminLayout';
import CaseStudyForm from '@/components/admin/CaseStudyForm';
import { useCaseStudy } from '@/hooks/useCaseStudies';
import { useToast } from '@/hooks/use-toast';

const EditCaseStudy: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: caseStudy, isLoading, error } = useCaseStudy(id || '');

  const handleSuccess = () => {
    toast({
      title: "Case study updated successfully!",
      description: "Your changes have been saved.",
    });
  };

  const handleCancel = () => {
    navigate('/admin/case-studies');
  };

  if (!id) {
    return (
      <AdminLayout>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Invalid case study ID provided.
          </AlertDescription>
        </Alert>
      </AdminLayout>
    );
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <p className="text-muted-foreground">Loading case study...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error || !caseStudy) {
    return (
      <AdminLayout>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load case study. {error?.message || 'Case study not found.'}
          </AlertDescription>
        </Alert>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">
              Edit Case Study
            </h1>
            <p className="mt-2 text-muted-foreground">
              Update "{caseStudy.title}"
            </p>
          </div>

          <Button
            variant="ghost"
            onClick={handleCancel}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Case Studies</span>
          </Button>
        </div>

        <CaseStudyForm
          mode="edit"
          initialData={caseStudy}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </AdminLayout>
  );
};

export default EditCaseStudy;