import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Briefcase, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FileUpload } from '@/components/FileUpload';
import { toast } from '@/hooks/use-toast';
import { uploadFiles } from '@/services/api';

const UploadPage = () => {
  const navigate = useNavigate();
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobFile, setJobFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    if (!resumeFile) {
      toast({
        title: "Resume Required",
        description: "Please upload your resume to get started.",
        variant: "destructive",
      });
      return;
    }

    if (!jobFile) {
      toast({
        title: "Job Description Required", 
        description: "Please upload the job description for better analysis.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      console.log('Starting analysis with files:', resumeFile.name, jobFile.name);
      const analysisResult = await uploadFiles(resumeFile, jobFile);
      
      toast({
        title: "Analysis Complete",
        description: "Your resume has been analyzed successfully!",
      });
      
      // Store results in sessionStorage for AnalysisResults page
      sessionStorage.setItem('analysisResult', JSON.stringify(analysisResult));
      
      navigate('/analysis');
    } catch (error) {
      console.error('Analysis failed:', error);
      toast({
        title: "Analysis Failed",
        description: "There was an error analyzing your files. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-bg">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-gradient-primary rounded-full shadow-card">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Interview King
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Resume & Interview Analyzer
          </p>
          <p className="text-lg text-muted-foreground mt-2">
            Upload your resume and job requirements to get personalized insights and interview preparation.
          </p>
        </div>

        {/* Upload Section */}
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Resume Upload */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">Upload Resume</h2>
                <span className="text-sm text-destructive">*Required</span>
              </div>
              <FileUpload
                label="Upload your resume (PDF/DOC)"
                accept=".pdf,.doc,.docx"
                onFileSelect={setResumeFile}
              />
            </div>

            {/* Job Requirements Upload */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Briefcase className="w-5 h-5 text-secondary" />
                <h2 className="text-xl font-semibold text-foreground">Job Requirements</h2>
                <span className="text-sm text-muted-foreground">Optional</span>
              </div>
              <FileUpload
                label="Upload job description (PDF/DOC/TXT)"
                accept=".pdf,.doc,.docx,.txt"
                onFileSelect={setJobFile}
              />
            </div>
          </div>

          {/* Analyze Button */}
          <div className="text-center">
            <Button
              variant="hero"
              size="lg"
              onClick={handleAnalyze}
              disabled={isAnalyzing || !resumeFile || !jobFile}
              className="px-12 py-3 text-lg"
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Analyze Resume
                </>
              )}
            </Button>
            <p className="text-sm text-muted-foreground mt-3">
              Analysis takes 30-60 seconds to complete
            </p>
          </div>

          {/* Features Preview */}
          <div className="grid md:grid-cols-3 gap-6 mt-16">
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 text-success" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">ATS Score</h3>
              <p className="text-sm text-muted-foreground">
                Get your Applicant Tracking System compatibility score
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-info/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-6 h-6 text-info" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">JD Match</h3>
              <p className="text-sm text-muted-foreground">
                See how well your resume matches the job requirements
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-warning/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-warning" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Interview Prep</h3>
              <p className="text-sm text-muted-foreground">
                Practice with AI-powered interview questions
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;