
import React, { useState } from "react";
import { Link } from "react-router-dom";
import LandingLayout from "@/components/layout/LandingLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Check, HelpCircle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";

const Pricing = () => {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  const toggleBillingCycle = () => {
    setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly");
  };

  // Pricing plans data
  const plans = [
    {
      name: "Starter",
      description: "Perfect for small businesses starting with AI hiring",
      monthlyPrice: 49,
      yearlyPrice: 39,
      features: [
        "5 active job postings",
        "50 AI interviews per month",
        "Basic resume screening",
        "Standard interview analytics",
        "Email support",
      ],
      limitations: [
        "No custom branding",
        "No team collaboration tools",
        "Basic analytics only",
      ],
      cta: "Start Free Trial",
      highlight: false,
    },
    {
      name: "Professional",
      description: "Ideal for growing companies with regular hiring needs",
      monthlyPrice: 99,
      yearlyPrice: 79,
      features: [
        "15 active job postings",
        "200 AI interviews per month",
        "Advanced resume screening",
        "Detailed interview analytics",
        "Custom branding options",
        "Team collaboration tools",
        "Priority email support",
        "Interview scheduling",
      ],
      limitations: [],
      cta: "Start Free Trial",
      highlight: true,
      badge: "Most Popular",
    },
    {
      name: "Enterprise",
      description: "For large organizations with extensive hiring requirements",
      monthlyPrice: 249,
      yearlyPrice: 199,
      features: [
        "Unlimited job postings",
        "Unlimited AI interviews",
        "Elite resume screening",
        "Advanced analytics & reporting",
        "Full custom branding",
        "Enhanced team collaboration",
        "Dedicated account manager",
        "API access",
        "Custom AI training",
        "SSO integration",
      ],
      limitations: [],
      cta: "Contact Sales",
      highlight: false,
    },
  ];

  // Calculate yearly discount percentage
  const calculateSavings = (monthly: number, yearly: number) => {
    const monthlyYearlyCost = monthly * 12;
    const yearlyCost = yearly * 12;
    const savings = monthlyYearlyCost - yearlyCost;
    const savingsPercentage = Math.round((savings / monthlyYearlyCost) * 100);
    return savingsPercentage;
  };

  // FAQ data
  const faqs = [
    {
      question: "Is there a free trial available?",
      answer: "Yes, we offer a 14-day free trial on our Starter and Professional plans. No credit card required until you decide to continue."
    },
    {
      question: "Can I upgrade or downgrade my plan later?",
      answer: "Absolutely! You can upgrade your plan at any time, and the new features will be immediately available. Downgrades will take effect at the start of your next billing cycle."
    },
    {
      question: "How are AI interviews counted?",
      answer: "Each completed AI interview with a candidate counts as one interview. Incomplete interviews or those abandoned by candidates don't count against your quota."
    },
    {
      question: "Do unused interviews roll over to the next month?",
      answer: "No, interview quotas reset at the beginning of each billing cycle. However, Enterprise customers can discuss custom rollover arrangements with their account manager."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, PayPal, and direct bank transfers for Enterprise customers. All payments are processed securely through our payment providers."
    },
    {
      question: "Is there a setup fee?",
      answer: "No, there are no setup fees for any of our plans. You only pay the advertised price for your subscription."
    },
  ];

  return (
    <LandingLayout>
      {/* Hero section */}
      <section className="py-20 lg:py-28 px-4">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gradient">Simple, Transparent Pricing</h1>
            <p className="text-muted-foreground text-lg mb-8">
              Choose the plan that's right for your business, and start hiring smarter with AI
            </p>
            
            {/* Billing toggle */}
            <div className="flex items-center justify-center mb-12 gap-3">
              <span className={`text-sm ${billingCycle === "monthly" ? "font-medium" : "text-muted-foreground"}`}>
                Monthly
              </span>
              <div className="flex items-center">
                <Switch
                  checked={billingCycle === "yearly"}
                  onCheckedChange={toggleBillingCycle}
                  id="billing-toggle"
                />
              </div>
              <span className={`text-sm flex items-center gap-1.5 ${billingCycle === "yearly" ? "font-medium" : "text-muted-foreground"}`}>
                Yearly
                <Badge variant="outline" className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-500/20">
                  Save 20%
                </Badge>
              </span>
            </div>
            
            {/* Pricing cards */}
            <div className="grid md:grid-cols-3 gap-8">
              {plans.map((plan) => {
                // Calculate price based on billing cycle
                const price = billingCycle === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
                const savingsPercentage = calculateSavings(plan.monthlyPrice, plan.yearlyPrice);
                
                return (
                  <Card 
                    key={plan.name} 
                    className={`h-full flex flex-col ${
                      plan.highlight 
                        ? "shadow-lg border-brand/50 relative" 
                        : ""
                    }`}
                  >
                    {plan.highlight && plan.badge && (
                      <div className="absolute -top-3 left-0 right-0 flex justify-center">
                        <Badge className="bg-brand text-white hover:bg-brand/90">
                          {plan.badge}
                        </Badge>
                      </div>
                    )}
                    
                    <CardHeader>
                      <CardTitle>{plan.name}</CardTitle>
                      <CardDescription className="h-12">{plan.description}</CardDescription>
                    </CardHeader>
                    
                    <CardContent className="flex-1">
                      <div className="mb-6">
                        <div className="flex items-baseline">
                          <span className="text-3xl font-bold">${price}</span>
                          <span className="text-muted-foreground text-sm ml-1">
                            /mo {billingCycle === "yearly" && "billed annually"}
                          </span>
                        </div>
                        {billingCycle === "yearly" && (
                          <p className="text-green-600 text-sm mt-1">
                            Save {savingsPercentage}% with annual billing
                          </p>
                        )}
                      </div>
                      
                      <div className="space-y-4">
                        <h4 className="font-medium text-sm">What's included:</h4>
                        <ul className="space-y-2 mb-6">
                          {plan.features.map((feature, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <Check className="h-4 w-4 text-brand mt-0.5 flex-shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                        
                        {plan.limitations.length > 0 && (
                          <>
                            <h4 className="font-medium text-sm">Limitations:</h4>
                            <ul className="space-y-2">
                              {plan.limitations.map((limitation, index) => (
                                <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                                  <span className="h-4 w-4 flex items-center justify-center flex-shrink-0">
                                    •
                                  </span>
                                  <span>{limitation}</span>
                                </li>
                              ))}
                            </ul>
                          </>
                        )}
                      </div>
                    </CardContent>
                    
                    <CardFooter>
                      <Link to={plan.name === "Enterprise" ? "/contact" : "/signup"} className="w-full">
                        <Button 
                          className={`w-full ${plan.highlight ? "bg-brand hover:bg-brand/90" : ""}`}
                        >
                          {plan.cta}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>
      
      {/* Features comparison section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">Compare Plans</h2>
            <p className="text-muted-foreground">
              Detailed feature comparison to help you choose the right plan
            </p>
          </div>
          
          {/* Feature comparison table */}
          <div className="overflow-x-auto">
            <div className="min-w-[800px] max-w-6xl mx-auto">
              <Tabs defaultValue="hiring-features" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-8">
                  <TabsTrigger value="hiring-features">Hiring Features</TabsTrigger>
                  <TabsTrigger value="analytics">Analytics & Reporting</TabsTrigger>
                  <TabsTrigger value="team-support">Team & Support</TabsTrigger>
                </TabsList>
                
                {/* Hiring Features Tab */}
                <TabsContent value="hiring-features">
                  <div className="grid grid-cols-4 gap-4">
                    <div className="col-span-1 font-medium">Feature</div>
                    <div className="col-span-1 text-center">Starter</div>
                    <div className="col-span-1 text-center">Professional</div>
                    <div className="col-span-1 text-center">Enterprise</div>
                    
                    <div className="col-span-4">
                      <Separator className="my-2" />
                    </div>
                    
                    <div className="col-span-1 flex items-center">
                      <span>Active job postings</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-5 w-5 ml-1">
                              <HelpCircle className="h-3 w-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs text-sm">
                              Number of job listings you can have active simultaneously
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="col-span-1 text-center">5</div>
                    <div className="col-span-1 text-center">15</div>
                    <div className="col-span-1 text-center">Unlimited</div>
                    
                    <div className="col-span-4">
                      <Separator className="my-2" />
                    </div>
                    
                    <div className="col-span-1 flex items-center">
                      <span>AI interviews per month</span>
                    </div>
                    <div className="col-span-1 text-center">50</div>
                    <div className="col-span-1 text-center">200</div>
                    <div className="col-span-1 text-center">Unlimited</div>
                    
                    <div className="col-span-4">
                      <Separator className="my-2" />
                    </div>
                    
                    <div className="col-span-1 flex items-center">
                      <span>Resume screening</span>
                    </div>
                    <div className="col-span-1 text-center">Basic</div>
                    <div className="col-span-1 text-center">Advanced</div>
                    <div className="col-span-1 text-center">Elite</div>
                    
                    <div className="col-span-4">
                      <Separator className="my-2" />
                    </div>
                    
                    <div className="col-span-1 flex items-center">
                      <span>Custom interview questions</span>
                    </div>
                    <div className="col-span-1 text-center">
                      <Check className="h-5 w-5 text-brand mx-auto" />
                    </div>
                    <div className="col-span-1 text-center">
                      <Check className="h-5 w-5 text-brand mx-auto" />
                    </div>
                    <div className="col-span-1 text-center">
                      <Check className="h-5 w-5 text-brand mx-auto" />
                    </div>
                    
                    <div className="col-span-4">
                      <Separator className="my-2" />
                    </div>
                    
                    <div className="col-span-1 flex items-center">
                      <span>Interview scheduling</span>
                    </div>
                    <div className="col-span-1 text-center">
                      —
                    </div>
                    <div className="col-span-1 text-center">
                      <Check className="h-5 w-5 text-brand mx-auto" />
                    </div>
                    <div className="col-span-1 text-center">
                      <Check className="h-5 w-5 text-brand mx-auto" />
                    </div>
                    
                    <div className="col-span-4">
                      <Separator className="my-2" />
                    </div>
                    
                    <div className="col-span-1 flex items-center">
                      <span>Custom branding on interviews</span>
                    </div>
                    <div className="col-span-1 text-center">
                      —
                    </div>
                    <div className="col-span-1 text-center">
                      Basic
                    </div>
                    <div className="col-span-1 text-center">
                      Full
                    </div>
                    
                    <div className="col-span-4">
                      <Separator className="my-2" />
                    </div>
                    
                    <div className="col-span-1 flex items-center">
                      <span>AI job description generator</span>
                    </div>
                    <div className="col-span-1 text-center">
                      Limited
                    </div>
                    <div className="col-span-1 text-center">
                      <Check className="h-5 w-5 text-brand mx-auto" />
                    </div>
                    <div className="col-span-1 text-center">
                      <Check className="h-5 w-5 text-brand mx-auto" />
                    </div>
                  </div>
                </TabsContent>
                
                {/* Analytics Tab */}
                <TabsContent value="analytics">
                  <div className="grid grid-cols-4 gap-4">
                    <div className="col-span-1 font-medium">Feature</div>
                    <div className="col-span-1 text-center">Starter</div>
                    <div className="col-span-1 text-center">Professional</div>
                    <div className="col-span-1 text-center">Enterprise</div>
                    
                    <div className="col-span-4">
                      <Separator className="my-2" />
                    </div>
                    
                    <div className="col-span-1 flex items-center">
                      <span>Interview analytics</span>
                    </div>
                    <div className="col-span-1 text-center">Basic</div>
                    <div className="col-span-1 text-center">Advanced</div>
                    <div className="col-span-1 text-center">Premium</div>
                    
                    <div className="col-span-4">
                      <Separator className="my-2" />
                    </div>
                    
                    <div className="col-span-1 flex items-center">
                      <span>Candidate scoring</span>
                    </div>
                    <div className="col-span-1 text-center">
                      <Check className="h-5 w-5 text-brand mx-auto" />
                    </div>
                    <div className="col-span-1 text-center">
                      <Check className="h-5 w-5 text-brand mx-auto" />
                    </div>
                    <div className="col-span-1 text-center">
                      <Check className="h-5 w-5 text-brand mx-auto" />
                    </div>
                    
                    <div className="col-span-4">
                      <Separator className="my-2" />
                    </div>
                    
                    <div className="col-span-1 flex items-center">
                      <span>Hiring insights dashboard</span>
                    </div>
                    <div className="col-span-1 text-center">
                      Basic
                    </div>
                    <div className="col-span-1 text-center">
                      <Check className="h-5 w-5 text-brand mx-auto" />
                    </div>
                    <div className="col-span-1 text-center">
                      <Check className="h-5 w-5 text-brand mx-auto" />
                    </div>
                    
                    <div className="col-span-4">
                      <Separator className="my-2" />
                    </div>
                    
                    <div className="col-span-1 flex items-center">
                      <span>Custom reports</span>
                    </div>
                    <div className="col-span-1 text-center">
                      —
                    </div>
                    <div className="col-span-1 text-center">
                      Limited
                    </div>
                    <div className="col-span-1 text-center">
                      <Check className="h-5 w-5 text-brand mx-auto" />
                    </div>
                    
                    <div className="col-span-4">
                      <Separator className="my-2" />
                    </div>
                    
                    <div className="col-span-1 flex items-center">
                      <span>Export options</span>
                    </div>
                    <div className="col-span-1 text-center">
                      PDF
                    </div>
                    <div className="col-span-1 text-center">
                      PDF, CSV
                    </div>
                    <div className="col-span-1 text-center">
                      PDF, CSV, API
                    </div>
                    
                    <div className="col-span-4">
                      <Separator className="my-2" />
                    </div>
                    
                    <div className="col-span-1 flex items-center">
                      <span>Data retention</span>
                    </div>
                    <div className="col-span-1 text-center">
                      3 months
                    </div>
                    <div className="col-span-1 text-center">
                      12 months
                    </div>
                    <div className="col-span-1 text-center">
                      Unlimited
                    </div>
                  </div>
                </TabsContent>
                
                {/* Team & Support Tab */}
                <TabsContent value="team-support">
                  <div className="grid grid-cols-4 gap-4">
                    <div className="col-span-1 font-medium">Feature</div>
                    <div className="col-span-1 text-center">Starter</div>
                    <div className="col-span-1 text-center">Professional</div>
                    <div className="col-span-1 text-center">Enterprise</div>
                    
                    <div className="col-span-4">
                      <Separator className="my-2" />
                    </div>
                    
                    <div className="col-span-1 flex items-center">
                      <span>Team members</span>
                    </div>
                    <div className="col-span-1 text-center">2</div>
                    <div className="col-span-1 text-center">10</div>
                    <div className="col-span-1 text-center">Unlimited</div>
                    
                    <div className="col-span-4">
                      <Separator className="my-2" />
                    </div>
                    
                    <div className="col-span-1 flex items-center">
                      <span>Team collaboration tools</span>
                    </div>
                    <div className="col-span-1 text-center">
                      —
                    </div>
                    <div className="col-span-1 text-center">
                      <Check className="h-5 w-5 text-brand mx-auto" />
                    </div>
                    <div className="col-span-1 text-center">
                      <Check className="h-5 w-5 text-brand mx-auto" />
                    </div>
                    
                    <div className="col-span-4">
                      <Separator className="my-2" />
                    </div>
                    
                    <div className="col-span-1 flex items-center">
                      <span>Support</span>
                    </div>
                    <div className="col-span-1 text-center">
                      Email
                    </div>
                    <div className="col-span-1 text-center">
                      Priority email
                    </div>
                    <div className="col-span-1 text-center">
                      Dedicated manager
                    </div>
                    
                    <div className="col-span-4">
                      <Separator className="my-2" />
                    </div>
                    
                    <div className="col-span-1 flex items-center">
                      <span>Support response time</span>
                    </div>
                    <div className="col-span-1 text-center">
                      48 hours
                    </div>
                    <div className="col-span-1 text-center">
                      24 hours
                    </div>
                    <div className="col-span-1 text-center">
                      4 hours
                    </div>
                    
                    <div className="col-span-4">
                      <Separator className="my-2" />
                    </div>
                    
                    <div className="col-span-1 flex items-center">
                      <span>Onboarding</span>
                    </div>
                    <div className="col-span-1 text-center">
                      Self-serve
                    </div>
                    <div className="col-span-1 text-center">
                      Group session
                    </div>
                    <div className="col-span-1 text-center">
                      Dedicated setup
                    </div>
                    
                    <div className="col-span-4">
                      <Separator className="my-2" />
                    </div>
                    
                    <div className="col-span-1 flex items-center">
                      <span>API access</span>
                    </div>
                    <div className="col-span-1 text-center">
                      —
                    </div>
                    <div className="col-span-1 text-center">
                      —
                    </div>
                    <div className="col-span-1 text-center">
                      <Check className="h-5 w-5 text-brand mx-auto" />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </section>
      
      {/* FAQs section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-muted-foreground">
              Got questions? We've got answers.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {faqs.map((faq, index) => (
              <div key={index} className="space-y-2">
                <h3 className="text-lg font-semibold">{faq.question}</h3>
                <p className="text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-16">
            <p className="mb-4 text-muted-foreground">
              Need more information?
            </p>
            <Link to="/contact">
              <Button variant="outline" size="lg">
                Contact our sales team
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* CTA section */}
      <section className="py-20 bg-brand/5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Start Your 14-Day Free Trial</h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
              No credit card required. Experience the full power of our AI hiring platform risk-free.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/signup">
                <Button size="lg" className="w-full sm:w-auto">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/demo">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Request Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </LandingLayout>
  );
};

export default Pricing;
