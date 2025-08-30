import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useToast } from '@/hooks/use-toast';
import {
  Shield,
  FileText,
  CreditCard,
  User,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Download,
  Search,
  Filter,
  Calendar,
  Phone,
  Mail,
  MapPin,
  AlertTriangle,
  UserCheck,
  UserX,
  Zap,
  Star,
  MoreVertical,
  RefreshCw
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface MaidVerification {
  id: string;
  maidId: string;
  maid: {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    profileImage?: string;
    joinedDate: string;
    totalServices?: number;
    rating?: number;
  };
  documents: {
    aadharCard: {
      filename: string;
      url: string;
      uploadedAt: string;
      fileSize: number;
    };
    panCard: {
      filename: string;
      url: string;
      uploadedAt: string;
      fileSize: number;
    };
    electricityBill: {
      filename: string;
      url: string;
      uploadedAt: string;
      fileSize: number;
    };
  };
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  adminNotes?: string;
}

export default function AdminMaidVerification() {
  const { toast } = useToast();
  const [verifications, setVerifications] = useState<MaidVerification[]>([]);
  const [filteredVerifications, setFilteredVerifications] = useState<MaidVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [selectedVerification, setSelectedVerification] = useState<MaidVerification | null>(null);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [reviewAction, setReviewAction] = useState<'APPROVE' | 'REJECT'>('APPROVE');
  const [rejectionReason, setRejectionReason] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [isDocumentViewOpen, setIsDocumentViewOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<{type: string, url: string, filename: string} | null>(null);

  useEffect(() => {
    fetchVerifications();
  }, []);

  useEffect(() => {
    filterVerifications();
  }, [verifications, searchTerm, statusFilter]);

  const fetchVerifications = async () => {
    setLoading(true);
    try {
      // Simulate API call - replace with actual API
      const mockData: MaidVerification[] = [
        {
          id: 'ver_001',
          maidId: 'maid_001',
          maid: {
            id: 'maid_001',
            name: 'Priya Sharma',
            email: 'priya.sharma@email.com',
            phone: '+91 9876543210',
            address: 'MG Road, Bangalore, Karnataka 560001',
            joinedDate: '2024-01-15',
            totalServices: 0,
            rating: 0
          },
          documents: {
            aadharCard: {
              filename: 'aadhar_priya_sharma.pdf',
              url: '/api/documents/aadhar_priya_sharma.pdf',
              uploadedAt: '2024-01-20T10:30:00Z',
              fileSize: 1024000
            },
            panCard: {
              filename: 'pan_priya_sharma.jpg',
              url: '/api/documents/pan_priya_sharma.jpg',
              uploadedAt: '2024-01-20T10:32:00Z',
              fileSize: 512000
            },
            electricityBill: {
              filename: 'electricity_bill_priya.pdf',
              url: '/api/documents/electricity_bill_priya.pdf',
              uploadedAt: '2024-01-20T10:35:00Z',
              fileSize: 768000
            }
          },
          status: 'PENDING',
          submittedAt: '2024-01-20T10:35:00Z'
        },
        {
          id: 'ver_002',
          maidId: 'maid_002',
          maid: {
            id: 'maid_002',
            name: 'Sunita Devi',
            email: 'sunita.devi@email.com',
            phone: '+91 9876543211',
            address: 'Koramangala, Bangalore, Karnataka 560034',
            joinedDate: '2024-01-10',
            totalServices: 5,
            rating: 4.2
          },
          documents: {
            aadharCard: {
              filename: 'aadhar_sunita_devi.pdf',
              url: '/api/documents/aadhar_sunita_devi.pdf',
              uploadedAt: '2024-01-12T14:20:00Z',
              fileSize: 1536000
            },
            panCard: {
              filename: 'pan_sunita_devi.jpg',
              url: '/api/documents/pan_sunita_devi.jpg',
              uploadedAt: '2024-01-12T14:22:00Z',
              fileSize: 512000
            },
            electricityBill: {
              filename: 'electricity_bill_sunita.pdf',
              url: '/api/documents/electricity_bill_sunita.pdf',
              uploadedAt: '2024-01-12T14:25:00Z',
              fileSize: 896000
            }
          },
          status: 'APPROVED',
          submittedAt: '2024-01-12T14:25:00Z',
          reviewedAt: '2024-01-13T09:15:00Z',
          reviewedBy: 'Admin User',
          adminNotes: 'All documents verified successfully. Clear and valid documents provided.'
        }
      ];

      setVerifications(mockData);
    } catch (error) {
      console.error('Error fetching verifications:', error);
      toast({
        title: 'Error',
        description: 'Failed to load maid verifications',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const filterVerifications = () => {
    let filtered = verifications;

    if (searchTerm) {
      filtered = filtered.filter(
        verification =>
          verification.maid.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          verification.maid.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          verification.maid.phone.includes(searchTerm)
      );
    }

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(verification => verification.status === statusFilter);
    }

    setFilteredVerifications(filtered);
  };

  const handleReviewSubmit = async () => {
    if (!selectedVerification) return;

    if (reviewAction === 'REJECT' && !rejectionReason.trim()) {
      toast({
        title: 'Rejection Reason Required',
        description: 'Please provide a reason for rejection',
        variant: 'destructive'
      });
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const updatedVerification = {
        ...selectedVerification,
        status: reviewAction === 'APPROVE' ? 'APPROVED' as const : 'REJECTED' as const,
        reviewedAt: new Date().toISOString(),
        reviewedBy: 'Admin User',
        rejectionReason: reviewAction === 'REJECT' ? rejectionReason : undefined,
        adminNotes: adminNotes || undefined
      };

      setVerifications(prev =>
        prev.map(v => v.id === selectedVerification.id ? updatedVerification : v)
      );

      toast({
        title: `Verification ${reviewAction === 'APPROVE' ? 'Approved' : 'Rejected'}`,
        description: `Maid ${selectedVerification.maid.name} has been ${reviewAction === 'APPROVE' ? 'approved' : 'rejected'} successfully`,
        variant: 'default'
      });

      setIsReviewDialogOpen(false);
      setSelectedVerification(null);
      setRejectionReason('');
      setAdminNotes('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update verification status',
        variant: 'destructive'
      });
    }
  };

  const openDocumentViewer = (type: string, url: string, filename: string) => {
    setSelectedDocument({ type, url, filename });
    setIsDocumentViewOpen(true);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4" />;
      case 'APPROVED':
        return <CheckCircle className="h-4 w-4" />;
      case 'REJECTED':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const stats = {
    total: verifications.length,
    pending: verifications.filter(v => v.status === 'PENDING').length,
    approved: verifications.filter(v => v.status === 'APPROVED').length,
    rejected: verifications.filter(v => v.status === 'REJECTED').length
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Maid Verification</h1>
            <p className="text-muted-foreground mt-2">
              Review and approve maid verification documents
            </p>
          </div>
          <Button onClick={fetchVerifications} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Submissions</p>
                  <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                </div>
                <Shield className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Review</p>
                  <p className="text-2xl font-bold text-warning">{stats.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-warning" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Approved</p>
                  <p className="text-2xl font-bold text-success">{stats.approved}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Rejected</p>
                  <p className="text-2xl font-bold text-destructive">{stats.rejected}</p>
                </div>
                <XCircle className="h-8 w-8 text-destructive" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-80"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <div className="flex space-x-2">
                  {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((status) => (
                    <Button
                      key={status}
                      variant={statusFilter === status ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setStatusFilter(status as any)}
                    >
                      {status}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Verifications List */}
        <div className="space-y-4">
          {filteredVerifications.map((verification) => (
            <motion.div
              key={verification.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border rounded-lg hover:shadow-md transition-shadow"
            >
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">
                          {verification.maid.name}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <div className="flex items-center gap-1">
                            <Mail className="h-4 w-4" />
                            {verification.maid.email}
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            {verification.maid.phone}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                          <MapPin className="h-4 w-4" />
                          {verification.maid.address}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge className={`${getStatusColor(verification.status)} flex items-center gap-1`}>
                        {getStatusIcon(verification.status)}
                        {verification.status}
                      </Badge>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedVerification(verification);
                              setReviewAction('APPROVE');
                              setIsReviewDialogOpen(true);
                            }}
                            disabled={verification.status !== 'PENDING'}
                          >
                            <UserCheck className="h-4 w-4 mr-2" />
                            Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedVerification(verification);
                              setReviewAction('REJECT');
                              setIsReviewDialogOpen(true);
                            }}
                            disabled={verification.status !== 'PENDING'}
                          >
                            <UserX className="h-4 w-4 mr-2" />
                            Reject
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Maid Info */}
                    <div>
                      <h4 className="font-medium text-foreground mb-3">Maid Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Joined Date:</span>
                          <span>{new Date(verification.maid.joinedDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Services Completed:</span>
                          <span>{verification.maid.totalServices || 0}</span>
                        </div>
                        {verification.maid.rating && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Rating:</span>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              <span>{verification.maid.rating}</span>
                            </div>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Submitted:</span>
                          <span>{new Date(verification.submittedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Documents */}
                    <div>
                      <h4 className="font-medium text-foreground mb-3">Documents</h4>
                      <div className="space-y-3">
                        {/* Aadhar Card */}
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-primary" />
                            <div>
                              <p className="font-medium text-sm">Aadhar Card</p>
                              <p className="text-xs text-muted-foreground">
                                {formatFileSize(verification.documents.aadharCard.fileSize)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openDocumentViewer(
                                'Aadhar Card',
                                verification.documents.aadharCard.url,
                                verification.documents.aadharCard.filename
                              )}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(verification.documents.aadharCard.url, '_blank')}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* PAN Card */}
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-primary" />
                            <div>
                              <p className="font-medium text-sm">PAN Card</p>
                              <p className="text-xs text-muted-foreground">
                                {formatFileSize(verification.documents.panCard.fileSize)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openDocumentViewer(
                                'PAN Card',
                                verification.documents.panCard.url,
                                verification.documents.panCard.filename
                              )}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(verification.documents.panCard.url, '_blank')}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Electricity Bill */}
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4 text-primary" />
                            <div>
                              <p className="font-medium text-sm">Electricity Bill</p>
                              <p className="text-xs text-muted-foreground">
                                {formatFileSize(verification.documents.electricityBill.fileSize)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openDocumentViewer(
                                'Electricity Bill',
                                verification.documents.electricityBill.url,
                                verification.documents.electricityBill.filename
                              )}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(verification.documents.electricityBill.url, '_blank')}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Review Info */}
                  {verification.reviewedAt && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Reviewed by {verification.reviewedBy} on{' '}
                            {new Date(verification.reviewedAt).toLocaleDateString()}
                          </p>
                          {verification.adminNotes && (
                            <p className="text-sm text-foreground mt-1">
                              Notes: {verification.adminNotes}
                            </p>
                          )}
                          {verification.rejectionReason && (
                            <p className="text-sm text-destructive mt-1">
                              Rejection Reason: {verification.rejectionReason}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {filteredVerifications.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No verifications found
                </h3>
                <p className="text-muted-foreground">
                  {searchTerm || statusFilter !== 'ALL'
                    ? 'Try adjusting your search or filters'
                    : 'No maid verifications have been submitted yet'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Review Dialog */}
        <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {reviewAction === 'APPROVE' ? 'Approve' : 'Reject'} Verification
              </DialogTitle>
              <DialogDescription>
                {reviewAction === 'APPROVE'
                  ? `Approve ${selectedVerification?.maid.name}'s verification to allow service assignments`
                  : `Reject ${selectedVerification?.maid.name}'s verification and provide feedback`}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {reviewAction === 'REJECT' && (
                <div>
                  <Label htmlFor="rejection-reason">Rejection Reason *</Label>
                  <Textarea
                    id="rejection-reason"
                    placeholder="Please provide a clear reason for rejection..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={3}
                  />
                </div>
              )}

              <div>
                <Label htmlFor="admin-notes">Admin Notes (Optional)</Label>
                <Textarea
                  id="admin-notes"
                  placeholder="Add any internal notes about this verification..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={2}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsReviewDialogOpen(false);
                  setRejectionReason('');
                  setAdminNotes('');
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleReviewSubmit}
                className={reviewAction === 'APPROVE' ? 'bg-success hover:bg-success/90' : 'bg-destructive hover:bg-destructive/90'}
              >
                {reviewAction === 'APPROVE' ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Document Viewer Dialog */}
        <Dialog open={isDocumentViewOpen} onOpenChange={setIsDocumentViewOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>
                {selectedDocument?.type} - {selectedDocument?.filename}
              </DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-hidden">
              {selectedDocument?.url && (
                <iframe
                  src={selectedDocument.url}
                  className="w-full h-[70vh] border rounded-lg"
                  title={selectedDocument.filename}
                />
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => window.open(selectedDocument?.url, '_blank')}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button onClick={() => setIsDocumentViewOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
