import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnswerEvaluationCard } from '@/components/AnswerEvaluationCard';

interface QuestionData {
  question: string;
  answer: string;
}

const QuestionPractice = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const questionType = searchParams.get('type') as 'technical' | 'behavioral' | 'situational' | 'leadership';
  
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get interview data from sessionStorage
    const storedData = sessionStorage.getItem('interviewData');
    
    if (storedData && questionType) {
      try {
        const data = JSON.parse(storedData);
        
        // Map question type to correct field name
        const fieldMapping = {
          'technical': 'technical_questions',
          'behavioral': 'behavioral_questions', 
          'situational': 'situation_questions', // Note: backend uses 'situation_questions'
          'leadership': 'leadership_questions'
        };
        
        const questionsText = data[fieldMapping[questionType]];
        console.log(`🔍 Loading ${questionType} questions from field: ${fieldMapping[questionType]}`);
        console.log(`📝 Questions text:`, questionsText?.substring(0, 200) + '...');
        
        // Parse questions and answers from backend data
        const parsedQuestions = parseQuestionsAndAnswers(questionsText);
        setQuestions(parsedQuestions);
      } catch (error) {
        console.error('Error parsing interview data:', error);
        setDefaultQuestions();
      }
    } else {
      setDefaultQuestions();
    }
    setLoading(false);
  }, [questionType]);

  // Helper function to parse questions and answers from backend text
  const parseQuestionsAndAnswers = (text: string): QuestionData[] => {
    if (!text) {
      console.log('⚠️ No questions text provided');
      return [];
    }
    
    console.log('🔧 Parsing questions and answers from text:', text.substring(0, 300) + '...');
    
    const questionsData: QuestionData[] = [];
    
    // Split by Q1:, Q2:, etc. and then find corresponding A1:, A2:, etc.
    const sections = text.split(/Q\d+:\s*/);
    
    for (let i = 1; i < sections.length; i++) {
      const section = sections[i];
      const answerMatch = section.split(/A\d+:\s*/);
      
      if (answerMatch.length >= 2) {
        const question = answerMatch[0].trim().replace(/\n/g, ' ').replace(/\s+/g, ' ');
        const answer = answerMatch[1].trim().replace(/\s+/g, ' ');
        
        if (question && answer && question.length > 10 && answer.length > 10) {
          questionsData.push({
            question: question,
            answer: answer
          });
          console.log(`✅ Parsed Q${i}: ${question.substring(0, 50)}...`);
        } else {
          console.log(`⚠️ Skipped Q${i}: question or answer too short`);
        }
      } else {
        console.log(`⚠️ Could not find answer for Q${i}`);
      }
    }
    
    console.log(`🎯 Total parsed questions: ${questionsData.length}`);
    return questionsData.slice(0, 10); // Limit to 10 questions
  };

  const setDefaultQuestions = () => {
    const defaultQuestions: Record<string, QuestionData[]> = {
      technical: [
        {
          question: "Explain the difference between REST and GraphQL APIs. When would you use each?",
          answer: "REST (Representational State Transfer) is an architectural style for web services that uses HTTP methods and follows a stateless, client-server communication model. GraphQL is a query language and runtime for APIs that allows clients to request exactly the data they need. Use REST for simple CRUD operations, caching, and when you need standardized HTTP methods. Use GraphQL when you need flexible data fetching, have multiple client types, or want to reduce over-fetching of data."
        },
        {
          question: "How would you optimize a slow database query?",
          answer: "To optimize a slow database query: 1) Analyze the query execution plan to identify bottlenecks. 2) Add appropriate indexes on frequently queried columns. 3) Optimize JOIN operations by ensuring proper indexing and join order. 4) Use LIMIT clauses to reduce result set size. 5) Consider query rewriting to use more efficient constructs. 6) Implement database partitioning for large tables. 7) Use query caching when appropriate. 8) Consider denormalization for read-heavy workloads."
        }
      ],
      behavioral: [
        {
          question: "Tell me about a time when you had to work with a difficult team member.",
          answer: "Using the STAR method: Situation - I worked with a team member who consistently missed deadlines and was defensive about feedback. Task - I needed to ensure project success while maintaining team cohesion. Action - I scheduled a private one-on-one meeting to understand their challenges, offered support and resources, and established clear expectations with regular check-ins. Result - The team member's performance improved significantly, and we completed the project on time while strengthening our working relationship."
        }
      ],
      situational: [
        {
          question: "How would you handle a situation where a client is unhappy with the delivered product?",
          answer: "I would: 1) Listen actively to understand their specific concerns without becoming defensive. 2) Acknowledge their frustration and take ownership of the issue. 3) Ask clarifying questions to fully understand the gap between expectations and delivery. 4) Propose concrete solutions with timelines to address their concerns. 5) Implement the agreed-upon changes quickly and keep them updated on progress. 6) Follow up after resolution to ensure satisfaction and prevent similar issues in the future."
        }
      ],
      leadership: [
        {
          question: "Describe your leadership style and give an example of when you've used it effectively.",
          answer: "My leadership style is collaborative and adaptive, focusing on empowering team members while providing clear direction. For example, when leading a cross-functional project with tight deadlines, I facilitated daily stand-ups to ensure alignment, delegated tasks based on individual strengths, and maintained an open-door policy for problem-solving. I provided regular feedback and recognition, which resulted in the team delivering the project ahead of schedule with high quality and improved team morale."
        }
      ]
    };

    setQuestions(defaultQuestions[questionType] || []);
  };

  const getTypeTitle = (type: string) => {
    const titles = {
      technical: 'Technical Questions',
      behavioral: 'Behavioral Questions',
      situational: 'Situation-Based Questions',
      leadership: 'Leadership Questions'
    };
    return titles[type as keyof typeof titles] || 'Questions';
  };

  const handlePrevQuestion = () => {
    setCurrentIndex(prev => (prev - 1 + questions.length) % questions.length);
  };

  const handleNextQuestion = () => {
    setCurrentIndex(prev => (prev + 1) % questions.length);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading questions...</p>
        </div>
      </div>
    );
  }

  if (!questionType || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-bg flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">No questions available</p>
          <Button onClick={() => navigate('/interview')}>Back to Interview Dashboard</Button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="min-h-screen bg-gradient-bg">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/interview')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Interview Dashboard</span>
          </Button>
          
          <div className="text-sm text-muted-foreground">
            Question {currentIndex + 1} of {questions.length}
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {getTypeTitle(questionType)}
          </h1>
          <p className="text-muted-foreground">
            Practice answering questions and get AI-powered feedback
          </p>
        </div>

        {/* Question Card */}
        <div className="max-w-4xl mx-auto mb-8">
          <AnswerEvaluationCard
            key={`${questionType}-${currentIndex}`} // Add key to reset component when question changes
            question={currentQuestion.question}
            correctAnswer={currentQuestion.answer}
            questionType={questionType}
            questionNumber={currentIndex + 1}
          />
        </div>

        {/* Navigation */}
        <div className="flex justify-center space-x-4">
          <Button
            variant="outline"
            onClick={handlePrevQuestion}
            disabled={questions.length <= 1}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setCurrentIndex(0)}
            className="flex items-center space-x-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset to First</span>
          </Button>
          
          <Button
            variant="outline"
            onClick={handleNextQuestion}
            disabled={questions.length <= 1}
            className="flex items-center space-x-2"
          >
            <span>Next</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuestionPractice;