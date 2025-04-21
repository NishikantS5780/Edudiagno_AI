import React from 'react'
import { useSearchParams } from 'react-router-dom'
import DsaQuestion from '../DsaLab/DsaQuestion'
import CodeExecutionPanel from '../DsaLab/CodeExecutionPanel'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ArrowRight, Code, Clock, CheckCircle, Terminal } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const DSAPlayground = () => {
  const [searchParams] = useSearchParams()
  const companyName = searchParams.get('company') || 'Company'
  const [activeTab, setActiveTab] = React.useState("welcome")
  const [compilationStatus, setCompilationStatus] = React.useState<string>("")
  const [successRate, setSuccessRate] = React.useState<string>("")

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="bg-muted/20 w-full justify-start border-b shrink-0">
            <TabsTrigger 
              value="welcome"
              className="data-[state=active]:bg-background data-[state=active]:text-foreground rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4 py-2"
            >
              Welcome
            </TabsTrigger>
            <TabsTrigger 
              value="playground"
              className="data-[state=active]:bg-background data-[state=active]:text-foreground rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4 py-2"
            >
              DSA Playground
            </TabsTrigger>
          </TabsList>

          <TabsContent value="welcome" className="flex-1 overflow-auto p-4">
            <div className="max-w-3xl mx-auto h-full flex flex-col">
              <div className="text-center mb-4">
                <h1 className="text-3xl font-bold mb-2">Welcome to {companyName}'s DSA Assessment</h1>
                <p className="text-muted-foreground">Let's test your problem-solving skills</p>
              </div>
              
              <div className="flex-1 space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>What to Expect</CardTitle>
                    <CardDescription>Here's what you'll be doing in this assessment</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Code className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">Problem Solving</h3>
                          <p className="text-muted-foreground text-sm">You'll be given a coding problem to solve. Take your time to understand the requirements and constraints.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Clock className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">Time Management</h3>
                          <p className="text-muted-foreground text-sm">There's no strict time limit, but we recommend spending about 15-20 minutes on this assessment.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">Evaluation Criteria</h3>
                          <p className="text-muted-foreground text-sm">Your solution will be evaluated on correctness, efficiency, and code quality.</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>Getting Started</CardTitle>
                    <CardDescription>Follow these steps to complete your assessment</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ol className="list-decimal list-inside space-y-2 text-muted-foreground text-sm">
                      <li>Read the problem statement carefully</li>
                      <li>Understand the test cases and constraints</li>
                      <li>Write your solution in the code editor</li>
                      <li>Test your solution using the provided test cases</li>
                      <li>Submit when you're confident in your solution</li>
                    </ol>
                  </CardContent>
                </Card>

                <div className="flex justify-end pt-2">
                  <Button
                    onClick={() => setActiveTab("playground")}
                    size="lg"
                  >
                    Start Assessment
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="playground" className="flex-1 overflow-hidden p-4">
            <div className="grid md:grid-cols-2 grid-cols-1 gap-4 h-full">
              <Card className="h-full flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Terminal className="h-5 w-5 text-primary" />
                    <CardTitle>{companyName} DSA Assessment</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-auto">
                  <DsaQuestion
                    title={`${companyName} - Question 1`}
                    successRate={successRate}
                    questionNumber="1."
                    questionTitle="Two Sum"
                    difficulty="Easy"
                    description={
                      <>
                        Given an array of integers <code>nums</code> and an integer <code>target</code>, return indices of the two numbers such that they add up to <code>target</code>.
                      </>
                    }
                    testCases={[
                      { input: "nums = [2,7,11,15], target = 9", expectedOutput: "[0,1]" },
                      { input: "nums = [3,2,4], target = 6", expectedOutput: "[1,2]" },
                      { input: "nums = [3,3], target = 6", expectedOutput: "[0,1]" }
                    ]}
                    constraints="You may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order."
                    compilationStatus={compilationStatus}
                  />
                </CardContent>
              </Card>
              <Card className="h-full">
                <CardContent className="p-0 h-full">
                  <CodeExecutionPanel 
                    expectedOutput="[0,1]"
                    onCompilationStatusChange={setCompilationStatus}
                    onSuccessRateChange={setSuccessRate}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default DSAPlayground