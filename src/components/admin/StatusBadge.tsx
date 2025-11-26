import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CaseStudyStatus } from '@/types/case-studies';

interface StatusBadgeProps {
  status: CaseStudyStatus;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const getStatusConfig = (status: CaseStudyStatus) => {
    switch (status) {
      case CaseStudyStatus.PUBLISHED:
        return {
          variant: 'default' as const,
          className: 'bg-green-100 text-green-800 hover:bg-green-200',
          label: 'Published'
        };
      case CaseStudyStatus.DRAFT:
        return {
          variant: 'secondary' as const,
          className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
          label: 'Draft'
        };
      case CaseStudyStatus.ARCHIVED:
        return {
          variant: 'outline' as const,
          className: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
          label: 'Archived'
        };
      default:
        return {
          variant: 'secondary' as const,
          className: 'bg-gray-100 text-gray-600',
          label: 'Unknown'
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge
      variant={config.variant}
      className={`${config.className} ${className}`}
    >
      {config.label}
    </Badge>
  );
};

export default StatusBadge;