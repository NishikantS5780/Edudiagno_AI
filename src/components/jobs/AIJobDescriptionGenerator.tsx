
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Wand2, X, Copy, RotateCcw, Save, AlertCircle } from "lucide-react";
import LoadingSpinner from "@/components/common/LoadingSpinner";

interface AIJobDescriptionGeneratorProps {
  onGenerate: (description: string) => void;
  onClose: () => void;
  jobTitle?: string;
  department?: string;
  location?: string;
}

const AIJobDescriptionGenerator: React.FC<AIJobDescriptionGeneratorProps> = ({
  onGenerate,
  onClose,
  jobTitle = "",
  department = "",
  location = "",
}) => {
  const [keywords, setKeywords] = useState<string>("");
  const [prompt, setPrompt] = useState<string>("");
  const [generatedDescription, setGeneratedDescription] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [currentTab, setCurrentTab] = useState<string>("keywords");
  const [includeRequirements, setIncludeRequirements] = useState<boolean>(true);
  const [includeResponsibilities, setIncludeResponsibilities] = useState<boolean>(true);
  const [includeQualifications, setIncludeQualifications] = useState<boolean>(true);
  const [includeCompanyDesc, setIncludeCompanyDesc] = useState<boolean>(true);
  
  // Sample company descriptions for demo purposes
  const companyDescriptions = [
    "We are an innovative tech company revolutionizing the industry with cutting-edge solutions.",
    "Our organization is a leader in sustainable energy solutions, committed to a greener future.",
    "We're a fast-growing startup building the next generation of financial technology products.",
    "Our healthcare company is dedicated to improving patient outcomes through advanced technology.",
    "We are a global consulting firm helping businesses transform and succeed in the digital age."
  ];
  
  // Randomly select a company description
  const randomCompanyDesc = companyDescriptions[Math.floor(Math.random() * companyDescriptions.length)];
  
  const generateDescription = async () => {
    if (currentTab === "keywords" && !keywords.trim()) {
      toast.error("Please enter some keywords");
      return;
    }
    
    if (currentTab === "prompt" && !prompt.trim()) {
      toast.error("Please enter a detailed prompt");
      return;
    }
    
    setIsGenerating(true);
    
    try {
      // Build the prompt based on user inputs
      let aiPrompt = "";
      
      if (currentTab === "keywords") {
        aiPrompt = `Generate a professional job description for a ${jobTitle || "position"} 
          ${department ? `in the ${department} department` : ""} 
          ${location ? `located in ${location}` : ""}
          with the following keywords: ${keywords}.`;
      } else {
        aiPrompt = prompt;
      }
      
      // Add section preferences
      aiPrompt += "\nInclude the following sections:";
      if (includeRequirements) aiPrompt += "\n- Job requirements";
      if (includeResponsibilities) aiPrompt += "\n- Key responsibilities";
      if (includeQualifications) aiPrompt += "\n- Qualifications needed";
      if (includeCompanyDesc) aiPrompt += `\n- Company description (use this: ${randomCompanyDesc})`;
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate sample descriptions based on job title and keywords
      const sampleDescriptions: Record<string, string> = {
        "software engineer": `# Software Engineer

## About the Role
We are seeking a talented Software Engineer to join our team. In this role, you will be responsible for designing, implementing, and maintaining high-quality software solutions. You will work closely with cross-functional teams to deliver exceptional results.

## Key Responsibilities
- Design, develop, and maintain software applications using best practices
- Write clean, maintainable, and efficient code
- Collaborate with team members to implement new features and improve existing ones
- Troubleshoot and debug issues to optimize performance
- Participate in code reviews and contribute to team knowledge sharing
- Stay up-to-date with emerging trends and technologies

## Requirements
- Bachelor's degree in Computer Science, Engineering, or a related field
- 2+ years of experience in software development
- Proficiency in at least one modern programming language (e.g., Java, Python, JavaScript)
- Experience with web development frameworks and technologies
- Strong problem-solving skills and attention to detail
- Excellent communication and teamwork abilities

## Qualifications
- Experience with cloud platforms (AWS, Azure, GCP) is a plus
- Knowledge of DevOps practices and CI/CD pipelines
- Familiarity with Agile development methodologies
- Open source contributions or personal projects demonstrate passion for coding

## About Our Company
${includeCompanyDesc ? randomCompanyDesc : ""}

We offer competitive compensation, flexible work arrangements, and opportunities for professional growth. Join us to make an impact and build innovative solutions that matter.`,

        "marketing manager": `# Marketing Manager

## About the Role
We are looking for a creative and data-driven Marketing Manager to lead our marketing initiatives. In this role, you will develop, implement, and track marketing strategies to enhance our brand presence and drive customer engagement.

## Key Responsibilities
- Develop and execute comprehensive marketing strategies aligned with business goals
- Manage marketing campaigns across various channels (digital, social, email, etc.)
- Analyze market trends and competitor activities to identify opportunities
- Collaborate with product, sales, and creative teams to ensure consistent messaging
- Measure and report on the performance of marketing initiatives
- Manage marketing budget and optimize spend for maximum ROI

## Requirements
- Bachelor's degree in Marketing, Business, or a related field
- 3+ years of experience in marketing roles with progressive responsibility
- Proven track record of successful marketing campaigns
- Strong understanding of digital marketing channels and analytics
- Excellent project management and organizational skills
- Creative thinking with an analytical mindset

## Qualifications
- MBA or advanced degree is a plus
- Experience with marketing automation and CRM tools
- Knowledge of SEO/SEM, content marketing, and social media strategy
- Strong presentation and communication skills
- Ability to work in a fast-paced environment and manage multiple priorities

## About Our Company
${includeCompanyDesc ? randomCompanyDesc : ""}

We offer a collaborative work environment, competitive compensation package, and opportunities for career advancement. Join our team and help shape the future of our brand!`,

        "data scientist": `# Data Scientist

## About the Role
We are seeking an experienced Data Scientist to turn data into insights that drive business value. In this role, you will work with stakeholders across the organization to identify opportunities for leveraging company data to drive business solutions.

## Key Responsibilities
- Develop and implement advanced analytics models to extract insights from complex datasets
- Collaborate with cross-functional teams to identify business challenges that can be addressed through data science
- Create and maintain scalable data pipelines and workflows
- Communicate findings to technical and non-technical audiences effectively
- Stay current with the latest developments in data science, machine learning, and AI
- Mentor junior team members and promote best practices

## Requirements
- Master's or PhD in Computer Science, Statistics, Mathematics, or related field
- 3+ years of experience in data science or related quantitative role
- Proficiency in Python, R, or similar programming languages
- Experience with machine learning frameworks and libraries
- Strong statistics and mathematics foundation
- Excellent problem-solving and analytical thinking skills

## Qualifications
- Experience with big data technologies (Hadoop, Spark, etc.)
- Knowledge of cloud computing platforms and their machine learning offerings
- Familiarity with data visualization tools (Tableau, PowerBI, etc.)
- Published research or contributions to the data science community
- Domain expertise in our industry is a plus

## About Our Company
${includeCompanyDesc ? randomCompanyDesc : ""}

We provide a dynamic environment where innovation is encouraged, along with competitive compensation and benefits. Join our data-driven team and help us transform how we make decisions!`,

        "human resources": `# HR Manager

## About the Role
We are seeking an experienced HR Manager to oversee all aspects of our human resources operations. In this role, you will develop and implement HR strategies and initiatives aligned with our overall business strategy.

## Key Responsibilities
- Develop and implement HR policies, procedures, and programs
- Manage full-cycle recruitment process and talent acquisition
- Oversee employee relations, performance management, and benefits administration
- Design and implement employee development and retention initiatives
- Ensure compliance with labor laws and regulations
- Provide guidance and coaching to managers and employees on HR matters

## Requirements
- Bachelor's degree in Human Resources, Business Administration, or related field
- 5+ years of experience in HR roles with progressive responsibility
- In-depth knowledge of HR functions and best practices
- Strong understanding of labor laws and employment regulations
- Excellent interpersonal and conflict resolution skills
- Proven leadership abilities and strategic thinking

## Qualifications
- HR certification (SHRM-CP, SHRM-SCP, PHR, SPHR) is preferred
- Experience with HRIS and ATS platforms
- Knowledge of performance management and talent development
- Strong communication and presentation skills
- Ability to maintain confidentiality and handle sensitive information

## About Our Company
${includeCompanyDesc ? randomCompanyDesc : ""}

We offer a collaborative work environment, competitive compensation package, and opportunities for career advancement. Join our team and help shape our organization's culture and talent strategy!`,

      };
      
      // Get the appropriate description or generate a generic one
      let description = "";
      
      // Look for keyword matches in our sample descriptions
      for (const key in sampleDescriptions) {
        if (
          (jobTitle && jobTitle.toLowerCase().includes(key)) ||
          (keywords && keywords.toLowerCase().includes(key))
        ) {
          description = sampleDescriptions[key];
          break;
        }
      }
      
      // If no match, use a generic description
      if (!description) {
        description = `# ${jobTitle || "Job Position"}

## About the Role
We are seeking a talented professional to join our team. In this role, you will contribute to our mission and help drive our success.

## Key Responsibilities
- Contribute to team projects and initiatives
- Collaborate with cross-functional teams
- Implement best practices and standards
- Analyze data and provide insights
- Develop solutions to business challenges
- Stay current with industry trends and advancements

## Requirements
- Bachelor's degree in a relevant field
- Experience in a similar role
- Strong analytical and problem-solving skills
- Excellent communication abilities
- Attention to detail and organization
- Ability to work independently and as part of a team

## Qualifications
- Advanced degree or certification is a plus
- Experience with industry-specific tools and technologies
- Leadership or project management experience
- Industry knowledge and connections
- Demonstrated track record of success

## About Our Company
${includeCompanyDesc ? randomCompanyDesc : ""}

We offer a supportive work environment, competitive compensation, and opportunities for growth. Join our team and be part of our journey to success!`;
      }
      
      setGeneratedDescription(description);
    } catch (error) {
      console.error("Error generating description:", error);
      toast.error("Failed to generate description. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedDescription)
      .then(() => toast.success("Copied to clipboard"))
      .catch(() => toast.error("Failed to copy"));
  };
  
  const resetGenerator = () => {
    setKeywords("");
    setPrompt("");
    setGeneratedDescription("");
    setCurrentTab("keywords");
  };
  
  const applyDescription = () => {
    if (generatedDescription) {
      onGenerate(generatedDescription);
      toast.success("Description applied successfully");
      onClose();
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center">
            <Wand2 className="mr-2 h-5 w-5 text-brand" />
            AI Job Description Generator
          </CardTitle>
          <CardDescription>
            Create a professional job description with AI assistance
          </CardDescription>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </CardHeader>
      
      <Separator />
      
      <CardContent className="pt-6">
        {!generatedDescription ? (
          <>
            <div className="bg-muted/50 rounded-lg p-4 mb-6 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-muted-foreground">
                  Our AI can generate a professional job description based on your inputs.
                  Choose one of the methods below to generate your description.
                </p>
              </div>
            </div>
            
            <Tabs value={currentTab} onValueChange={setCurrentTab}>
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="keywords">Simple (Keywords)</TabsTrigger>
                <TabsTrigger value="prompt">Advanced (Custom Prompt)</TabsTrigger>
              </TabsList>
              
              <TabsContent value="keywords" className="space-y-4">
                <div>
                  <Label htmlFor="keywords">Enter Keywords</Label>
                  <Input
                    id="keywords"
                    placeholder="e.g., JavaScript, React, frontend, 3+ years experience"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Enter skills, experience level, and any specific requirements
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label>Job Details (Automatically Included)</Label>
                    <div className="mt-2 p-3 bg-muted/50 rounded-lg">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Title:</span>
                        <span className="font-medium">{jobTitle || "Not specified"}</span>
                      </div>
                      <div className="flex justify-between text-sm mt-1">
                        <span className="text-muted-foreground">Department:</span>
                        <span className="font-medium">{department || "Not specified"}</span>
                      </div>
                      <div className="flex justify-between text-sm mt-1">
                        <span className="text-muted-foreground">Location:</span>
                        <span className="font-medium">{location || "Not specified"}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label>Include Sections</Label>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="requirements" 
                          checked={includeRequirements}
                          onCheckedChange={(checked) => setIncludeRequirements(!!checked)}
                        />
                        <label
                          htmlFor="requirements"
                          className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Requirements
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="responsibilities" 
                          checked={includeResponsibilities}
                          onCheckedChange={(checked) => setIncludeResponsibilities(!!checked)}
                        />
                        <label
                          htmlFor="responsibilities"
                          className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Responsibilities
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="qualifications" 
                          checked={includeQualifications}
                          onCheckedChange={(checked) => setIncludeQualifications(!!checked)}
                        />
                        <label
                          htmlFor="qualifications"
                          className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Qualifications
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="companyDesc" 
                          checked={includeCompanyDesc}
                          onCheckedChange={(checked) => setIncludeCompanyDesc(!!checked)}
                        />
                        <label
                          htmlFor="companyDesc"
                          className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Company Description
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="prompt" className="space-y-4">
                <div>
                  <Label htmlFor="prompt">Custom Prompt</Label>
                  <Textarea
                    id="prompt"
                    placeholder="Create a detailed job description for a Senior Software Engineer with 5+ years of experience in React and Node.js. The role requires leading a team and architecting complex applications..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="min-h-[150px]"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Provide detailed instructions for the AI to create a customized job description
                  </p>
                </div>
                
                <div>
                  <Label>Include Sections</Label>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="prompt-requirements" 
                        checked={includeRequirements}
                        onCheckedChange={(checked) => setIncludeRequirements(!!checked)}
                      />
                      <label
                        htmlFor="prompt-requirements"
                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Requirements
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="prompt-responsibilities" 
                        checked={includeResponsibilities}
                        onCheckedChange={(checked) => setIncludeResponsibilities(!!checked)}
                      />
                      <label
                        htmlFor="prompt-responsibilities"
                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Responsibilities
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="prompt-qualifications" 
                        checked={includeQualifications}
                        onCheckedChange={(checked) => setIncludeQualifications(!!checked)}
                      />
                      <label
                        htmlFor="prompt-qualifications"
                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Qualifications
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="prompt-companyDesc" 
                        checked={includeCompanyDesc}
                        onCheckedChange={(checked) => setIncludeCompanyDesc(!!checked)}
                      />
                      <label
                        htmlFor="prompt-companyDesc"
                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Company Description
                      </label>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <div>
            <div className="mb-4 flex justify-between items-center">
              <h3 className="font-medium">Generated Description</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={copyToClipboard}>
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </Button>
                <Button variant="outline" size="sm" onClick={resetGenerator}>
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Regenerate
                </Button>
              </div>
            </div>
            <div className="border rounded-lg p-4 max-h-[400px] overflow-y-auto">
              <pre className="text-sm whitespace-pre-wrap font-sans">{generatedDescription}</pre>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        {!generatedDescription ? (
          <Button onClick={generateDescription} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Generate Description
              </>
            )}
          </Button>
        ) : (
          <Button onClick={applyDescription}>
            <Save className="mr-2 h-4 w-4" />
            Apply Description
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default AIJobDescriptionGenerator;
