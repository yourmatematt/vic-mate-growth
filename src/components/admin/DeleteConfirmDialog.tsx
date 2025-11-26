import React from 'react';
import { AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  title?: string;
  description?: string;
  itemName?: string;
  itemCount?: number;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  confirmButtonText?: string;
  cancelButtonText?: string;
}

const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  isOpen,
  title,
  description,
  itemName,
  itemCount,
  onConfirm,
  onCancel,
  isLoading = false,
  confirmButtonText = 'Delete',
  cancelButtonText = 'Cancel'
}) => {
  // Generate default title and description based on props
  const getDefaultTitle = () => {
    if (title) return title;

    if (itemCount && itemCount > 1) {
      return `Delete ${itemCount} case studies?`;
    }

    if (itemName) {
      return `Delete "${itemName}"?`;
    }

    return 'Delete case study?';
  };

  const getDefaultDescription = () => {
    if (description) return description;

    if (itemCount && itemCount > 1) {
      return `Are you sure you want to delete ${itemCount} case studies? This action cannot be undone and will permanently remove all selected case studies from your account.`;
    }

    const name = itemName ? ` "${itemName}"` : '';
    return `Are you sure you want to delete this case study${name}? This action cannot be undone and will permanently remove the case study from your account.`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-destructive/10 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-lg font-semibold">
                {getDefaultTitle()}
              </DialogTitle>
            </div>
          </div>
        </DialogHeader>

        <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
          {getDefaultDescription()}
        </DialogDescription>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            {cancelButtonText}
          </Button>

          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
            className="w-full sm:w-auto order-1 sm:order-2"
          >
            {isLoading ? (
              <>
                <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                Deleting...
              </>
            ) : (
              confirmButtonText
            )}
          </Button>
        </DialogFooter>

        {/* Additional warning for bulk delete */}
        {itemCount && itemCount > 1 && (
          <div className="mt-2 p-3 bg-orange-50 border border-orange-200 rounded-md">
            <div className="flex">
              <AlertTriangle className="h-4 w-4 text-orange-400 mt-0.5 mr-2 flex-shrink-0" />
              <div className="text-xs text-orange-800">
                <strong>Bulk delete warning:</strong> You are about to delete multiple case studies at once.
                Please double-check your selection before proceeding.
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DeleteConfirmDialog;