import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface ValuePropCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  highlight?: string;
  className?: string;
}

const ValuePropCard: React.FC<ValuePropCardProps> = ({
  icon: Icon,
  title,
  description,
  highlight,
  className = ''
}) => {
  return (
    <Card className={`mate-card hover:shadow-lg transition-all duration-300 ${className}`}>
      <CardContent className="p-6 text-center">
        <div className="mb-4">
          <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Icon className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
        </div>

        <p className="text-muted-foreground text-sm leading-relaxed mb-3">
          {description}
        </p>

        {highlight && (
          <div className="bg-accent/10 border border-accent/20 rounded-lg p-3">
            <p className="text-xs font-medium text-accent-foreground">
              {highlight}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ValuePropCard;