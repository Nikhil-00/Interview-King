import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Target, TrendingUp, AlertTriangle, Lightbulb, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScoreCard } from '@/components/ScoreCard';
import { InsightCard } from '@/components/InsightCard';

interface AnalysisData {
  ats_score: number;
  similarity_score: number;
  strength: string;
  area_of_improvement: string;
  matching_qualifications: string;
  skills_gap: string;
  technical_questions: string;
  behavioral_questions: string;
  situation_questions: string;
  leadership_questions: string;
}

const AnalysisResults = () => {
  const navigate = useNavigate();
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get analysis data from sessionStorage
    const storedData = sessionStorage.getItem('analysisResult');
    if (storedData) {
      try {
        const data = JSON.parse(storedData);
        console.log('📊 Analysis Data received:', data);
        console.log('💪 Strengths:', data.strength);
        console.log('⚠️ Areas of Improvement:', data.area_of_improvement);
        console.log('🎯 Matching Qualifications:', data.matching_qualifications);
        console.log('📈 Skills Gap:', data.skills_gap);
        setAnalysisData(data);
      } catch (error) {
        console.error('Error parsing analysis data:', error);
        navigate('/'); // Redirect to upload if no valid data
      }
    } else {
      navigate('/'); // Redirect to upload if no data
    }
    setLoading(false);
  }, [navigate]);

    // Helper function to parse text into array
  const parseTextToArray = (text: string): string[] => {
    if (!text) return [];
    
    // First clean the text - remove ** markers and clean formatting
    const cleanedText = text
      .replace(/\*\*/g, '') // Remove all ** markers
      .replace(/\*/g, '') // Remove single * markers too
      .trim();
    
    // Split by bullet points and clean each item
    const items = cleanedText
      .split(/[\n\r]+/) // Split by new lines
      .map(item => item
        .replace(/^[\s•\-\d+\.\)\(\[\]]+/, '') // Remove bullets, numbers, dashes at start
        .trim() // Trim whitespace
      )
      .filter(item => item.length > 15) // Filter out very short items
      .slice(0, 4); // Limit to 4 items for display
      
    return items.length > 0 ? items : [cleanedText.substring(0, 200) + '...'];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading analysis results...</p>
        </div>
      </div>
    );
  }

  if (!analysisData) {
    return (
      <div className="min-h-screen bg-gradient-bg flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">No analysis data found</p>
          <Button onClick={() => navigate('/')}>Go back to upload</Button>
        </div>
      </div>
    );
  }

  const insights = {
    strengths: parseTextToArray(analysisData.strength),
    weaknesses: parseTextToArray(analysisData.area_of_improvement),
    skillGaps: parseTextToArray(analysisData.skills_gap),
    improvements: parseTextToArray(analysisData.matching_qualifications)
  };

  console.log('🔍 Parsed Insights:', insights);

  return (
    <div className="min-h-screen bg-gradient-bg">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Upload</span>
          </Button>
          
          <Button
            variant="professional"
            onClick={() => {
              // Store analysis data for interview page
              sessionStorage.setItem('interviewData', JSON.stringify({
                technical_questions: analysisData.technical_questions,
                behavioral_questions: analysisData.behavioral_questions,
                situation_questions: analysisData.situation_questions,
                leadership_questions: analysisData.leadership_questions
              }));
              navigate('/interview');
            }}
            className="flex items-center space-x-2"
          >
            <span>Start Interview Prep</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-foreground mb-2">Analysis Results</h1>
          <p className="text-muted-foreground">
            Your resume has been analyzed. Here are the key insights and recommendations.
          </p>
        </div>

        {/* Scores Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <ScoreCard
            title="ATS Score"
            score={analysisData.ats_score}
            description="Applicant Tracking System Compatibility"
          />
          <ScoreCard
            title="JD Match Score"
            score={analysisData.similarity_score}
            description="Resume-Job Description Match"
          />
        </div>

        {/* Insights Section */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-center text-foreground mb-8">
            Detailed Analysis
          </h2>
          
          <div className="grid lg:grid-cols-2 xl:grid-cols-4 gap-6">
            <InsightCard
              title="Strengths"
              items={insights.strengths}
              icon={Target}
              variant="strengths"
            />
            <InsightCard
              title="Weaknesses"
              items={insights.weaknesses}
              icon={AlertTriangle}
              variant="weaknesses"
            />
            <InsightCard
              title="Skill Gaps"
              items={insights.skillGaps}
              icon={TrendingUp}
              variant="gaps"
            />
            <InsightCard
              title="Matching Qualifications"
              items={insights.improvements}
              icon={Lightbulb}
              variant="improvements"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
          <Button
            variant="hero"
            size="lg"
            onClick={() => {
              // Store analysis data for interview page
              sessionStorage.setItem('interviewData', JSON.stringify({
                technical_questions: analysisData.technical_questions,
                behavioral_questions: analysisData.behavioral_questions,
                situation_questions: analysisData.situation_questions,
                leadership_questions: analysisData.leadership_questions
              }));
              navigate('/interview');
            }}
            className="px-8"
          >
            Start Interview Preparation
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate('/')}
            className="px-8"
          >
            Analyze Another Resume
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResults;