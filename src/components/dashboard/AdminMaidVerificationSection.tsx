import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, HttpMethod, API_BASE_URL } from '@/services/api';
import { 
  Shield, 
  Search, 
  Filter, 
  Eye, 
  Download, 
  Check, 
  X, 
  Clock, 
  User, 
  CheckCircle, 
  XCircle, 
  ChevronLeft, 
  ChevronRight,
  AlertTriangle,
  FileText,
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  Loader2,
  RefreshCw
} from 'lucide-react';

interface MaidVerification {
  id: string;
  maidId: string;
  maidName: string;
  maidEmail: string;
  maidPhone: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  notes?: string;
  documents: {
    aadharCard: {
      id: string;
      url: string;
      uploaded: boolean;
      status: 'PENDING' | 'APPROVED' | 'REJECTED';
      filename?: string;
    };
    policeVerification: {
      id: string;
      url: string;
      uploaded: boolean;
      status: 'PENDING' | 'APPROVED' | 'REJECTED';
      filename?: string;
    };
    photo: {
      id: string;
      url: string;
      uploaded: boolean;
      status: 'PENDING' | 'APPROVED' | 'REJECTED';
      filename?: string;
    };
  };
  personalInfo: {
    fullName: string;
    address: string;
    experience: string;
    skills: string[];
  };
  assignedServices?: string[];
}

interface AdminMaidVerificationSectionProps {
  verifications: MaidVerification[];
  onApproveVerification: (verificationId: string, notes?: string, services?: string[]) => void;
  onRejectVerification: (verificationId: string, reason: string, notes?: string) => void;
}

// Backend API Interface
interface BackendMaidData {
  id: string;
  maidId: string;
  maid: {
    id: string;
    name: string;
    email: string;
    phone: string;
    joinedDate: string;
    totalServices: number;
    rating: number;
    address?: string; // Optional address field
  };
  documents: {
    aadharCard?: {
      id: string;
      filename: string;
      uploadedAt: string;
      fileSize: number;
      status: 'PENDING' | 'APPROVED' | 'REJECTED';
    } | null;
    policeVerification?: {
      id: string;
      filename: string;
      uploadedAt: string;
      fileSize: number;
      status: 'PENDING' | 'APPROVED' | 'REJECTED';
    } | null;
    photo?: {
      id: string;
      filename: string;
      uploadedAt: string;
      fileSize: number;
      status: 'PENDING' | 'APPROVED' | 'REJECTED';
    } | null;
  };
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'NOT_SUBMITTED';
  submittedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  adminNotes?: string;
  documentCounts: {
    uploaded: number;
    total: number;
    verified: number;
    pending: number;
    rejected: number;
  };
}

