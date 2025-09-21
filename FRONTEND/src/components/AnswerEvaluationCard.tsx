import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, AlertCircle, TrendingUp, Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnswerEvaluation {
  score: number;
  feedback: string;
  correct_answer: string;
  strengths: string;
  improvements: string;
}

interface AnswerEvaluationCardProps {
  question: string;
  correctAnswer: string;
  questionType: 'technical' | 'behavioral' | 'situational' | 'leadership';
  questionNumber: number;
}

export const AnswerEvaluationCard: React.FC<AnswerEvaluationCardProps> = ({
  question,
  correctAnswer,
  questionType,
  questionNumber
}) => {
  const [userAnswer, setUserAnswer] = useState('');
  const [evaluation, setEvaluation] = useState<AnswerEvaluation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim()) {
      alert('Please provide an answer before submitting.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8000/evaluate_answer/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: question,
          student_answer: userAnswer,
          correct_answer: correctAnswer,
          question_type: questionType
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to evaluate answer');
      }

      const evaluationResult: AnswerEvaluation = await response.json();
      setEvaluation(evaluationResult);
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error evaluating answer:', error);
      alert('Error evaluating your answer. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return 'default'; // Use default for good scores (primary color)
    if (score >= 60) return 'secondary'; // Use secondary for moderate scores
    return 'destructive'; // Use destructive for low scores (red)
  };

  return (
    <Card className="p-6 bg-gradient-card shadow-card hover:shadow-card-hover transition-all duration-300">
      {/* Question Header */}
      <div className="flex items-start space-x-4 mb-6">
        <div className="flex-shrink-0 w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
          <span className="text-sm font-semibold text-primary">{questionNumber}</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <Badge variant="outline" className="capitalize">
              {questionType}
            </Badge>
          </div>
          <p className="text-foreground leading-relaxed font-medium">
            {question}
          </p>
        </div>
      </div>

      {/* Answer Input */}
      {!isSubmitted && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Your Answer:
            </label>
            <Textarea
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Type your answer here..."
              className="min-h-[120px] resize-none"
              disabled={isLoading}
            />
          </div>
          <div className="flex justify-end">
            <Button
              onClick={handleSubmitAnswer}
              disabled={isLoading || !userAnswer.trim()}
              className="flex items-center space-x-2"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span>{isLoading ? 'Evaluating...' : 'Submit Answer'}</span>
            </Button>
          </div>
        </div>
      )}

      {/* Evaluation Results */}
      {evaluation && isSubmitted && (
        <div className="space-y-6">
          <Separator />
          
          {/* Score Section */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg",
                evaluation.score >= 80 ? "bg-green-100 text-green-700" :
                evaluation.score >= 60 ? "bg-yellow-100 text-yellow-700" :
                "bg-red-100 text-red-700"
              )}>
                {evaluation.score}
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Your Score</h3>
                <p className="text-sm text-muted-foreground">Out of 100</p>
              </div>
            </div>
            <Badge 
              variant={getScoreBadgeVariant(evaluation.score)}
              className="px-3 py-1"
            >
              {evaluation.score >= 80 ? 'Excellent' :
               evaluation.score >= 60 ? 'Good' : 'Needs Improvement'}
            </Badge>
          </div>

          {/* Your Answer */}
          <div className="space-y-2">
            <h4 className="font-semibold text-foreground flex items-center space-x-2">
              <span>Your Answer</span>
            </h4>
            <div className="p-4 bg-muted/30 rounded-lg border-l-4 border-blue-500">
              <p className="text-foreground leading-relaxed">{userAnswer}</p>
            </div>
          </div>

          {/* AI Feedback */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground">AI Feedback</h4>
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-foreground leading-relaxed">{evaluation.feedback}</p>
            </div>
          </div>

          {/* Strengths */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>What You Did Well</span>
            </h4>
            <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-foreground leading-relaxed">{evaluation.strengths}</p>
            </div>
          </div>

          {/* Areas for Improvement */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-orange-600" />
              <span>Areas for Improvement</span>
            </h4>
            <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
              <p className="text-foreground leading-relaxed">{evaluation.improvements}</p>
            </div>
          </div>

          {/* Correct Answer */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-blue-600" />
              <span>Sample/Expected Answer</span>
            </h4>
            <div className="p-4 bg-gray-50 dark:bg-gray-950/20 rounded-lg border border-gray-200 dark:border-gray-800">
              <p className="text-foreground leading-relaxed">{evaluation.correct_answer}</p>
            </div>
          </div>

          {/* Reset Button */}
          <div className="flex justify-center pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setUserAnswer('');
                setEvaluation(null);
                setIsSubmitted(false);
              }}
              className="flex items-center space-x-2"
            >
              <span>Try Again</span>
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};