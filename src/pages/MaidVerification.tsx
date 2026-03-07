import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import  {DocumentUpload } from '@/components/ui/document-upload';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MaidDashboardLayout } from '@/components/dashboard/MaidDashboardLayout';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';
import { verificationService } from '@/services/verificationService';
import { 
  Shield, 
  FileText, 
  CreditCard, 
  User, 
  CheckCircle, 
  AlertTriangle, 
  Upload,
  Clock,
  XCircle
} from 'lucide-react';

interface VerificationDocuments {
  aadharCard: File[];
  panCard: File[];
  electricityBill: File[];
}

interface VerificationStatus {
  isSubmitted: boolean;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'NOT_SUBMITTED';
  submittedAt?: string;
  rejectionReason?: string;
}

export default function MaidVerification() {
  const { user } = useUser();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<VerificationDocuments>({
    aadharCard: [],
    panCard: [],
    electricityBill: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>({
    isSubmitted: false,
    status: 'NOT_SUBMITTED'
  });

  // Fetch existing verification status on mount
  useEffect(() => {
    const fetchVerificationStatus = async () => {
      try {
        const response = await verificationService.getMyVerificationStatus();
        if (response.success && response.data) {
          const data = response.data;
          if (data.isSubmitted || data.overallStatus !== 'NOT_SUBMITTED') {
            setVerificationStatus({
              isSubmitted: data.isSubmitted,
              status: data.overallStatus,
              rejectionReason: data.message
            });
          }
        }
      } catch (error) {
        console.error('Error fetching verification status:', error);
      }
    };

    fetchVerificationStatus();
  }, []);

  const handleDocumentChange = (type: keyof VerificationDocuments) => (files: File[]) => {
    setDocuments(prev => ({
      ...prev,
      [type]: files
    }));
  };

  const isFormValid = () => {
    return documents.aadharCard.length > 0 && 
           documents.panCard.length > 0 && 
           documents.electricityBill.length > 0;
  };

  const handleSubmit = async () => {
    if (!isFormValid()) {
      toast({
        title: 'Incomplete Documentation',
        description: 'Please upload all required documents before submitting.',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Create FormData for file uploads
      const formData = new FormData();

      // Add documents with correct field names expected by backend
      if (documents.aadharCard[0]) {
        formData.append('aadharCard', documents.aadharCard[0]);
      }
      if (documents.panCard[0]) {
        formData.append('panCard', documents.panCard[0]);
      }
      if (documents.electricityBill[0]) {
        formData.append('electricityBill', documents.electricityBill[0]);
      }

      // Make actual API call to upload verification documents
      const response = await verificationService.submitVerification(formData);

      if (response.success) {
        setVerificationStatus({
          isSubmitted: true,
          status: 'PENDING',
          submittedAt: new Date().toISOString()
        });

        toast({
          title: 'Verification Submitted Successfully',
          description: 'Your documents have been submitted for admin review. You will be notified once verified.',
          variant: 'default'
        });
      } else {
        throw new Error(response.message || 'Failed to submit documents');
      }

    } catch (error) {
      console.error('Error submitting verification:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit verification documents. Please try again.';
      toast({
        title: 'Submission Failed',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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

  if (verificationStatus.isSubmitted) {
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
                'Congratulations! Your profile has been verified. You can now receive service assignments.'}
              {verificationStatus.status === 'REJECTED' && 
                'Your verification was rejected. Please check the reason below and resubmit.'}
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

                {verificationStatus.status === 'REJECTED' && verificationStatus.rejectionReason && (
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Rejection Reason:</strong> {verificationStatus.rejectionReason}
                    </AlertDescription>
                  </Alert>
                )}

                {verificationStatus.status === 'APPROVED' && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Your profile is now verified! You can start receiving service assignments and earning money.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
              
              <div className="flex gap-4 mt-6">
                <Button variant="outline" onClick={() => window.location.href = '/maid-dashboard'}>
                  Back to Dashboard
                </Button>
                {verificationStatus.status === 'REJECTED' && (
                  <Button onClick={() => setVerificationStatus({ isSubmitted: false, status: 'NOT_SUBMITTED' })}>
                    Resubmit Documents
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
          <DocumentUpload
            title="Aadhar Card"
            description="Upload a clear photo or PDF of your Aadhar card (front and back if needed)"
            acceptedTypes={["image/*", "application/pdf"]}
            maxSize={5}
            required={true}
            onChange={handleDocumentChange('aadharCard')}
          />

          <DocumentUpload
            title="PAN Card"
            description="Upload a clear photo or PDF of your PAN card for tax identification"
            acceptedTypes={["image/*", "application/pdf"]}
            maxSize={5}
            required={true}
            onChange={handleDocumentChange('panCard')}
          />

          <DocumentUpload
            title="Electricity Bill"
            description="Upload a recent electricity bill (within last 3 months) for address verification"
            acceptedTypes={["image/*", "application/pdf"]}
            maxSize={5}
            required={true}
            onChange={handleDocumentChange('electricityBill')}
          />
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
                    {documents.aadharCard.length > 0 ? (
                      <CheckCircle className="h-4 w-4 text-success" />
                    ) : (
                      <XCircle className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className={`text-sm ${documents.aadharCard.length > 0 ? 'text-success' : 'text-muted-foreground'}`}>
                      Aadhar Card
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {documents.panCard.length > 0 ? (
                      <CheckCircle className="h-4 w-4 text-success" />
                    ) : (
                      <XCircle className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className={`text-sm ${documents.panCard.length > 0 ? 'text-success' : 'text-muted-foreground'}`}>
                      PAN Card
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {documents.electricityBill.length > 0 ? (
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
                      Please upload all three required documents to proceed with verification.
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
