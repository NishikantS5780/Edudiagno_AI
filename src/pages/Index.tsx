
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle, 
  ArrowRight, 
  Globe, 
  Layers, 
  Clock, 
  BarChart, 
  Shield, 
  Users 
} from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Hero section */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-background to-background/80">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center space-y-8">
            <div className="bg-brand/10 text-brand px-3 py-1 rounded-full text-sm font-medium">
              Next-Generation Educational Assessment
            </div>
            
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Revolutionizing <span className="text-brand">Educational Diagnostics</span>
            </h1>
            
            <p className="max-w-[700px] text-lg text-muted-foreground">
              EduDiagno helps institutions deliver personalized, AI-powered assessments that accurately evaluate student knowledge and skills.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild>
                <Link to="/signup">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/features">
                  Learn More
                </Link>
              </Button>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-brand" />
              <span>No credit card required</span>
              <span className="mx-2">•</span>
              <CheckCircle className="h-4 w-4 text-brand" />
              <span>14-day free trial</span>
              <span className="mx-2">•</span>
              <CheckCircle className="h-4 w-4 text-brand" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Comprehensive Assessment Solutions
            </h2>
            <p className="max-w-[700px] text-muted-foreground">
              Our platform offers a wide range of tools to help educators better evaluate and understand student performance.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-background rounded-lg p-6 shadow-sm">
              <div className="bg-brand/10 p-3 rounded-full w-fit mb-4">
                <Globe className="h-6 w-6 text-brand" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Universal Accessibility</h3>
              <p className="text-muted-foreground">
                Assessments that work for all students, regardless of background or ability level.
              </p>
            </div>
            
            <div className="bg-background rounded-lg p-6 shadow-sm">
              <div className="bg-brand/10 p-3 rounded-full w-fit mb-4">
                <Layers className="h-6 w-6 text-brand" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Adaptive Testing</h3>
              <p className="text-muted-foreground">
                Intelligent assessments that adjust difficulty based on student responses.
              </p>
            </div>
            
            <div className="bg-background rounded-lg p-6 shadow-sm">
              <div className="bg-brand/10 p-3 rounded-full w-fit mb-4">
                <Clock className="h-6 w-6 text-brand" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Real-time Feedback</h3>
              <p className="text-muted-foreground">
                Immediate insights that help teachers adjust instruction and students improve performance.
              </p>
            </div>
            
            <div className="bg-background rounded-lg p-6 shadow-sm">
              <div className="bg-brand/10 p-3 rounded-full w-fit mb-4">
                <BarChart className="h-6 w-6 text-brand" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Comprehensive Analytics</h3>
              <p className="text-muted-foreground">
                Detailed reports that break down student performance across multiple dimensions.
              </p>
            </div>
            
            <div className="bg-background rounded-lg p-6 shadow-sm">
              <div className="bg-brand/10 p-3 rounded-full w-fit mb-4">
                <Shield className="h-6 w-6 text-brand" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure Testing</h3>
              <p className="text-muted-foreground">
                Advanced security features to ensure academic integrity in assessments.
              </p>
            </div>
            
            <div className="bg-background rounded-lg p-6 shadow-sm">
              <div className="bg-brand/10 p-3 rounded-full w-fit mb-4">
                <Users className="h-6 w-6 text-brand" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Collaborative Tools</h3>
              <p className="text-muted-foreground">
                Empower teaching teams with shared assessments and integrated grading workflows.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Call to action */}
      <section className="py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="bg-brand text-brand-foreground rounded-xl p-8 md:p-12">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <h2 className="text-3xl font-bold tracking-tight">
                Transform your educational assessment approach today
              </h2>
              <p className="text-brand-foreground/80">
                Join thousands of educators who have already improved their assessment outcomes with EduDiagno.
              </p>
              <Button size="lg" variant="secondary" asChild>
                <Link to="/signup">
                  Get Started for Free
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
