import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ExternalLink, CheckCircle, Clock, Briefcase, Users, BarChart } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, BriefcaseBusiness, UserRound, Bot, BarChart3 } from "lucide-react";

const HowItWorks = () => {
  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">How It Works</h1>
          <p className="text-muted-foreground">
            Learn how our AI-powered hiring platform transforms your recruitment process
          </p>
        </div>
        <Link to="/">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="employers" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="employers" className="text-base py-3">
            <BriefcaseBusiness className="mr-2 h-4 w-4" />
            For Employers
          </TabsTrigger>
          <TabsTrigger value="candidates" className="text-base py-3">
            <UserRound className="mr-2 h-4 w-4" />
            For Candidates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="employers" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary mr-2">1</span>
                  Post Job
                </CardTitle>
                <CardDescription>
                  Create and publish job listings with AI assistance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Easily create comprehensive job postings with our AI content generator. Set up requirements and preferences for automated candidate screening.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary mr-2">2</span>
                  AI Interviews
                </CardTitle>
                <CardDescription>
                  Let our AI conduct preliminary interviews
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Our AI interviewer conducts video interviews with candidates, asking job-specific questions and analyzing responses for fit and competency.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary mr-2">3</span>
                  Review Results
                </CardTitle>
                <CardDescription>
                  Analyze detailed reports and candidate rankings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Review comprehensive candidate assessments, including interview performance, skill match, and personalized insights to make informed hiring decisions.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="bg-muted p-8 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Key Benefits for Employers</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium">Save Time & Resources</h3>
                  <p className="text-sm text-muted-foreground">
                    Reduce screening time by 85% with automated interview processes
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium">Improve Hiring Quality</h3>
                  <p className="text-sm text-muted-foreground">
                    AI-powered analytics identify the best candidates objectively
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium">Enhance Candidate Experience</h3>
                  <p className="text-sm text-muted-foreground">
                    Provide a modern, flexible interview process candidates appreciate
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium">Reduce Bias</h3>
                  <p className="text-sm text-muted-foreground">
                    Standardized assessments evaluate all candidates equally
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium">Data-Driven Decisions</h3>
                  <p className="text-sm text-muted-foreground">
                    Comprehensive analytics provide insights for better hiring decisions
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium">Scale Effortlessly</h3>
                  <p className="text-sm text-muted-foreground">
                    Handle high-volume recruiting without additional resources
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center p-8 bg-primary/5 rounded-lg">
            <h2 className="text-2xl font-bold mb-2">Ready to Transform Your Hiring Process?</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Join thousands of companies using our AI-powered platform to find the best talent faster and more efficiently.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <Button size="lg">
                  Start Free Trial
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline" size="lg">
                  Request Demo
                </Button>
              </Link>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="candidates" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary mr-2">1</span>
                  Apply
                </CardTitle>
                <CardDescription>
                  Apply to positions with a simple application process
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Submit your resume and complete a quick profile. Our AI matches your skills and experience to relevant positions.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary mr-2">2</span>
                  Interview
                </CardTitle>
                <CardDescription>
                  Complete an AI-led video interview at your convenience
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Participate in a video interview with our AI interviewer anytime, anywhere. Answer job-specific questions that showcase your skills and experience.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary mr-2">3</span>
                  Get Hired
                </CardTitle>
                <CardDescription>
                  Stand out based on your qualifications, not just your resume
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Your interview performance and qualifications are objectively evaluated, giving you a fair chance to demonstrate your abilities to potential employers.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="bg-muted p-8 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Candidate Benefits</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium">Convenience</h3>
                  <p className="text-sm text-muted-foreground">
                    Complete interviews anytime, anywhere on your schedule
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium">Fair Evaluation</h3>
                  <p className="text-sm text-muted-foreground">
                    Be judged on skills and qualifications, not unconscious bias
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium">Practice Makes Perfect</h3>
                  <p className="text-sm text-muted-foreground">
                    Gain valuable interview experience in a low-pressure environment
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium">Feedback & Insights</h3>
                  <p className="text-sm text-muted-foreground">
                    Receive personalized feedback to improve your interview skills
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium">Faster Process</h3>
                  <p className="text-sm text-muted-foreground">
                    Get through the hiring pipeline more quickly with fewer delays
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium">Better Job Matches</h3>
                  <p className="text-sm text-muted-foreground">
                    Be matched with positions where you're likely to succeed
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center p-8 bg-primary/5 rounded-lg">
            <h2 className="text-2xl font-bold mb-2">Ready to Showcase Your Talent?</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Stand out from other applicants with our AI-powered interview platform that fairly evaluates your skills and experience.
            </p>
            <Link to="/signup">
              <Button size="lg">
                Create Candidate Profile
              </Button>
            </Link>
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-16 mb-8">
        <h2 className="text-2xl font-bold mb-4 text-center">Common Questions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <Card>
            <CardHeader>
              <CardTitle>How does the AI interviewer work?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Our AI interviewer uses advanced natural language processing to ask relevant questions, analyze responses, and provide objective assessments of candidates' qualifications and fit for the role.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Is the platform bias-free?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We've designed our AI to minimize bias by focusing on skills and qualifications rather than demographic factors. Our system is regularly audited and improved to ensure fair assessments for all candidates.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>What technical requirements are needed?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Candidates need a device with a camera, microphone, and stable internet connection. Our platform works on modern browsers without requiring any additional software installation.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Can we customize interview questions?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Yes, employers can customize interview questions or choose from our library of role-specific question sets. The AI adapts to your requirements while maintaining assessment quality.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-12 mb-6 text-center">
        <Link to="/">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default HowItWorks;
