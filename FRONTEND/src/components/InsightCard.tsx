import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InsightCardProps {
  title: string;
  items: string[];
  icon: LucideIcon;
  variant?: 'strengths' | 'weaknesses' | 'gaps' | 'improvements';
  className?: string;
}

export const InsightCard: React.FC<InsightCardProps> = ({
  title,
  items,
  icon: Icon,
  variant = 'strengths',
  className
}) => {
  const getVariantStyles = (variant: string) => {
    switch (variant) {
      case 'strengths':
        return {
          iconBg: 'bg-success/20',
          iconColor: 'text-success',
          border: 'border-success/20'
        };
      case 'weaknesses':
        return {
          iconBg: 'bg-destructive/20',
          iconColor: 'text-destructive',
          border: 'border-destructive/20'
        };
      case 'gaps':
        return {
          iconBg: 'bg-warning/20',
          iconColor: 'text-warning',
          border: 'border-warning/20'
        };
      case 'improvements':
        return {
          iconBg: 'bg-info/20',
          iconColor: 'text-info',
          border: 'border-info/20'
        };
      default:
        return {
          iconBg: 'bg-primary/20',
          iconColor: 'text-primary',
          border: 'border-primary/20'
        };
    }
  };

  const styles = getVariantStyles(variant);

  return (
    <div className={cn(
      "p-6 bg-gradient-card rounded-lg shadow-card hover:shadow-card-hover transition-all duration-300 border",
      styles.border,
      className
    )}>
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className={cn("p-2 rounded-full", styles.iconBg)}>
            <Icon className={cn("w-5 h-5", styles.iconColor)} />
          </div>
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        </div>
        
        <div className="space-y-2">
          {items.length > 0 ? (
            <ul className="space-y-2">
              {items.map((item, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className={cn("w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0", 
                    variant === 'strengths' ? 'bg-success' :
                    variant === 'weaknesses' ? 'bg-destructive' :
                    variant === 'gaps' ? 'bg-warning' : 'bg-info'
                  )} />
                  <span className="text-sm text-foreground leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              Analysis will be shown here after processing your resume.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};