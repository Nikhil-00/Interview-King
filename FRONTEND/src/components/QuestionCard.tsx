import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface QuestionCardProps {
  title: string;
  count: number;
  icon: LucideIcon;
  description: string;
  onClick: () => void;
  className?: string;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  title,
  count,
  icon: Icon,
  description,
  onClick,
  className
}) => {
  return (
    <div className={cn(
      "group cursor-pointer h-full",
      className
    )}>
      <Button
        variant="outline"
        className={cn(
          "w-full h-full min-h-[160px] p-6 bg-gradient-card hover:shadow-card-hover transition-all duration-300",
          "border border-border hover:border-primary/50 group-hover:scale-[1.02]"
        )}
        onClick={onClick}
      >
        <div className="space-y-4 text-left w-full h-full flex flex-col justify-between">
          <div className="flex items-start justify-between w-full">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className="p-2 bg-primary/20 rounded-full group-hover:bg-primary/30 transition-colors flex-shrink-0">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-foreground leading-tight truncate">{title}</h3>
              </div>
            </div>
            <div className="text-right flex-shrink-0 ml-3 min-w-[60px]">
              <div className="text-xl font-bold text-primary">{count}</div>
              <div className="text-xs text-muted-foreground whitespace-nowrap">Questions</div>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground leading-relaxed overflow-hidden flex-1" 
             style={{
               display: '-webkit-box',
               WebkitLineClamp: 2,
               WebkitBoxOrient: 'vertical',
               textOverflow: 'ellipsis'
             }}>
            {description}
          </p>
        </div>
      </Button>
    </div>
  );
};