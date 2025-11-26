import React, { useEffect, useState, useRef } from 'react';
import { TrendingUp, Target, Users, DollarSign, BarChart3, ArrowUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface MetricCardProps {
  label: string;
  value: string;
  description?: string;
  icon?: string;
  color?: 'primary' | 'success' | 'warning' | 'info';
  animate?: boolean;
  className?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  description,
  icon,
  color = 'primary',
  animate = false,
  className = ''
}) => {
  const [displayValue, setDisplayValue] = useState(animate ? '0' : value);
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Icon mapping
  const iconMap: Record<string, React.ReactNode> = {
    trending: <TrendingUp className="w-6 h-6" />,
    target: <Target className="w-6 h-6" />,
    users: <Users className="w-6 h-6" />,
    dollar: <DollarSign className="w-6 h-6" />,
    chart: <BarChart3 className="w-6 h-6" />,
    arrow: <ArrowUp className="w-6 h-6" />,
  };

  // Color mappings
  const colorClasses = {
    primary: {
      bg: 'bg-primary/10',
      icon: 'text-primary',
      border: 'border-primary/20'
    },
    success: {
      bg: 'bg-green-50',
      icon: 'text-green-600',
      border: 'border-green-200'
    },
    warning: {
      bg: 'bg-orange-50',
      icon: 'text-orange-600',
      border: 'border-orange-200'
    },
    info: {
      bg: 'bg-blue-50',
      icon: 'text-blue-600',
      border: 'border-blue-200'
    }
  };

  const colorClass = colorClasses[color];

  // Intersection Observer for animation
  useEffect(() => {
    if (!animate || !cardRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(cardRef.current);

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, [animate]);

  // Animate number counting
  useEffect(() => {
    if (!animate || !isVisible) return;

    // Extract number from value string
    const numberMatch = value.match(/[\d,]+\.?\d*/);
    if (!numberMatch) {
      setDisplayValue(value);
      return;
    }

    const targetNumber = parseFloat(numberMatch[0].replace(/,/g, ''));
    const prefix = value.substring(0, value.indexOf(numberMatch[0]));
    const suffix = value.substring(value.indexOf(numberMatch[0]) + numberMatch[0].length);

    let currentNumber = 0;
    const duration = 2000; // 2 seconds
    const steps = 60;
    const increment = targetNumber / steps;
    const stepDuration = duration / steps;

    const timer = setInterval(() => {
      currentNumber += increment;

      if (currentNumber >= targetNumber) {
        currentNumber = targetNumber;
        clearInterval(timer);
      }

      // Format number with commas
      const formattedNumber = Math.floor(currentNumber).toLocaleString();
      setDisplayValue(`${prefix}${formattedNumber}${suffix}`);
    }, stepDuration);

    return () => clearInterval(timer);
  }, [isVisible, value, animate]);

  // Default icon based on common metric types
  const getDefaultIcon = (): React.ReactNode => {
    const lowerLabel = label.toLowerCase();

    if (lowerLabel.includes('revenue') || lowerLabel.includes('sales') || lowerLabel.includes('income')) {
      return iconMap.dollar;
    }
    if (lowerLabel.includes('traffic') || lowerLabel.includes('visitors') || lowerLabel.includes('users')) {
      return iconMap.users;
    }
    if (lowerLabel.includes('conversion') || lowerLabel.includes('rate')) {
      return iconMap.target;
    }
    if (lowerLabel.includes('growth') || lowerLabel.includes('increase')) {
      return iconMap.arrow;
    }

    return iconMap.trending;
  };

  const displayIcon = icon ? iconMap[icon] : getDefaultIcon();

  return (
    <Card
      ref={cardRef}
      className={`transition-all duration-300 hover:shadow-lg ${colorClass.border} ${className}`}
    >
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          {/* Icon */}
          <div className={`flex-shrink-0 w-12 h-12 ${colorClass.bg} rounded-lg flex items-center justify-center`}>
            <div className={colorClass.icon}>
              {displayIcon}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="space-y-1">
              {/* Value */}
              <div className="text-2xl font-bold text-foreground">
                {displayValue}
              </div>

              {/* Label */}
              <div className="text-sm font-medium text-muted-foreground">
                {label}
              </div>

              {/* Description */}
              {description && (
                <div className="text-xs text-muted-foreground leading-relaxed">
                  {description}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Decorative element */}
        <div className={`mt-4 h-1 w-full ${colorClass.bg} rounded-full overflow-hidden`}>
          <div
            className={`h-full bg-gradient-to-r transition-all duration-1000 ease-out ${
              color === 'primary' ? 'from-primary to-primary/60' :
              color === 'success' ? 'from-green-600 to-green-400' :
              color === 'warning' ? 'from-orange-600 to-orange-400' :
              'from-blue-600 to-blue-400'
            }`}
            style={{
              width: isVisible ? '100%' : '0%'
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default MetricCard;