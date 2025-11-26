import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Archive, CheckCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import AdminLayout from '@/components/admin/AdminLayout';
import CaseStudyFilters from '@/components/admin/CaseStudyFilters';
import CaseStudyTable from '@/components/admin/CaseStudyTable';
import DeleteConfirmDialog from '@/components/admin/DeleteConfirmDialog';
import {
  useCaseStudies,
  useDeleteCaseStudy,
  useBulkDeleteCaseStudies,
  useBulkUpdateCaseStudyStatus,
  useDuplicateCaseStudy
} from '@/hooks/useCaseStudies';
import {
  CaseStudyFilters as FilterType,
  CaseStudyStatus
} from '@/types/case-studies';

const CaseStudiesList: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Filter state
  const [filters, setFilters] = useState<FilterType>({
    page: 1,
    pageSize: 10,
    sortBy: 'created_at',
    sortOrder: 'desc'
  });

  // Selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Dialog states
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    id?: string;
    title?: string;
    isBulk?: boolean;
  }>({
    isOpen: false
  });

  // Fetch data
  const { data: response, isLoading, error } = useCaseStudies(filters);

  // Mutations
  const deleteCase = useDeleteCaseStudy();
  const bulkDelete = useBulkDeleteCaseStudies();
  const bulkUpdateStatus = useBulkUpdateCaseStudyStatus();
  const duplicateCase = useDuplicateCaseStudy();

  // Computed values
  const caseStudies = response?.data || [];
  const totalCount = response?.total || 0;
  const totalPages = response?.totalPages || 0;

  // Pagination options
  const pageSizeOptions = [10, 25, 50, 100];

  // Handle filter changes
  const handleFilterChange = (newFilters: FilterType) => {
    setFilters(newFilters);
    setSelectedIds([]); // Clear selection when filters change
  };

  const clearFilters = () => {
    setFilters({
      page: 1,
      pageSize: filters.pageSize,
      sortBy: 'created_at',
      sortOrder: 'desc'
    });
    setSelectedIds([]);
  };

  // Handle pagination
  const handlePageSizeChange = (pageSize: string) => {
    setFilters(prev => ({ ...prev, pageSize: parseInt(pageSize), page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  // Handle actions
  const handleEdit = (id: string) => {
    navigate(`/admin/case-studies/${id}/edit`);
  };

  const handleDelete = (id: string) => {
    const caseStudy = caseStudies.find(cs => cs.id === id);
    setDeleteDialog({
      isOpen: true,
      id,
      title: caseStudy?.title,
      isBulk: false
    });
  };

  const handleBulkDelete = () => {
    setDeleteDialog({
      isOpen: true,
      isBulk: true
    });
  };

  const confirmDelete = async () => {
    try {
      if (deleteDialog.isBulk) {
        await bulkDelete.mutateAsync(selectedIds);
        toast({
          title: 'Success',
          description: `${selectedIds.length} case studies deleted successfully.`
        });
        setSelectedIds([]);
      } else if (deleteDialog.id) {
        await deleteCase.mutateAsync(deleteDialog.id);
        toast({
          title: 'Success',
          description: 'Case study deleted successfully.'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete case study. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setDeleteDialog({ isOpen: false });
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await duplicateCase.mutateAsync(id);
      toast({
        title: 'Success',
        description: 'Case study duplicated successfully.'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to duplicate case study. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleBulkStatusUpdate = async (status: 'published' | 'draft' | 'archived') => {
    try {
      await bulkUpdateStatus.mutateAsync({ ids: selectedIds, status });
      toast({
        title: 'Success',
        description: `${selectedIds.length} case studies updated to ${status}.`
      });
      setSelectedIds([]);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update case studies. Please try again.',
        variant: 'destructive'
      });
    }
  };

  // Generate pagination controls
  const paginationControls = useMemo(() => {
    const pages = [];
    const current = filters.page || 1;
    const total = totalPages;
    const showPages = 5;

    let start = Math.max(1, current - Math.floor(showPages / 2));
    let end = Math.min(total, start + showPages - 1);

    if (end - start < showPages - 1) {
      start = Math.max(1, end - showPages + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }, [filters.page, totalPages]);

  const isAnySelected = selectedIds.length > 0;
  const selectedCount = selectedIds.length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">
              Manage Case Studies
            </h1>
            <p className="mt-2 text-muted-foreground">
              {totalCount} case studies total
            </p>
          </div>
          <Button asChild className="mate-button-primary mt-4 sm:mt-0">
            <a href="/admin/case-studies/new">
              <Plus className="mr-2 h-4 w-4" />
              Create New Case Study
            </a>
          </Button>
        </div>

        {/* Filters */}
        <CaseStudyFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={clearFilters}
          totalCount={totalCount}
        />

        {/* Bulk actions bar */}
        {isAnySelected && (
          <div className="bg-accent border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium">
                  {selectedCount} selected
                </span>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkStatusUpdate('published')}
                    disabled={bulkUpdateStatus.isPending}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Publish
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkStatusUpdate('draft')}
                    disabled={bulkUpdateStatus.isPending}
                  >
                    <Archive className="mr-2 h-4 w-4" />
                    Draft
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleBulkDelete}
                    disabled={bulkDelete.isPending}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedIds([])}
              >
                <X className="mr-2 h-4 w-4" />
                Clear selection
              </Button>
            </div>
          </div>
        )}

        {/* Table */}
        <CaseStudyTable
          data={caseStudies}
          isLoading={isLoading}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onDuplicate={handleDuplicate}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Show:</span>
              <Select
                value={filters.pageSize?.toString() || '10'}
                onValueChange={handlePageSizeChange}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {pageSizeOptions.map(size => (
                    <SelectItem key={size} value={size.toString()}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">per page</span>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange((filters.page || 1) - 1)}
                disabled={!filters.page || filters.page <= 1}
              >
                Previous
              </Button>

              <div className="flex items-center space-x-1">
                {paginationControls.map(page => (
                  <Button
                    key={page}
                    variant={page === filters.page ? 'default' : 'outline'}
                    size="sm"
                    className="w-9"
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </Button>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange((filters.page || 1) + 1)}
                disabled={!filters.page || filters.page >= totalPages}
              >
                Next
              </Button>
            </div>

            <div className="text-sm text-muted-foreground">
              Page {filters.page || 1} of {totalPages}
            </div>
          </div>
        )}

        {/* Delete confirmation dialog */}
        <DeleteConfirmDialog
          isOpen={deleteDialog.isOpen}
          title={deleteDialog.title}
          itemName={deleteDialog.title}
          itemCount={deleteDialog.isBulk ? selectedCount : undefined}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteDialog({ isOpen: false })}
          isLoading={deleteCase.isPending || bulkDelete.isPending}
        />
      </div>
    </AdminLayout>
  );
};

export default CaseStudiesList;