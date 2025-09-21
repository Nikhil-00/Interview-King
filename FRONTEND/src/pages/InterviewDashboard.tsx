import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Code2, 
  Users, 
  Lightbulb, 
  Crown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QuestionCard } from '@/components/QuestionCard';
import { Card } from '@/components/ui/card';

type QuestionType = 'technical' | 'behavioral' | 'situational' | 'leadership';

interface InterviewData {
  technical_questions: string;
  behavioral_questions: string;
  situation_questions: string;
  leadership_questions: string;
}

const InterviewDashboard = () => {
  const navigate = useNavigate();
  const [interviewData, setInterviewData] = useState<InterviewData | null>(null);
  const [parsedQuestions, setParsedQuestions] = useState<{
    technical: string[];
    behavioral: string[];
    situational: string[];
    leadership: string[];
  }>({
    technical: [],
    behavioral: [],
    situational: [],
    leadership: []
  });

  useEffect(() => {
    // Get interview data from sessionStorage
    const storedData = sessionStorage.getItem('interviewData');
    console.log('🔍 Checking for stored interview data:', storedData);
    
    if (storedData) {
      try {
        const data = JSON.parse(storedData);
        console.log('📊 Parsed interview data:', data);
        setInterviewData(data);
        
        // Parse questions from backend data
        const parsed = {
          technical: parseQuestions(data.technical_questions, 'Technical'),
          behavioral: parseQuestions(data.behavioral_questions, 'Behavioral'),
          situational: parseQuestions(data.situation_questions, 'Situational'),
          leadership: parseQuestions(data.leadership_questions, 'Leadership')
        };
        
        console.log('🎯 Parsed questions:', parsed);
        setParsedQuestions(parsed);
      } catch (error) {
        console.error('❌ Error parsing interview data:', error);
        // Fallback to mock data if parsing fails
        setDefaultQuestions();
      }
    } else {
      console.log('⚠️ No interview data found, using mock data');
      setDefaultQuestions();
    }
  }, []);

  // Helper function to parse questions from backend text
  const parseQuestions = (text: string, type: string): string[] => {
    if (!text) {
      console.log(`⚠️ No ${type} questions text provided`);
      return [];
    }
    
    console.log(`🔧 Parsing ${type} questions:`, text.substring(0, 200) + '...');
    
    // Try multiple parsing strategies
    let questions: string[] = [];
    
    // Strategy 1: Split by Q1:, Q2:, etc.
    const qPattern = text.split(/Q\d+:\s*/);
    if (qPattern.length > 1) {
      questions = qPattern
        .slice(1) // Remove first empty element
        .map(q => {
          // Remove A1:, A2: parts and everything after
          const questionOnly = q.split(/A\d+:/)[0].trim();
          // Clean up extra whitespace and newlines
          return questionOnly.replace(/\s+/g, ' ').trim();
        })
        .filter(q => q.length > 10); // Filter out very short strings
    }
    
    // Strategy 2: If Q pattern didn't work, try numbered list
    if (questions.length === 0) {
      const numberPattern = text.split(/\d+\.\s*/);
      if (numberPattern.length > 1) {
        questions = numberPattern
          .slice(1)
          .map(q => q.split('\n')[0].trim()) // Take first line only
          .filter(q => q.length > 10);
      }
    }
    
    // Strategy 3: If still no questions, split by newlines and filter
    if (questions.length === 0) {
      questions = text
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 10 && line.includes('?'))
        .slice(0, 10);
    }
    
    console.log(`✅ Parsed ${questions.length} ${type} questions:`, questions);
    return questions.slice(0, 10); // Limit to 10 questions max
  };

  const setDefaultQuestions = () => {
    console.log('🔄 Setting default mock questions');
    setParsedQuestions({
      technical: [
        "Explain the difference between REST and GraphQL APIs. When would you use each?",
        "How would you optimize a slow database query?",
        "Describe the concept of microservices and their advantages.",
        "What is the difference between synchronous and asynchronous programming?",
        "Explain how garbage collection works in your preferred programming language."
      ],
      behavioral: [
        "Tell me about a time when you had to work with a difficult team member.",
        "Describe a challenging project you worked on and how you overcame obstacles.",
        "How do you handle tight deadlines and competing priorities?",
        "Give an example of when you had to learn a new technology quickly."
      ],
      situational: [
        "How would you handle a situation where a client is unhappy with the delivered product?",
        "What would you do if you discovered a critical bug in production just before a major release?",
        "How would you approach a project with unclear requirements?",
        "What steps would you take if a team member consistently missed deadlines?"
      ],
      leadership: [
        "Describe your leadership style and give an example of when you've used it effectively.",
        "How do you motivate team members who are struggling with their tasks?",
        "Tell me about a time when you had to make a difficult decision that affected your team.",
        "How do you handle conflicts between team members."
      ]
    });
  };

  const questionCategories = [
    {
      type: 'technical' as QuestionType,
      title: 'Technical Questions',
      count: parsedQuestions.technical.length,
      icon: Code2,
      description: 'Practice coding problems, system design, and technical concepts.'
    },
    {
      type: 'behavioral' as QuestionType,
      title: 'Behavioral Questions',
      count: parsedQuestions.behavioral.length,
      icon: Users,
      description: 'Practice past experiences, teamwork, and problem-solving.'
    },
    {
      type: 'situational' as QuestionType,
      title: 'Situation-Based Questions',
      count: parsedQuestions.situational.length,
      icon: Lightbulb,
      description: 'Practice hypothetical scenarios and decision-making.'
    },
    {
      type: 'leadership' as QuestionType,
      title: 'Leadership Questions',
      count: parsedQuestions.leadership.length,
      icon: Crown,
      description: 'Practice leadership experience and team management.'
    }
  ];

  const handleSelectCategory = (type: QuestionType) => {
    if (type) {
      console.log(`🎯 Selected category: ${type}, questions:`, parsedQuestions[type]);
      navigate(`/practice?type=${type}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-bg">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/analysis')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Analysis</span>
          </Button>
        </div>

        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-foreground mb-2">Interview Preparation</h1>
          <p className="text-muted-foreground">
            Choose a question category to start practicing. Each category focuses on different aspects of the interview process.
          </p>
        </div>

        {/* Question Categories */}
        <div className="grid sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {questionCategories.map((category) => (
            <QuestionCard
              key={category.type}
              title={category.title}
              count={category.count}
              icon={category.icon}
              description={category.description}
              onClick={() => handleSelectCategory(category.type)}
              className="h-full"
            />
          ))}
        </div>

        {/* Tips Section */}
        <Card className="max-w-4xl mx-auto mt-12 p-8 bg-gradient-card shadow-card">
          <h2 className="text-xl font-semibold text-foreground mb-4">Interview Tips</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h3 className="font-medium text-foreground">Preparation Tips:</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Research the company and role thoroughly</li>
                <li>• Practice your answers out loud</li>
                <li>• Prepare specific examples using the STAR method</li>
                <li>• Have questions ready to ask the interviewer</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-foreground">During the Interview:</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Listen carefully to the full question</li>
                <li>• Take a moment to think before answering</li>
                <li>• Use concrete examples and metrics</li>
                <li>• Ask for clarification if needed</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default InterviewDashboard;