export const AdminMaidVerificationSection: React.FC = () => {
  const { toast } = useToast();
  
  // State management
  const [verifications, setVerifications] = useState<MaidVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // UI State
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedVerification, setSelectedVerification] = useState<MaidVerification | null>(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectionNotes, setRejectionNotes] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<{url: string, title: string} | null>(null);
  const [showImagePreview, setShowImagePreview] = useState(false);
  
  // Track processed verifications to prevent them from reappearing after refresh
  const [processedVerificationIds, setProcessedVerificationIds] = useState<Set<string>>(new Set());
  
  // Individual document approval state
  const [documentActionLoading, setDocumentActionLoading] = useState<string | null>(null);

  const itemsPerPage = 10;

  // Backend API functions - no longer needed with apiRequest

  // Transform backend data to frontend format
  const transformBackendData = (backendData: BackendMaidData): MaidVerification => {
    const getOverallStatus = (status: string, documents: any) => {
      if (status === 'APPROVED') return 'approved';
      if (status === 'REJECTED') return 'rejected';
      if (status === 'NOT_SUBMITTED') return 'pending';
      return 'pending';
    };

    return {
      id: backendData.id,
      maidId: backendData.maidId,
      maidName: backendData.maid.name,
      maidEmail: backendData.maid.email,
      maidPhone: backendData.maid.phone,
      status: getOverallStatus(backendData.status, backendData.documents),
      submittedAt: backendData.submittedAt || new Date().toISOString(),
      reviewedAt: backendData.reviewedAt,
      reviewedBy: backendData.reviewedBy,
      rejectionReason: backendData.rejectionReason,
      notes: backendData.adminNotes,
        documents: {
        aadharCard: {
          id: backendData.documents.aadharCard?.id || '',
          url: backendData.documents.aadharCard?.id || '',
          uploaded: !!backendData.documents.aadharCard,
          status: backendData.documents.aadharCard?.status || 'PENDING',
          filename: backendData.documents.aadharCard?.filename
        },
        policeVerification: {
          id: backendData.documents.policeVerification?.id || '',
          url: backendData.documents.policeVerification?.id || '',
          uploaded: !!backendData.documents.policeVerification,
          status: backendData.documents.policeVerification?.status || 'PENDING',
          filename: backendData.documents.policeVerification?.filename
        },
        photo: {
          id: backendData.documents.photo?.id || '',
          url: backendData.documents.photo?.id || '',
          uploaded: !!backendData.documents.photo,
          status: backendData.documents.photo?.status || 'PENDING',
          filename: backendData.documents.photo?.filename
        }
      },
      personalInfo: {
        fullName: backendData.maid.name,
        address: backendData.maid.address || 'Address not provided',
        experience: 'Not specified', // Backend doesn't have this field yet
        skills: [] // Backend doesn't have this field yet
      }
    };
  };

  // Fetch verifications from backend
  const fetchVerifications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await apiRequest('/documents/admin-verification-data', {
        method: HttpMethod.GET,
        requiresAuth: true
      });
      
      if (data.success && Array.isArray(data.data)) {
        const transformedVerifications = data.data.map((item: BackendMaidData) => transformBackendData(item));
        
        // Filter out processed verifications to prevent them from reappearing
        const filteredVerifications = transformedVerifications.filter(v => 
          !processedVerificationIds.has(v.id)
        );
        
        // Merge with existing processed verifications to maintain optimistic updates
        const existingProcessed = verifications.filter(v => 
          processedVerificationIds.has(v.id)
        );
        
        setVerifications([...existingProcessed, ...filteredVerifications]);
        
        toast({
          title: "Success",
          description: `Loaded ${transformedVerifications.length} verification requests`,
          duration: 3000,
        });
      } else {
        throw new Error(data.message || 'Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching verifications:', error);
      setError(error instanceof Error ? error.message : 'Failed to load verifications');
      
      toast({
        title: "Error",
        description: "Failed to load verification requests. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
      
      // Fallback to empty array
      setVerifications([]);
    } finally {
      setLoading(false);
    }
  };

  // Smart refresh that only updates statistics without overwriting processed verifications
  const refreshStatisticsOnly = async () => {
    try {
      // This could fetch updated statistics without affecting the main verification list
      // For now, we'll just skip the full refresh to maintain optimistic updates
    } catch (error) {
      console.error('Error refreshing statistics:', error);
    }
  };

  // Individual document approval/rejection
  const handleDocumentAction = async (documentId: string, action: 'approve' | 'reject', rejectionReason?: string, adminNotes?: string) => {
    try {
      setDocumentActionLoading(documentId);
      
      const data = await apiRequest(`/documents/verify/${documentId}`, {
        method: HttpMethod.PATCH,
        body: {
          action,
          rejectionReason,
          adminNotes
        },
        requiresAuth: true
      });
      
      if (data.success) {
        toast({
          title: "Success",
          description: `Document ${action}d successfully`,
          duration: 3000,
        });
        
        // Refresh the verification data to show updated document status
        await fetchVerifications();
      } else {
        throw new Error(data.message || `Failed to ${action} document`);
      }
    } catch (error) {
      console.error(`Error ${action}ing document:`, error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : `Failed to ${action} document`,
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setDocumentActionLoading(null);
    }
  };

  // Approve verification with optimistic updates
  const handleApproveVerification = async (verificationId: string, notes?: string, services?: string[]) => {
    try {
      setActionLoading(verificationId);
      
      // Optimistic update - immediately update the UI
      setVerifications(prev => prev.map(v => 
        v.id === verificationId 
          ? { ...v, status: 'approved' as const, notes: notes || '' }
          : v
      ));
      
      // Track this verification as processed
      setProcessedVerificationIds(prev => new Set(prev).add(verificationId));
      
      const data = await apiRequest(`/documents/approve/${verificationId}`, {
        method: HttpMethod.POST,
        body: {
          adminNotes: notes,
          assignedServices: services
        },
        requiresAuth: true
      });
      
      
      if (data.success) {
        toast({
          title: "Success",
          description: "Verification approved successfully",
          duration: 3000,
        });
        
        // Smart refresh - only refresh statistics, maintain UI state
        await refreshStatisticsOnly();
      } else {
        // Revert optimistic update on failure
        setVerifications(prev => prev.map(v => 
          v.id === verificationId 
            ? { ...v, status: 'pending' as const, notes: '' }
            : v
        ));
        setProcessedVerificationIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(verificationId);
          return newSet;
        });
        throw new Error(data.message || 'Approval failed');
      }
    } catch (error) {
      console.error('Error approving verification:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to approve verification",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Reject verification with optimistic updates
  const handleRejectVerification = async (verificationId: string, reason: string, notes?: string) => {
    try {
      setActionLoading(verificationId);
      
      // Optimistic update - immediately update the UI
      setVerifications(prev => prev.map(v => 
        v.id === verificationId 
          ? { ...v, status: 'rejected' as const, rejectionReason: reason, notes: notes || '' }
          : v
      ));
      
      // Track this verification as processed
      setProcessedVerificationIds(prev => new Set(prev).add(verificationId));
      
      const data = await apiRequest(`/documents/reject/${verificationId}`, {
        method: HttpMethod.POST,
        body: {
          rejectionReason: reason,
          adminNotes: notes
        },
        requiresAuth: true
      });
      
      
      if (data.success) {
        toast({
          title: "Success",
          description: "Verification rejected",
          duration: 3000,
        });
        
        // Smart refresh - only refresh statistics, maintain UI state
        await refreshStatisticsOnly();
      } else {
        // Revert optimistic update on failure
        setVerifications(prev => prev.map(v => 
          v.id === verificationId 
            ? { ...v, status: 'pending' as const, rejectionReason: '', notes: '' }
            : v
        ));
        setProcessedVerificationIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(verificationId);
          return newSet;
        });
        throw new Error(data.message || 'Rejection failed');
      }
    } catch (error) {
      console.error('Error rejecting verification:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to reject verification",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Get document URL using API
  const getDocumentUrl = async (documentId: string): Promise<{url: string, fileName: string}> => {
    try {
      const data = await apiRequest(`/documents/download/${documentId}`, {
        method: HttpMethod.GET,
        requiresAuth: true
      });
      
      if (data.success && data.data && data.data.url) {
        return {
          url: data.data.url,
          fileName: data.data.fileName || 'document'
        };
      } else {
        throw new Error(data.message || 'Failed to get document URL');
      }
    } catch (error) {
      console.error('Error getting document URL:', error);
      throw error;
    }
  };

  // Download document
  const handleDocumentDownload = async (documentId: string, fallbackFilename: string) => {
    try {
      const documentData = await getDocumentUrl(documentId);
      
      // Create a temporary link and click it to download
      const link = document.createElement('a');
      link.href = documentData.url;
      link.download = documentData.fileName || fallbackFilename;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Success",
        description: "Document download started",
        duration: 3000,
      });
    } catch (error) {
      console.error('Error downloading document:', error);
      toast({
        title: "Error",
        description: "Failed to download document",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  // Preview document
  const handleDocumentPreview = async (documentId: string, title: string) => {
    try {
      const documentData = await getDocumentUrl(documentId);
      setPreviewImage({url: documentData.url, title: title});
      setShowImagePreview(true);
    } catch (error) {
      console.error('Error getting document for preview:', error);
      toast({
        title: "Error",
        description: "Failed to load document preview",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchVerifications();
  }, []);

  const filteredVerifications = verifications.filter(verification => {
    const matchesSearch = 
      verification.maidName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      verification.maidEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      verification.maidPhone.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || verification.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredVerifications.length / itemsPerPage);
  const paginatedVerifications = filteredVerifications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const availableServices = [
    'Regular Cleaning',
    'Deep Cleaning', 
    'Kitchen Cleaning',
    'Bathroom Cleaning',
    'Full House Cleaning',
    'Carpet Cleaning',
    'Window Cleaning'
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-warning/20 text-warning border-warning/20';
      case 'approved':
        return 'bg-success/20 text-success border-success/20';
      case 'rejected':
        return 'bg-destructive/20 text-destructive border-destructive/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const handleApprove = async () => {
    if (selectedVerification) {
      await handleApproveVerification(selectedVerification.id, approvalNotes, selectedServices);
      setShowApproveDialog(false);
      setApprovalNotes('');
      setSelectedServices([]);
      setSelectedVerification(null);
    }
  };

  const handleReject = async () => {
    if (selectedVerification && rejectionReason) {
      await handleRejectVerification(selectedVerification.id, rejectionReason, rejectionNotes);
      setShowRejectDialog(false);
      setRejectionReason('');
      setRejectionNotes('');
      setSelectedVerification(null);
    }
  };

  const DocumentPreviewDialog = ({ verification }: { verification: MaidVerification }) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Eye className="h-4 w-4 mr-1" />
          View Documents
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Document Verification - {verification.maidName}</DialogTitle>
          <DialogDescription>
            Review all submitted documents and personal information
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Personal Information */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <User className="h-4 w-4" />
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-muted-foreground">Full Name</Label>
                <p className="font-medium">{verification.personalInfo.fullName}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Experience</Label>
                <p className="font-medium">{verification.personalInfo.experience}</p>
              </div>
              <div className="col-span-full">
                <Label className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  Address
                </Label>
                <p className="font-medium">{verification.personalInfo.address}</p>
              </div>
              <div className="col-span-full">
                <Label className="text-sm text-muted-foreground">Skills</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {verification.personalInfo.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-3">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-muted-foreground flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  Email
                </Label>
                <p className="font-medium">{verification.maidEmail}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  Phone
                </Label>
                <p className="font-medium">{verification.maidPhone}</p>
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Uploaded Documents
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <Label className="font-medium">Aadhar Card</Label>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={verification.documents.aadharCard.status === 'APPROVED' ? 'default' : 
                              verification.documents.aadharCard.status === 'REJECTED' ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      {verification.documents.aadharCard.status}
                    </Badge>
                    {verification.documents.aadharCard.uploaded ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                </div>
                {verification.documents.aadharCard.uploaded && (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleDocumentPreview(verification.documents.aadharCard.url, 'Aadhar Card')}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Preview
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDocumentDownload(verification.documents.aadharCard.url, 'aadhar_card.jpg')}
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                    {verification.documents.aadharCard.status === 'PENDING' && (
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          onClick={() => handleDocumentAction(verification.documents.aadharCard.id, 'approve')}
                          disabled={documentActionLoading === verification.documents.aadharCard.id}
                        >
                          {documentActionLoading === verification.documents.aadharCard.id ? (
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          ) : (
                            <Check className="h-3 w-3 mr-1" />
                          )}
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          className="flex-1"
                          onClick={() => handleDocumentAction(verification.documents.aadharCard.id, 'reject', 'Document quality issues')}
                          disabled={documentActionLoading === verification.documents.aadharCard.id}
                        >
                          {documentActionLoading === verification.documents.aadharCard.id ? (
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          ) : (
                            <X className="h-3 w-3 mr-1" />
                          )}
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <Label className="font-medium">PAN Card</Label>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={verification.documents.policeVerification.status === 'APPROVED' ? 'default' : 
                              verification.documents.policeVerification.status === 'REJECTED' ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      {verification.documents.policeVerification.status}
                    </Badge>
                    {verification.documents.policeVerification.uploaded ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                </div>
                {verification.documents.policeVerification.uploaded && (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleDocumentPreview(verification.documents.policeVerification.url, 'PAN Card')}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Preview
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDocumentDownload(verification.documents.policeVerification.url, 'pan_card.jpg')}
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                    {verification.documents.policeVerification.status === 'PENDING' && (
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          onClick={() => handleDocumentAction(verification.documents.policeVerification.id, 'approve')}
                          disabled={documentActionLoading === verification.documents.policeVerification.id}
                        >
                          {documentActionLoading === verification.documents.policeVerification.id ? (
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          ) : (
                            <Check className="h-3 w-3 mr-1" />
                          )}
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          className="flex-1"
                          onClick={() => handleDocumentAction(verification.documents.policeVerification.id, 'reject', 'Document quality issues')}
                          disabled={documentActionLoading === verification.documents.policeVerification.id}
                        >
                          {documentActionLoading === verification.documents.policeVerification.id ? (
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          ) : (
                            <X className="h-3 w-3 mr-1" />
                          )}
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <Label className="font-medium">Address Proof</Label>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={verification.documents.photo.status === 'APPROVED' ? 'default' : 
                              verification.documents.photo.status === 'REJECTED' ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      {verification.documents.photo.status}
                    </Badge>
                    {verification.documents.photo.uploaded ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                </div>
                {verification.documents.photo.uploaded && (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleDocumentPreview(verification.documents.photo.url, 'Address Proof')}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Preview
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDocumentDownload(verification.documents.photo.url, 'address_proof.jpg')}
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                    {verification.documents.photo.status === 'PENDING' && (
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          onClick={() => handleDocumentAction(verification.documents.photo.id, 'approve')}
                          disabled={documentActionLoading === verification.documents.photo.id}
                        >
                          {documentActionLoading === verification.documents.photo.id ? (
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          ) : (
                            <Check className="h-3 w-3 mr-1" />
                          )}
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          className="flex-1"
                          onClick={() => handleDocumentAction(verification.documents.photo.id, 'reject', 'Document quality issues')}
                          disabled={documentActionLoading === verification.documents.photo.id}
                        >
                          {documentActionLoading === verification.documents.photo.id ? (
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          ) : (
                            <X className="h-3 w-3 mr-1" />
                          )}
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Review History */}
          {(verification.status !== 'pending') && (
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-3">Review History</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <Badge className={getStatusColor(verification.status)}>
                    {verification.status.charAt(0).toUpperCase() + verification.status.slice(1)}
                  </Badge>
                </div>
                {verification.reviewedAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Reviewed on:</span>
                    <span className="text-sm">{new Date(verification.reviewedAt).toLocaleDateString()}</span>
                  </div>
                )}
                {verification.reviewedBy && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Reviewed by:</span>
                    <span className="text-sm">{verification.reviewedBy}</span>
                  </div>
                )}
                {verification.rejectionReason && (
                  <div>
                    <span className="text-sm text-muted-foreground">Rejection Reason:</span>
                    <p className="text-sm mt-1 p-2 bg-destructive/10 rounded">{verification.rejectionReason}</p>
                  </div>
                )}
                {verification.notes && (
                  <div>
                    <span className="text-sm text-muted-foreground">Notes:</span>
                    <p className="text-sm mt-1 p-2 bg-muted rounded">{verification.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );

  // Loading state
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Maid Verification Management
          </CardTitle>
          <CardDescription>
            Loading verification requests...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading verifications...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Maid Verification Management
          </CardTitle>
          <CardDescription>
            Error loading verification requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Failed to load verifications</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchVerifications} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Maid Verification Management
            </CardTitle>
            <CardDescription>
              Review and manage maid verification requests and document submissions
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchVerifications} 
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-warning/20 text-warning">
                {verifications.filter(v => v.status === 'pending').length} pending
              </Badge>
              <Badge variant="secondary" className="bg-success/20 text-success">
                {verifications.filter(v => v.status === 'approved').length} approved
              </Badge>
              <Badge variant="secondary" className="bg-destructive/20 text-destructive">
                {verifications.filter(v => v.status === 'rejected').length} rejected
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters and Search */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center mb-6">
          <div className="flex items-center gap-2 flex-1">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Verification Table */}
        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Maid Details</TableHead>
                <TableHead className="hidden md:table-cell">Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden lg:table-cell">Submitted</TableHead>
                <TableHead className="hidden md:table-cell">Documents</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedVerifications.map((verification) => (
                <TableRow key={verification.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white text-sm font-semibold">
                        {verification.maidName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-medium">{verification.maidName}</p>
                        <p className="text-sm text-muted-foreground">ID: {verification.maidId}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="space-y-1">
                      <p className="text-sm">{verification.maidEmail}</p>
                      <p className="text-sm text-muted-foreground">{verification.maidPhone}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${getStatusColor(verification.status)} flex items-center gap-1 w-fit`}>
                      {getStatusIcon(verification.status)}
                      {verification.status.charAt(0).toUpperCase() + verification.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <p className="text-sm">{new Date(verification.submittedAt).toLocaleDateString()}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(verification.submittedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center gap-1">
                      {verification.documents.aadharCard.uploaded ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      {verification.documents.policeVerification.uploaded ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      {verification.documents.photo.uploaded ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className="text-xs text-muted-foreground ml-2">
                        {[verification.documents.aadharCard.uploaded, verification.documents.policeVerification.uploaded, verification.documents.photo.uploaded].filter(Boolean).length}/3
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <DocumentPreviewDialog verification={verification} />
                      {verification.status === 'pending' && (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-green-600 border-green-200 hover:bg-green-50"
                            onClick={() => {
                              setSelectedVerification(verification);
                              setShowApproveDialog(true);
                            }}
                            disabled={actionLoading === verification.id}
                          >
                            {actionLoading === verification.id ? (
                              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            ) : (
                              <Check className="h-4 w-4 mr-1" />
                            )}
                            Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => {
                              setSelectedVerification(verification);
                              setShowRejectDialog(true);
                            }}
                            disabled={actionLoading === verification.id}
                          >
                            {actionLoading === verification.id ? (
                              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            ) : (
                              <X className="h-4 w-4 mr-1" />
                            )}
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Empty State */}
        {filteredVerifications.length === 0 && (
          <div className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No verifications found</h3>
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'No homecare partner verification requests have been submitted yet'
              }
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredVerifications.length)} of {filteredVerifications.length} results
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* Approve Dialog */}
        <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Approve Verification</DialogTitle>
              <DialogDescription>
                Approve {selectedVerification?.maidName}'s verification and assign services
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Assign Services</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {availableServices.map((service) => (
                    <div key={service} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={service}
                        checked={selectedServices.includes(service)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedServices([...selectedServices, service]);
                          } else {
                            setSelectedServices(selectedServices.filter(s => s !== service));
                          }
                        }}
                        className="rounded"
                      />
                      <Label htmlFor={service} className="text-sm">{service}</Label>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <Label>Approval Notes (Optional)</Label>
                <Textarea
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  placeholder="Add any notes about the approval..."
                  className="mt-2"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleApprove} 
                className="bg-green-600 hover:bg-green-700"
                disabled={actionLoading !== null}
              >
                {actionLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Check className="h-4 w-4 mr-2" />
                )}
                Approve Verification
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Verification</DialogTitle>
              <DialogDescription>
                Reject {selectedVerification?.maidName}'s verification request
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Rejection Reason *</Label>
                <Select value={rejectionReason} onValueChange={setRejectionReason}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select a reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="incomplete_documents">Incomplete Documents</SelectItem>
                    <SelectItem value="unclear_documents">Unclear/Poor Quality Documents</SelectItem>
                    <SelectItem value="invalid_documents">Invalid Documents</SelectItem>
                    <SelectItem value="address_mismatch">Address Mismatch</SelectItem>
                    <SelectItem value="insufficient_experience">Insufficient Experience</SelectItem>
                    <SelectItem value="background_verification_failed">Background Verification Failed</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Additional Notes</Label>
                <Textarea
                  value={rejectionNotes}
                  onChange={(e) => setRejectionNotes(e.target.value)}
                  placeholder="Provide specific feedback to help the homecare partner resubmit..."
                  className="mt-2"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleReject} 
                className="bg-red-600 hover:bg-red-700"
                disabled={!rejectionReason || actionLoading !== null}
              >
                {actionLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <X className="h-4 w-4 mr-2" />
                )}
                Reject Verification
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Image Preview Modal */}
        <Dialog open={showImagePreview} onOpenChange={setShowImagePreview}>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>{previewImage?.title}</DialogTitle>
              <DialogDescription>
                Document preview
              </DialogDescription>
            </DialogHeader>
            {previewImage && (
              <div className="flex items-center justify-center p-4 bg-muted rounded-lg">
                <img 
                  src={previewImage.url} 
                  alt={previewImage.title}
                  className="max-w-full max-h-[70vh] object-contain rounded-md shadow-md"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const errorDiv = document.createElement('div');
                    errorDiv.className = 'flex items-center justify-center h-48 text-muted-foreground';
                    errorDiv.innerHTML = '<p>Unable to load image. The document may be in a different format or the link may be expired.</p>';
                    target.parentNode?.appendChild(errorDiv);
                  }}
                />
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowImagePreview(false)}>
                Close
              </Button>
              {previewImage && (
                <Button onClick={() => {
                  const link = document.createElement('a');
                  link.href = previewImage.url;
                  link.download = previewImage.title.toLowerCase().replace(/\s+/g, '_');
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
