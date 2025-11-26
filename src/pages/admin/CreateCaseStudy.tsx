import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import CaseStudyForm from '@/components/admin/CaseStudyForm';
import { useToast } from '@/hooks/use-toast';

const CreateCaseStudy: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSuccess = (caseStudyId: string) => {
    toast({
      title: "Case study created successfully!",
      description: "Your new case study has been saved. You can continue editing or publish when ready.",
    });

    navigate(`/admin/case-studies/${caseStudyId}/edit`);
  };

  const handleCancel = () => {
    navigate('/admin/case-studies');
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">
              Create New Case Study
            </h1>
            <p className="mt-2 text-muted-foreground">
              Add a new client success story to your portfolio
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
          mode="create"
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </AdminLayout>
  );
};

export default CreateCaseStudy;