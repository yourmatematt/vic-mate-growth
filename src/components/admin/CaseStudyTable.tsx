import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Edit,
  MoreHorizontal,
  Copy,
  Trash2,
  Eye,
  ExternalLink
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { CaseStudy } from '@/types/case-studies';
import { formatDate } from '@/lib/case-study-utils';
import StatusBadge from './StatusBadge';

interface CaseStudyTableProps {
  data: CaseStudy[];
  isLoading?: boolean;
  selectedIds: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onPreview?: (id: string) => void;
}

const CaseStudyTable: React.FC<CaseStudyTableProps> = ({
  data,
  isLoading = false,
  selectedIds,
  onSelectionChange,
  onEdit,
  onDelete,
  onDuplicate,
  onPreview
}) => {
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  // Handle select all checkbox
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(data.map(cs => cs.id));
    } else {
      onSelectionChange([]);
    }
  };

  // Handle individual row selection
  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedIds, id]);
    } else {
      onSelectionChange(selectedIds.filter(selectedId => selectedId !== id));
    }
  };

  const handleImageError = (id: string) => {
    setImageErrors(prev => ({ ...prev, [id]: true }));
  };

  const isAllSelected = data.length > 0 && selectedIds.length === data.length;
  const isPartiallySelected = selectedIds.length > 0 && selectedIds.length < data.length;

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <div className="h-4 w-4 bg-muted rounded animate-pulse" />
              </TableHead>
              <TableHead>Case Study</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Industry</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Published</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="h-4 w-4 bg-muted rounded animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-16 bg-muted rounded animate-pulse" />
                    <div className="space-y-1">
                      <div className="h-4 w-40 bg-muted rounded animate-pulse" />
                      <div className="h-3 w-24 bg-muted rounded animate-pulse" />
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="h-6 w-20 bg-muted rounded animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="h-8 w-8 bg-muted rounded animate-pulse" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  // Empty state
  if (!isLoading && data.length === 0) {
    return (
      <div className="border rounded-md">
        <div className="p-12 text-center space-y-4">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
            <Eye className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">No case studies yet</h3>
            <p className="text-muted-foreground">
              Create your first case study to get started!
            </p>
          </div>
          <Button asChild>
            <Link to="/admin/case-studies/new">Create Case Study</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={isAllSelected}
                indeterminate={isPartiallySelected}
                onCheckedChange={handleSelectAll}
                aria-label="Select all case studies"
              />
            </TableHead>
            <TableHead>Case Study</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Industry</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Published</TableHead>
            <TableHead className="w-20">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((caseStudy) => (
            <TableRow key={caseStudy.id} className="group">
              <TableCell>
                <Checkbox
                  checked={selectedIds.includes(caseStudy.id)}
                  onCheckedChange={(checked) =>
                    handleSelectRow(caseStudy.id, checked as boolean)
                  }
                  aria-label={`Select ${caseStudy.title}`}
                />
              </TableCell>

              <TableCell>
                <div className="flex items-center space-x-3">
                  {/* Thumbnail */}
                  <div className="w-16 h-10 bg-muted rounded overflow-hidden flex-shrink-0">
                    {caseStudy.featured_image_url && !imageErrors[caseStudy.id] ? (
                      <img
                        src={caseStudy.featured_image_url}
                        alt={caseStudy.title}
                        className="w-full h-full object-cover"
                        onError={() => handleImageError(caseStudy.id)}
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Title and meta */}
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/admin/case-studies/${caseStudy.id}/edit`}
                      className="font-medium text-sm hover:text-primary transition-colors line-clamp-2"
                      title={caseStudy.title}
                    >
                      {caseStudy.title}
                    </Link>
                    <div className="text-xs text-muted-foreground mt-1">
                      {caseStudy.tags?.slice(0, 2).map(tag => (
                        <span key={tag} className="mr-2 capitalize">
                          #{tag.replace('-', ' ')}
                        </span>
                      ))}
                      {caseStudy.tags && caseStudy.tags.length > 2 && (
                        <span>+{caseStudy.tags.length - 2} more</span>
                      )}
                    </div>
                  </div>
                </div>
              </TableCell>

              <TableCell>
                <div className="text-sm">
                  <div className="font-medium">{caseStudy.client_name}</div>
                  {caseStudy.client_location && (
                    <div className="text-xs text-muted-foreground">
                      {caseStudy.client_location}
                    </div>
                  )}
                </div>
              </TableCell>

              <TableCell>
                <span className="text-sm">
                  {caseStudy.client_industry || '-'}
                </span>
              </TableCell>

              <TableCell>
                <StatusBadge status={caseStudy.status} />
              </TableCell>

              <TableCell>
                <span className="text-sm text-muted-foreground">
                  {caseStudy.published_at
                    ? formatDate(caseStudy.published_at, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })
                    : '-'
                  }
                </span>
              </TableCell>

              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 opacity-60 group-hover:opacity-100 transition-opacity"
                    >
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>

                    <DropdownMenuItem
                      onClick={() => onEdit(caseStudy.id)}
                      className="cursor-pointer"
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => onDuplicate(caseStudy.id)}
                      className="cursor-pointer"
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Duplicate
                    </DropdownMenuItem>

                    {onPreview && (
                      <DropdownMenuItem
                        onClick={() => onPreview(caseStudy.id)}
                        className="cursor-pointer"
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Preview
                      </DropdownMenuItem>
                    )}

                    {caseStudy.status === 'published' && (
                      <DropdownMenuItem asChild>
                        <a
                          href={`/case-studies/${caseStudy.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="cursor-pointer"
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          View Live
                        </a>
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      onClick={() => onDelete(caseStudy.id)}
                      className="cursor-pointer text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CaseStudyTable;