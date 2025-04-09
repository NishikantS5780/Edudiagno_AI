import { Button } from "@/components/ui/button";
import LandingLayout from "@/components/layout/LandingLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

const CaseStudies = () => {
  const caseStudies = [
    {
      company: "TechGrowth Inc.",
      industry: "Software Development",
      challenge: "High volume of applications with 80% unqualified candidates",
      solution: "AI screening and automated video interviews",
      results: "Reduced hiring time by 65%, improved quality of hires by 40%",
      logo: "https://placehold.co/100x100?text=TG",
      category: "tech",
    },
    {
      company: "Global Healthcare Systems",
      industry: "Healthcare",
      challenge: "Specialized roles requiring technical and soft skills assessment",
      solution: "Customized AI interviews with role-specific questions",
      results: "Increased qualified candidate pool by 35%, reduced turnover by 28%",
      logo: "https://placehold.co/100x100?text=GHS",
      category: "healthcare",
    },
    {
      company: "RetailPlus",
      industry: "Retail",
      challenge: "Seasonal hiring spikes with thousands of applications",
      solution: "Mass AI screening and batch interview processing",
      results: "Processed 10,000+ applications in 2 weeks with 5-person HR team",
      logo: "https://placehold.co/100x100?text=RP",
      category: "retail",
    },
    {
      company: "FinanceForward",
      industry: "Financial Services",
      challenge: "Compliance requirements and strict skill verification",
      solution: "AI assessment with compliance-focused interview modules",
      results: "100% compliance adherence, 45% faster hiring for regulated positions",
      logo: "https://placehold.co/100x100?text=FF",
      category: "finance",
    },
    {
      company: "EduSphere",
      industry: "Education",
      challenge: "Distributed hiring across multiple campuses with inconsistent standards",
      solution: "Centralized AI interview platform with standardized assessment",
      results: "Standardized hiring quality across 15 locations, 52% cost reduction",
      logo: "https://placehold.co/100x100?text=ES",
      category: "education",
    },
    {
      company: "LogisticsPro",
      industry: "Logistics & Transportation",
      challenge: "High-volume driver recruitment with safety critical assessment",
      solution: "AI screening with safety protocol verification modules",
      results: "Accident rates reduced by 23%, hiring speed increased by 60%",
      logo: "https://placehold.co/100x100?text=LP",
      category: "logistics",
    },
  ];

  return (
    <LandingLayout>
      <div className="container py-12 md:py-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Success Stories</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            See how leading companies revolutionized their hiring process with our
            AI-powered platform
          </p>
        </div>

        <Tabs defaultValue="all" className="w-full mb-8">
          <div className="flex justify-center mb-8">
            <TabsList>
              <TabsTrigger value="all">All Industries</TabsTrigger>
              <TabsTrigger value="tech">Technology</TabsTrigger>
              <TabsTrigger value="healthcare">Healthcare</TabsTrigger>
              <TabsTrigger value="finance">Finance</TabsTrigger>
              <TabsTrigger value="retail">Retail</TabsTrigger>
              <TabsTrigger value="education">Education</TabsTrigger>
              <TabsTrigger value="logistics">Logistics</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="all" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {caseStudies.map((study, index) => (
              <CaseStudyCard key={index} caseStudy={study} />
            ))}
          </TabsContent>

          {["tech", "healthcare", "finance", "retail", "education", "logistics"].map((category) => (
            <TabsContent 
              key={category} 
              value={category} 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {caseStudies
                .filter((study) => study.category === category)
                .map((study, index) => (
                  <CaseStudyCard key={index} caseStudy={study} />
                ))}
            </TabsContent>
          ))}
        </Tabs>

        <div className="text-center mt-16">
          <h2 className="text-3xl font-bold mb-4">Ready to transform your hiring process?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join these successful companies and experience the benefits of AI-powered hiring
          </p>
          <Link to="/signup">
            <Button size="lg" className="mr-4">
              Start Free Trial
            </Button>
          </Link>
          <Link to="/contact">
            <Button variant="outline" size="lg">
              Schedule Demo
            </Button>
          </Link>
        </div>
      </div>
    </LandingLayout>
  );
};

interface CaseStudyProps {
  caseStudy: {
    company: string;
    industry: string;
    challenge: string;
    solution: string;
    results: string;
    logo: string;
    category: string;
  };
}

const CaseStudyCard = ({ caseStudy }: CaseStudyProps) => {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center gap-4">
        <img
          src={caseStudy.logo}
          alt={`${caseStudy.company} logo`}
          className="w-16 h-16 rounded-md object-contain bg-gray-100"
        />
        <div>
          <CardTitle>{caseStudy.company}</CardTitle>
          <CardDescription>{caseStudy.industry}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="mb-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Challenge</h3>
          <p>{caseStudy.challenge}</p>
        </div>
        <div className="mb-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Solution</h3>
          <p>{caseStudy.solution}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Results</h3>
          <p>{caseStudy.results}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CaseStudies;
