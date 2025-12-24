import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import  {DocumentUpload } from '@/components/ui/document-upload';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MaidDashboardLayout } from '@/components/dashboard/MaidDashboardLayout';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';
import { API_BASE_URL, BACKEND_ORIGIN } from '@/services/api';
import { 
  Shield, 
  FileText, 
  CreditCard, 
  User, 
  CheckCircle, 
  AlertTriangle, 
  Upload,
  Clock,
  XCircle,
  Loader2,
  Calendar
} from 'lucide-react';

interface VerificationDocuments {
  aadharCard: File[];
  panCard: File[];
  electricityBill: File[];
}

interface DocumentStatus {
  id: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
  filename?: string;
  uploadedAt?: string;
  canReupload: boolean;
}

interface VerificationStatus {
  isSubmitted: boolean;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'NOT_SUBMITTED';
  submittedAt?: string;
  rejectionReason?: string;
  documents: {
    aadharCard?: DocumentStatus;
    panCard?: DocumentStatus;
    electricityBill?: DocumentStatus;
  };
}

export default function MaidVerification() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<VerificationDocuments>({
    aadharCard: [],
    panCard: [],
    electricityBill: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>({
    isSubmitted: false,
    status: 'NOT_SUBMITTED',
    documents: {}
  });

  const verificationStatusUrl = `${API_BASE_URL}/documents/maid-verification-status`;
  const verificationUploadUrl = `${API_BASE_URL}/documents/upload-verification`;

  const isMaidVerifiedFromProfile = Boolean((user as any)?.profiles?.maid?.isVerified) || ((user as any)?.profiles?.maid?.status === 'ACTIVE');

  // Load existing verification status on component mount
  useEffect(() => {
    if (isMaidVerifiedFromProfile) {
      navigate('/maid-dashboard');
      return;
    }
    const loadVerificationStatus = async () => {
      try {
        setIsLoading(true);
        setStatusError(null);
        const token = localStorage.getItem('authToken');
        if (!token) {
          setIsLoading(false);
          return;
        }

        // Use the new API endpoint for maid verification status
        const response = await fetch(verificationStatusUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const contentType = response.headers.get('content-type') || '';
        const result = contentType.includes('application/json')
          ? await response.json()
          : { success: false, message: await response.text() };

        if (response.ok && result.success && result.data) {
          const data = result.data;
            
            // If already approved, redirect to dashboard
            if (data.overallStatus === 'APPROVED') {
              toast({
                title: 'Already Verified',
                description: 'Your profile is already verified.',
                variant: 'default'
              });
              navigate('/maid-dashboard');
              return;
            }
            
            // Transform backend data to frontend format
            const transformedDocuments: any = {};
            
            if (data.documents) {
              // Map backend document types to frontend
              const docMapping = {
                'AADHAR_CARD': 'aadharCard',
                'PAN_CARD': 'panCard', 
                'ADDRESS_PROOF': 'electricityBill'
              };
              
              data.documents.forEach((doc: any) => {
                const frontendKey = docMapping[doc.type as keyof typeof docMapping];
                if (frontendKey) {
                  transformedDocuments[frontendKey] = {
                    id: doc.id,
                    status: doc.verificationStatus,
                    rejectionReason: doc.rejectionReason,
                    filename: doc.fileName,
                    uploadedAt: doc.createdAt,
                    canReupload: doc.verificationStatus === 'REJECTED'
                  };
                }
              });
            }
            
            setVerificationStatus({
              isSubmitted: data.hasDocuments,
              status: data.overallStatus,
              submittedAt: data.submittedAt,
              rejectionReason: data.rejectionReason,
              documents: transformedDocuments
            });

            // Allow upload only when explicitly NOT_SUBMITTED or REJECTED
            setShowUploadForm(data.overallStatus === 'NOT_SUBMITTED');
          } else {
            // If status fetch fails, do not show upload form (prevents accidental re-upload UI)
            setShowUploadForm(false);
            setStatusError(
              typeof (result as any)?.message === 'string' && (result as any).message
                ? (result as any).message
                : 'Failed to load verification status'
            );
          }
      } catch (error) {
        console.error('Error loading verification status:', error);
        setShowUploadForm(false);
        setStatusError(error instanceof Error ? error.message : 'Failed to load verification status');
      } finally {
        setIsLoading(false);
      }
    };

    loadVerificationStatus();
  }, [isMaidVerifiedFromProfile, reloadKey, verificationStatusUrl, navigate]);

  const getDocumentUploadRequirements = () => {
    const existing = verificationStatus.documents || {};
    const needsAadhar = !existing.aadharCard || existing.aadharCard.status === 'REJECTED';
    const needsPan = !existing.panCard || existing.panCard.status === 'REJECTED';
    const needsBill = !existing.electricityBill || existing.electricityBill.status === 'REJECTED';
    return {
      aadharCard: needsAadhar,
      panCard: needsPan,
      electricityBill: needsBill,
      any: needsAadhar || needsPan || needsBill
    };
  };

  const handleDocumentChange = (type: keyof VerificationDocuments) => (files: File[]) => {
    setDocuments(prev => ({
      ...prev,
      [type]: files
    }));
  };

  const handleReuploadDocument = (documentType: keyof VerificationDocuments) => {
    setShowUploadForm(true);
    setDocuments(prev => ({
      ...prev,
      [documentType]: []
    }));

    toast({
      title: 'Ready for Re-upload',
      description: `Please upload the corrected ${documentType.replace(/([A-Z])/g, ' $1').toLowerCase()} document and submit again.`,
      variant: 'default'
    });
  };

  const isFormValid = () => {
    const requirements = getDocumentUploadRequirements();
    if (!requirements.any) return false;
    if (requirements.aadharCard && documents.aadharCard.length === 0) return false;
    if (requirements.panCard && documents.panCard.length === 0) return false;
    if (requirements.electricityBill && documents.electricityBill.length === 0) return false;
    return true;
  };

  const handleSubmit = async () => {
    if (!isFormValid()) {
      toast({
        title: 'Incomplete Documentation',
        description: 'Please upload the required documents before submitting.',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      console.log('Starting document upload...');
      
      // Check if backend is accessible
      try {
        const healthCheck = await fetch(`${BACKEND_ORIGIN}/health`);
        console.log('Health check response:', healthCheck.status);
        if (!healthCheck.ok) {
          throw new Error('Backend server is not responding');
        }
      } catch (healthError) {
        console.error('Backend health check failed:', healthError);
        throw new Error('Cannot connect to server. Please ensure the backend is running.');
      }

      // Create FormData for file uploads
      const formData = new FormData();
      
      // Add documents with correct field names matching backend
      if (documents.aadharCard[0]) {
        formData.append('aadharCard', documents.aadharCard[0]);
        console.log('Added aadharCard:', documents.aadharCard[0].name);
      }
      if (documents.panCard[0]) {
        formData.append('panCard', documents.panCard[0]);
        console.log('Added panCard:', documents.panCard[0].name);
      }
      if (documents.electricityBill[0]) {
        formData.append('electricityBill', documents.electricityBill[0]);
        console.log('Added electricityBill:', documents.electricityBill[0].name);
      }

      // Get token from localStorage
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }

      console.log('Making API request to upload documents...');

      console.log(`Attempting upload to: ${verificationUploadUrl}`);
      const response = await fetch(verificationUploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error response:', errorText);

        // If already verified, redirect away from verification flow
        if (response.status === 403) {
          try {
            const parsed = JSON.parse(errorText);
            const msg = parsed?.message || errorText;
            if (typeof msg === 'string' && msg.toLowerCase().includes('already verified')) {
              toast({
                title: 'Already Verified',
                description: 'Your account is already verified. Redirecting to dashboard.',
                variant: 'default'
              });
              navigate('/maid-dashboard');
              return;
            }
          } catch {
            // ignore JSON parse errors
          }
        }
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await response.text();
        console.error('Non-JSON response:', responseText);
        throw new Error('Server returned non-JSON response: ' + responseText.substring(0, 200));
      }

      const result = await response.json();
      console.log('Upload result:', result);

      if (!result.success) {
        throw new Error(result.message || 'Failed to upload documents');
      }

      const refreshResponse = await fetch(verificationStatusUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (refreshResponse.ok) {
        const refreshContentType = refreshResponse.headers.get('content-type') || '';
        const refreshed = refreshContentType.includes('application/json')
          ? await refreshResponse.json()
          : { success: false, message: await refreshResponse.text() };
        if (refreshed.success && refreshed.data) {
          const data = refreshed.data;
          const transformedDocuments: any = {};
          if (data.documents) {
            const docMapping = {
              'AADHAR_CARD': 'aadharCard',
              'PAN_CARD': 'panCard',
              'ADDRESS_PROOF': 'electricityBill'
            };
            data.documents.forEach((doc: any) => {
              const frontendKey = docMapping[doc.type as keyof typeof docMapping];
              if (frontendKey) {
                transformedDocuments[frontendKey] = {
                  id: doc.id,
                  status: doc.verificationStatus,
                  rejectionReason: doc.rejectionReason,
                  filename: doc.fileName,
                  uploadedAt: doc.createdAt,
                  canReupload: doc.verificationStatus === 'REJECTED'
                };
              }
            });
          }

          setVerificationStatus({
            isSubmitted: data.hasDocuments,
            status: data.overallStatus,
            submittedAt: data.submittedAt,
            rejectionReason: data.rejectionReason,
            documents: transformedDocuments
          });
        }
      }

      setShowUploadForm(false);
      setDocuments({
        aadharCard: [],
        panCard: [],
        electricityBill: []
      });

      toast({
        title: 'Verification Submitted Successfully',
        description: `${result.data?.uploadedDocuments?.length || 3} document(s) have been uploaded successfully and submitted for admin review.`,
        variant: 'default'
      });

    } catch (error) {
      console.error('Error submitting verification:', error);
      
      let errorMessage = 'Failed to submit verification documents. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('fetch')) {
          errorMessage = 'Network error: Cannot connect to server. Please check if the backend is running on port 3000.';
        } else if (error.message.includes('Authentication')) {
          errorMessage = 'Authentication failed. Please log in again.';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: 'Submission Failed',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <MaidDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MaidDashboardLayout>
    );
  }

  if (statusError) {
    return (
      <MaidDashboardLayout>
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Unable to Load Verification Status
              </CardTitle>
              <CardDescription>
                {statusError}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Button onClick={() => setReloadKey(k => k + 1)}>
                  Retry
                </Button>
                <Button variant="outline" onClick={() => navigate('/maid-dashboard')}>
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </MaidDashboardLayout>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-5 w-5 text-warning" />;
      case 'APPROVED':
        return <CheckCircle className="h-5 w-5 text-success" />;
      case 'REJECTED':
        return <XCircle className="h-5 w-5 text-destructive" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'APPROVED':
        return 'bg-success/10 text-success border-success/20';
      case 'REJECTED':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Verification Pending';
      case 'APPROVED':
        return 'Verified';
      case 'REJECTED':
        return 'Verification Rejected';
      default:
        return 'Not Verified';
    }
  };

  if (verificationStatus.isSubmitted && !showUploadForm) {
    return (
      <MaidDashboardLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            <div className="flex justify-center">
              {getStatusIcon(verificationStatus.status)}
            </div>
            <h1 className="text-3xl font-bold text-foreground">
              {getStatusText(verificationStatus.status)}
            </h1>
            <p className="text-muted-foreground">
              {verificationStatus.status === 'PENDING' && 
                'Your verification documents have been submitted and are being reviewed by our admin team.'}
              {verificationStatus.status === 'APPROVED' && 
                '🎉 Congratulations! Your profile has been verified and you are now part of the Sweep Pro family! You can now receive service assignments and start earning.'}
              {verificationStatus.status === 'REJECTED' && 
                'Your verification was rejected. Please review the feedback below and upload corrected documents to continue.'}
            </p>
          </motion.div>

          <Card className={`border-2 ${getStatusColor(verificationStatus.status)}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon(verificationStatus.status)}
                Verification Status
              </CardTitle>
              <CardDescription>
                {verificationStatus.submittedAt && 
                  `Submitted on ${new Date(verificationStatus.submittedAt).toLocaleDateString()}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Badge className={getStatusColor(verificationStatus.status)}>
                  {getStatusText(verificationStatus.status)}
                </Badge>
                
                {verificationStatus.status === 'PENDING' && (
                  <Alert>
                    <Clock className="h-4 w-4" />
                    <AlertDescription>
                      Our admin team is reviewing your documents. This process typically takes 24-48 hours. 
                      You will receive a notification once the review is complete.
                    </AlertDescription>
                  </Alert>
                )}

                {verificationStatus.status === 'REJECTED' && (
                  <div className="space-y-3">
                    {verificationStatus.rejectionReason && (
                      <Alert variant="destructive">
                        <XCircle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>General Rejection Reason:</strong> {verificationStatus.rejectionReason}
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {/* Individual document statuses */}
                    {verificationStatus.documents && (
                      <div className="space-y-3">
                        <h4 className="font-medium text-sm">Document Status Details:</h4>
                        
                        {/* Aadhar Card Status */}
                        <div className={`p-3 border rounded-lg ${
                          verificationStatus.documents.aadharCard?.status === 'APPROVED' ? 'bg-green-50 border-green-200' :
                          verificationStatus.documents.aadharCard?.status === 'REJECTED' ? 'bg-red-50 border-red-200' :
                          verificationStatus.documents.aadharCard?.status === 'PENDING' ? 'bg-yellow-50 border-yellow-200' :
                          'bg-gray-50 border-gray-200'
                        }`}>
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-sm">Aadhar Card</p>
                            <Badge variant={
                              verificationStatus.documents.aadharCard?.status === 'APPROVED' ? 'default' :
                              verificationStatus.documents.aadharCard?.status === 'REJECTED' ? 'destructive' : 'secondary'
                            }>
                              {verificationStatus.documents.aadharCard?.status || 'Not Uploaded'}
                            </Badge>
                          </div>
                          {verificationStatus.documents.aadharCard?.rejectionReason && (
                            <p className="text-red-600 text-sm mt-2">{verificationStatus.documents.aadharCard.rejectionReason}</p>
                          )}
                          {verificationStatus.documents.aadharCard?.canReupload && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="mt-2"
                              onClick={() => handleReuploadDocument('aadharCard')}
                            >
                              <Upload className="h-3 w-3 mr-1" />
                              Re-upload
                            </Button>
                          )}
                        </div>

                        {/* PAN Card Status */}
                        <div className={`p-3 border rounded-lg ${
                          verificationStatus.documents.panCard?.status === 'APPROVED' ? 'bg-green-50 border-green-200' :
                          verificationStatus.documents.panCard?.status === 'REJECTED' ? 'bg-red-50 border-red-200' :
                          verificationStatus.documents.panCard?.status === 'PENDING' ? 'bg-yellow-50 border-yellow-200' :
                          'bg-gray-50 border-gray-200'
                        }`}>
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-sm">PAN Card</p>
                            <Badge variant={
                              verificationStatus.documents.panCard?.status === 'APPROVED' ? 'default' :
                              verificationStatus.documents.panCard?.status === 'REJECTED' ? 'destructive' : 'secondary'
                            }>
                              {verificationStatus.documents.panCard?.status || 'Not Uploaded'}
                            </Badge>
                          </div>
                          {verificationStatus.documents.panCard?.rejectionReason && (
                            <p className="text-red-600 text-sm mt-2">{verificationStatus.documents.panCard.rejectionReason}</p>
                          )}
                          {verificationStatus.documents.panCard?.canReupload && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="mt-2"
                              onClick={() => handleReuploadDocument('panCard')}
                            >
                              <Upload className="h-3 w-3 mr-1" />
                              Re-upload
                            </Button>
                          )}
                        </div>

                        {/* Address Proof Status */}
                        <div className={`p-3 border rounded-lg ${
                          verificationStatus.documents.electricityBill?.status === 'APPROVED' ? 'bg-green-50 border-green-200' :
                          verificationStatus.documents.electricityBill?.status === 'REJECTED' ? 'bg-red-50 border-red-200' :
                          verificationStatus.documents.electricityBill?.status === 'PENDING' ? 'bg-yellow-50 border-yellow-200' :
                          'bg-gray-50 border-gray-200'
                        }`}>
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-sm">Address Proof</p>
                            <Badge variant={
                              verificationStatus.documents.electricityBill?.status === 'APPROVED' ? 'default' :
                              verificationStatus.documents.electricityBill?.status === 'REJECTED' ? 'destructive' : 'secondary'
                            }>
                              {verificationStatus.documents.electricityBill?.status || 'Not Uploaded'}
                            </Badge>
                          </div>
                          {verificationStatus.documents.electricityBill?.rejectionReason && (
                            <p className="text-red-600 text-sm mt-2">{verificationStatus.documents.electricityBill.rejectionReason}</p>
                          )}
                          {verificationStatus.documents.electricityBill?.canReupload && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="mt-2"
                              onClick={() => handleReuploadDocument('electricityBill')}
                            >
                              <Upload className="h-3 w-3 mr-1" />
                              Re-upload
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {verificationStatus.status === 'APPROVED' && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      <strong>🎉 Welcome to Sweep Pro!</strong><br/>
                      Your profile is now verified! You can start receiving service assignments and earning money. Your account is fully active and ready to go!
                    </AlertDescription>
                  </Alert>
                )}
              </div>
              
              <div className="flex gap-4 mt-6">
                <Button variant="outline" onClick={() => window.location.href = '/maid-dashboard'}>
                  Back to Dashboard
                </Button>
                {verificationStatus.status === 'APPROVED' && (
                  <Button onClick={() => window.location.href = '/maid-bookings'} className="bg-green-600 hover:bg-green-700">
                    <Calendar className="h-4 w-4 mr-2" />
                    View Available Jobs
                  </Button>
                )}
                {verificationStatus.status === 'REJECTED' && (
                  <Button 
                    onClick={() => {
                      setShowUploadForm(true);
                    }}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Corrected Documents
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </MaidDashboardLayout>
    );
  }

  return (
    <MaidDashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground">Profile Verification</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Complete your profile verification by uploading the required documents. 
            This helps us ensure the safety and security of our platform for all users.
          </p>
        </motion.div>

        {/* Verification Requirements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Verification Requirements
              </CardTitle>
              <CardDescription>
                Please ensure all documents are clear, valid, and match your profile information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-sm">Aadhar Card</p>
                    <p className="text-xs text-muted-foreground">Government identity proof</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <FileText className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-sm">PAN Card</p>
                    <p className="text-xs text-muted-foreground">Tax identification document</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <Shield className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-sm">Electricity Bill</p>
                    <p className="text-xs text-muted-foreground">Address verification document</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Document Upload Forms */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {(() => {
            const requirements = getDocumentUploadRequirements();
            const existing = verificationStatus.documents || {};
            return (
              <>
                {requirements.aadharCard ? (
                  <DocumentUpload
                    title="Aadhar Card"
                    description="Upload a clear photo or PDF of your Aadhar card (front and back if needed)"
                    acceptedTypes={["image/*", "application/pdf"]}
                    maxSize={5}
                    required={true}
                    onChange={handleDocumentChange('aadharCard')}
                  />
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Aadhar Card
                      </CardTitle>
                      <CardDescription>
                        Already uploaded ({existing.aadharCard?.status || 'PENDING'})
                      </CardDescription>
                    </CardHeader>
                  </Card>
                )}

                {requirements.panCard ? (
                  <DocumentUpload
                    title="PAN Card"
                    description="Upload a clear photo or PDF of your PAN card for tax identification"
                    acceptedTypes={["image/*", "application/pdf"]}
                    maxSize={5}
                    required={true}
                    onChange={handleDocumentChange('panCard')}
                  />
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        PAN Card
                      </CardTitle>
                      <CardDescription>
                        Already uploaded ({existing.panCard?.status || 'PENDING'})
                      </CardDescription>
                    </CardHeader>
                  </Card>
                )}

                {requirements.electricityBill ? (
                  <DocumentUpload
                    title="Electricity Bill"
                    description="Upload a recent electricity bill (within last 3 months) for address verification"
                    acceptedTypes={["image/*", "application/pdf"]}
                    maxSize={5}
                    required={true}
                    onChange={handleDocumentChange('electricityBill')}
                  />
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Electricity Bill
                      </CardTitle>
                      <CardDescription>
                        Already uploaded ({existing.electricityBill?.status || 'PENDING'})
                      </CardDescription>
                    </CardHeader>
                  </Card>
                )}
              </>
            );
          })()}
        </motion.div>

        {/* Submission Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Submit for Verification
              </CardTitle>
              <CardDescription>
                Review your documents and submit for admin verification
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Document Checklist */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    {!getDocumentUploadRequirements().aadharCard || documents.aadharCard.length > 0 ? (
                      <CheckCircle className="h-4 w-4 text-success" />
                    ) : (
                      <XCircle className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className={`text-sm ${documents.aadharCard.length > 0 ? 'text-success' : 'text-muted-foreground'}`}>
                      Aadhar Card
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {!getDocumentUploadRequirements().panCard || documents.panCard.length > 0 ? (
                      <CheckCircle className="h-4 w-4 text-success" />
                    ) : (
                      <XCircle className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className={`text-sm ${documents.panCard.length > 0 ? 'text-success' : 'text-muted-foreground'}`}>
                      PAN Card
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {!getDocumentUploadRequirements().electricityBill || documents.electricityBill.length > 0 ? (
                      <CheckCircle className="h-4 w-4 text-success" />
                    ) : (
                      <XCircle className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className={`text-sm ${documents.electricityBill.length > 0 ? 'text-success' : 'text-muted-foreground'}`}>
                      Electricity Bill
                    </span>
                  </div>
                </div>

                {!isFormValid() && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Please upload the required documents to proceed with verification.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="pt-4 border-t">
                  <div className="flex flex-col sm:flex-row gap-4 justify-between">
                    <Button
                      variant="outline"
                      onClick={() => window.location.href = '/maid-dashboard'}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={!isFormValid() || isSubmitting}
                      className="bg-primary hover:bg-primary/90"
                    >
                      {isSubmitting ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                          />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Submit for Verification
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Information Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Verification Process
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <Upload className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-medium">1. Upload Documents</h3>
                  <p className="text-sm text-muted-foreground">
                    Submit all required verification documents
                  </p>
                </div>
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-warning/10 rounded-full flex items-center justify-center mx-auto">
                    <Clock className="h-6 w-6 text-warning" />
                  </div>
                  <h3 className="font-medium">2. Admin Review</h3>
                  <p className="text-sm text-muted-foreground">
                    Our team reviews your documents (24-48 hours)
                  </p>
                </div>
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="h-6 w-6 text-success" />
                  </div>
                  <h3 className="font-medium">3. Get Verified</h3>
                  <p className="text-sm text-muted-foreground">
                    Start receiving service assignments
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </MaidDashboardLayout>
  );
}
