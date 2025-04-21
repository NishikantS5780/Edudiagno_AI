import React from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import CodeExecutionPanel from './CodeExecutionPanel'

const DSAPlayground = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const companyName = searchParams.get('company') || 'Company'

  const handleFinish = () => {
    navigate(`/interview/precheck?i_id=${searchParams.get('i_id')}`)
  }

  return (
    <div className="min-h-screen bg-[#18181b] text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">{companyName} - DSA Assessment</h1>
          <Button
            onClick={handleFinish}
            className={cn(
              "px-4 py-2 rounded-lg transition-colors shadow-lg",
              "bg-blue-500 hover:bg-blue-600 text-white hover:shadow-blue-500/20"
            )}
          >
            Finish and Continue to Interview
          </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-[#27272a] rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Welcome to the DSA Assessment</h2>
            <p className="text-gray-300 mb-4">
              This is a practice environment where you can solve the given problem.
              Take your time to understand the problem and write your solution.
            </p>
            <p className="text-gray-300">
              Once you're ready, click the "Finish and Continue to Interview" button to proceed.
            </p>
          </div>
          
          <div className="bg-[#27272a] rounded-lg overflow-hidden">
            <CodeExecutionPanel expectedOutput="5" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default DSAPlayground 