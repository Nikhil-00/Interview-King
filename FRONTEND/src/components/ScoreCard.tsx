import React from 'react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface ScoreCardProps {
  title: string;
  score: number;
  maxScore?: number;
  description?: string;
  className?: string;
}

export const ScoreCard: React.FC<ScoreCardProps> = ({
  title,
  score,
  maxScore = 100,
  description,
  className
}) => {
  const percentage = Math.min((score / maxScore) * 100, 100);
  
  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-success';
    if (percentage >= 60) return 'text-info';
    if (percentage >= 40) return 'text-warning';
    return 'text-destructive';
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-success';
    if (percentage >= 60) return 'bg-info';
    if (percentage >= 40) return 'bg-warning';
    return 'bg-destructive';
  };

  return (
    <div className={cn(
      "p-6 bg-gradient-card rounded-lg shadow-card hover:shadow-card-hover transition-all duration-300 border border-border",
      className
    )}>
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Score</span>
            <span className={cn("text-2xl font-bold", getScoreColor(percentage))}>
              {score}%
            </span>
          </div>
          
          <div className="space-y-2">
            <Progress 
              value={percentage} 
              className="h-3"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};