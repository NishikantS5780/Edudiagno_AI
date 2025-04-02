import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Upload, FileText, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface ResumeUploadProps {
  onUpload: (file: File) => void;
}

const ResumeUpload: React.FC<ResumeUploadProps> = ({ onUpload }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    
    if (!file) return;
    
    // Check file type
    const validTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a PDF or Word document");
      return;
    }
    
    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }
    
    onUpload(file);
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: false
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
        isDragActive
          ? "border-brand bg-brand/5"
          : "border-muted-foreground/25 hover:border-brand/50"
      }`}
    >
      <input {...getInputProps()} />
      
      <div className="flex flex-col items-center gap-4">
        <div className={`p-3 rounded-full ${
          isDragActive ? "bg-brand/10" : "bg-muted"
        }`}>
          <Upload className={`h-6 w-6 ${
            isDragActive ? "text-brand" : "text-muted-foreground"
          }`} />
        </div>
        
        <div className="space-y-1">
          <h3 className="font-medium">
            {isDragActive ? "Drop your resume here" : "Upload your resume"}
          </h3>
          <p className="text-sm text-muted-foreground">
            Drag and drop your resume, or click to browse
          </p>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileText className="h-4 w-4" />
          <span>PDF, DOCX, or DOC (Max 5MB)</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <AlertCircle className="h-4 w-4" />
          <span>Your resume helps us personalize the interview</span>
        </div>
      </div>
    </div>
  );
};

export default ResumeUpload;
