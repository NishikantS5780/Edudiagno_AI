import DsaQuestion from "./DsaQuestion";
import CodeExecutionPanel from "./CodeExecutionPanel";

function DsaExecution() {
    const expectedOutput = "5";
    return (
        <div className="bg-[#18181b]">
            <div className="grid md:grid-cols-2 grid-cols-1 h-[100vh] gap-4 p-2">
                <div>
                    <h2 className="px-4 pt-2 text-[#3165ed] font-bold text-2xl"> EduDiagno DSA Lab</h2>
                    <div className="mt-2">
                    <DsaQuestion
                        title="EduDiagno - Question 1"
                        successRate="Success rate: 2.56%"
                        questionNumber="1."
                        questionTitle="Two Sum"
                        difficulty="Easy"
                        description={
                            <>
                                Given an array of integers <code>nums</code> and an integer <code>target</code>, return indices of the two numbers such that they add up to <code>target</code>.
                            </>
                        }
                        constraints="You may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order."
                        testCases={[
                            { input: "nums = [2,7,11,15], target = 9", expectedOutput: "5" },
                        ]}
                    />
                    </div>
                </div>
                <div>
                    <CodeExecutionPanel expectedOutput={expectedOutput}/>
                </div>
            </div>
        </div>
    );
}

export default DsaExecution;