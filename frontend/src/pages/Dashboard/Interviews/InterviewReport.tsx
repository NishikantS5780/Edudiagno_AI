import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const InterviewReport = () => {
  const reportRef = useRef<HTMLDivElement>(null);
  const { id } = useParams<{ id: string }>();
  const [reportData, setReportData] = useState<any>(null);

  useEffect(() => {
    const fetchReportData = async () => {
      const token = localStorage.getItem("token");
      if (!token || !id) return;

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/interview/recruiter-view?interview_id=${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setReportData(data);
        } else {
          console.error("Failed to fetch report data");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchReportData();
  }, [id]);

  useEffect(() => {
    if (reportData) {
      const generatePDF = async () => {
        const canvas = await html2canvas(reportRef.current!, {
          scale: 2,
          useCORS: true,
        });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
  
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgProps = pdf.getImageProperties(imgData);
  
        const margin = 10; // 10mm on each side
        const contentWidth = pdfWidth - 2 * margin;
        const contentHeight = (imgProps.height * contentWidth) / imgProps.width;
  
        const x = margin;
        const y = (pdfHeight - contentHeight) / 2; // vertically center the content
  
        pdf.addImage(imgData, "PNG", x, y, contentWidth, contentHeight);
        pdf.save("interview_report.pdf");
      };
  
      generatePDF();
    }
  }, [reportData]);
  

  if (!reportData)
    return <p className="text-center mt-10 text-gray-700">Loading report...</p>;

  return (
    <div className="flex justify-center mt-10">
      <div
        ref={reportRef}
        className="w-[794px] min-h-[1123px] p-10 bg-white rounded-xl shadow-lg text-gray-900 space-y-4"
      >
        <h1 className="text-3xl font-bold text-blue-700 mb-6">Interview Report</h1>

        {reportData.first_name && (
          <p><strong>Candidate:</strong> {reportData.first_name} {reportData.last_name}</p>
        )}
        {reportData.email && <p><strong>Email:</strong> {reportData.email}</p>}
        {reportData.phone && <p><strong>Phone:</strong> {reportData.phone}</p>}
        {reportData.location && <p><strong>Location:</strong> {reportData.location}</p>}
        {reportData.linkedin_url && (
          <p><strong>LinkedIn:</strong> <a href={reportData.linkedin_url} className="text-blue-500 underline" target="_blank">{reportData.linkedin_url}</a></p>
        )}
        {reportData.portfolio_url && (
          <p><strong>Portfolio:</strong> <a href={reportData.portfolio_url} className="text-blue-500 underline" target="_blank">{reportData.portfolio_url}</a></p>
        )}

        {(reportData.resume_match_score !== null && reportData.resume_match_score !== undefined) ||
        reportData.resume_match_feedback ? (
          <div className="mt-6">
            <h2 className="text-xl font-semibold text-gray-800">Resume Details</h2>
            {reportData.resume_match_score !== null && reportData.resume_match_score !== undefined && (
              <p><strong>Match Score:</strong> {reportData.resume_match_score}</p>
            )}
            {reportData.resume_match_feedback && (
              <p><strong>Match Feedback:</strong> {reportData.resume_match_feedback}</p>
            )}
          </div>
        ) : null}

        {(reportData.overall_score !== null && reportData.overall_score !== undefined) ||
        (reportData.technical_skills_score !== null && reportData.technical_skills_score !== undefined) ||
        (reportData.communication_skills_score !== null && reportData.communication_skills_score !== undefined) ||
        (reportData.problem_solving_skills_score !== null && reportData.problem_solving_skills_score !== undefined) ||
        (reportData.cultural_fit_score !== null && reportData.cultural_fit_score !== undefined) ? (
          <div className="mt-6">
            <h2 className="text-xl font-semibold text-gray-800">Interview Scores</h2>
            {reportData.overall_score !== null && reportData.overall_score !== undefined && (
              <p><strong>Overall:</strong> {reportData.overall_score}</p>
            )}
            {reportData.technical_skills_score !== null && reportData.technical_skills_score !== undefined && (
              <p><strong>Technical:</strong> {reportData.technical_skills_score}</p>
            )}
            {reportData.communication_skills_score !== null && reportData.communication_skills_score !== undefined && (
              <p><strong>Communication:</strong> {reportData.communication_skills_score}</p>
            )}
            {reportData.problem_solving_skills_score !== null && reportData.problem_solving_skills_score !== undefined && (
              <p><strong>Problem Solving:</strong> {reportData.problem_solving_skills_score}</p>
            )}
            {reportData.cultural_fit_score !== null && reportData.cultural_fit_score !== undefined && (
              <p><strong>Cultural Fit:</strong> {reportData.cultural_fit_score}</p>
            )}
          </div>
        ) : null}

        {reportData.feedback && (
          <div className="mt-6 min-h-[100px]">
            <h2 className="text-xl font-semibold text-gray-800">Feedback</h2>
            <p>{reportData.feedback}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewReport;
