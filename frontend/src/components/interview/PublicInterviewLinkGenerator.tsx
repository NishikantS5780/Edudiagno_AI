import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Copy, Link2, Share2, Trash2, Pencil, MoreVertical } from "lucide-react";
import { publicInterviewApi } from "@/lib/api";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";

interface PublicInterviewLinkGeneratorProps {
  jobId: number;
  jobTitle: string;
}

// Interface for the generated links
interface PublicLink {
  id: string;
  url: string;
  name: string;
  active: boolean;
  createdAt: string;
  expiresAt?: string;
  visits: number;
  startedInterviews: number;
  completedInterviews: number;
  job_id: number;
}

const PublicInterviewLinkGenerator: React.FC<PublicInterviewLinkGeneratorProps> = ({ 
  jobId,
  jobTitle
}): JSX.Element => {
  const [linkName, setLinkName] = useState(`${jobTitle} - Public`);
  const [expiration, setExpiration] = useState<string>("30");
  const [isActive, setIsActive] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [links, setLinks] = useState<PublicLink[]>([]);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  // Load existing links on component mount
  useEffect(() => {
    loadLinks();
  }, [jobId]);
  
  // Load existing links
  const loadLinks = async () => {
    try {
      console.log('Loading links for jobId:', jobId);
      console.log('API endpoint:', `/interviews/public/${jobId}`);
      const response = await publicInterviewApi.getLinks(jobId);
      console.log('API Response:', response);
      
      // Transform the response data to match our interface
      const formattedLinks = response.data.map((link: any) => ({
        id: link.id.toString(),
        url: `${window.location.origin}/interview/${link.access_code}`,
        name: link.name,
        active: link.is_active,
        createdAt: link.created_at,
        expiresAt: link.expires_at,
        visits: link.visits,
        startedInterviews: link.started_interviews,
        completedInterviews: link.completed_interviews,
        job_id: link.job_id
      }));
      
      setLinks(formattedLinks);
    } catch (error) {
      console.error("Error loading links:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response,
        request: error.request,
        config: error.config
      });
      setError("Failed to load interview links");
      toast.error("Failed to load interview links");
    }
  };
  
  // Generate a new public interview link
  const generateLink = async () => {
    try {
    setIsGenerating(true);
      setError(null);
      
      console.log('Generating link for jobId:', jobId);
      console.log('Link data:', {
        name: linkName,
        expiration: expiration !== "never" ? parseInt(expiration) : undefined,
        is_active: isActive
      });
      
      const response = await publicInterviewApi.createLink(jobId, {
        name: linkName,
        expiration: expiration !== "never" ? parseInt(expiration) : undefined,
        is_active: isActive
      });
      
      console.log('Create link response:', response);
      
      // Format the new link
      const newLink = {
        id: response.data.id.toString(),
        url: `${window.location.origin}/interview/${response.data.access_code}`,
        name: response.data.name,
        active: response.data.is_active,
        createdAt: response.data.created_at,
        expiresAt: response.data.expires_at,
        visits: response.data.visits,
        startedInterviews: response.data.started_interviews,
        completedInterviews: response.data.completed_interviews,
        job_id: response.data.job_id
      };
      
      setLinks(prev => [newLink, ...prev]);
      setLinkName(`${jobTitle} - Public ${links.length + 1}`);
      toast.success("New public interview link created");
    } catch (error) {
      console.error("Error generating link:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response,
        request: error.request,
        config: error.config
      });
      setError("Failed to generate interview link");
      toast.error("Failed to generate interview link");
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Copy a link to clipboard
  const copyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard");
  };
  
  // Share a link using Web Share API if available, fallback to copying
  const shareLink = async (url: string, name: string) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: name,
          text: `Interview link for ${name}`,
          url: url
        });
      } else {
        // Fallback to copying if Web Share API is not available
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard");
      }
    } catch (error) {
      console.error("Error sharing link:", error);
      // Don't show error toast if user cancelled the share dialog
      if (error instanceof Error && error.name !== 'AbortError') {
        toast.error("Failed to share link");
      }
    }
  };
  
  // Delete a link
  const deleteLink = async (id: string) => {
    try {
      await publicInterviewApi.deleteLink(jobId, id);
    setLinks(prev => prev.filter(link => link.id !== id));
    toast.success("Link deleted successfully");
    } catch (error) {
      console.error("Error deleting link:", error);
      toast.error("Failed to delete interview link");
    }
  };
  
  // Toggle link active status
  const toggleActive = async (id: string) => {
    try {
      const link = links.find(l => l.id === id);
      if (!link) return;
      
      const newStatus = !link.active;
      await publicInterviewApi.toggleLinkStatus(jobId, id, newStatus);
      
      // Update local state
    setLinks(prev => 
        prev.map(l => 
          l.id === id ? { ...l, active: newStatus } : l
        )
      );
      
      toast.success(newStatus ? "Link activated" : "Link deactivated");
    } catch (error) {
      console.error("Error toggling link status:", error);
      toast.error("Failed to update link status");
    }
  };
  
  const handleEditJob = (jobId: number) => {
    // Navigate to the job edit page with the correct path
    navigate(`/dashboard/jobs/${jobId}/edit`, { replace: true });
  };
  
  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive mb-4">{error}</p>
        <button 
          onClick={loadLinks}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Try Again
        </button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Public Interview Link</CardTitle>
          <CardDescription>
            Create shareable links for mass candidate interviews. These links can be posted on job boards, 
            LinkedIn, or sent directly to multiple candidates.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="link-name">Link Name</Label>
            <Input 
              id="link-name"
              value={linkName}
              onChange={(e) => setLinkName(e.target.value)}
              placeholder="E.g., LinkedIn Campaign, June Hiring"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiration">Link Expiration</Label>
              <Select
                value={expiration}
                onValueChange={setExpiration}
              >
                <SelectTrigger id="expiration">
                  <SelectValue placeholder="Select expiration period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="14">14 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                  <SelectItem value="never">Never expires</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="active">Active Status</Label>
              <div className="flex items-center justify-between rounded-md border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <Label htmlFor="active">
                    Enable this link
                  </Label>
                  <span className="text-sm text-muted-foreground">
                    Inactive links will show an error message
                  </span>
                </div>
                <Switch
                  id="active"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter>
          <Button 
            onClick={generateLink} 
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? "Generating..." : "Generate Public Interview Link"}
          </Button>
        </CardFooter>
      </Card>
      
      {links.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              {links.map((link) => (
                <div 
                  key={link.id} 
                  className={`border rounded-lg p-4 ${
                    !link.active && 'bg-muted/50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="space-y-1">
                      <h3 className="font-medium">{link.name}</h3>
                      <p className="text-sm text-muted-foreground break-all">{link.url}</p>
                    </div>
                      <Switch
                        checked={link.active}
                        onCheckedChange={() => toggleActive(link.id)}
                        aria-label="Toggle link active status"
                      />
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                    <span>Created: {new Date(link.createdAt).toLocaleDateString()}</span>
                    {link.expiresAt && (
                      <span>Expires: {new Date(link.expiresAt).toLocaleDateString()}</span>
                    )}
                    <span className="font-medium">{link.visits} visits</span>
                    <span className="font-medium">{link.startedInterviews} started</span>
                    <span className="font-medium">{link.completedInterviews} completed</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8"
                      onClick={() => copyLink(link.url)}
                    >
                      <Copy className="h-3.5 w-3.5 mr-1.5" />
                      Copy
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8"
                      onClick={() => shareLink(link.url, link.name)}
                    >
                      <Share2 className="h-3.5 w-3.5 mr-1.5" />
                      Share
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 text-destructive hover:text-destructive"
                      onClick={() => deleteLink(link.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                      Delete Link
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PublicInterviewLinkGenerator;