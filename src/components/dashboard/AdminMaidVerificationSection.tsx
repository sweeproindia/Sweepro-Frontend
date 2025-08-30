import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  Mail
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
      url: string;
      uploaded: boolean;
    };
    panCard: {
      url: string;
      uploaded: boolean;
    };
    electricityBill: {
      url: string;
      uploaded: boolean;
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

// Mock data for demonstration
const mockVerifications: MaidVerification[] = [
  {
    id: 'mv001',
    maidId: 'm001',
    maidName: 'Priya Sharma',
    maidEmail: 'priya.sharma@email.com',
    maidPhone: '+91 98765 43210',
    status: 'pending',
    submittedAt: '2024-01-15T10:30:00Z',
    documents: {
      aadharCard: { url: '/docs/aadhar1.jpg', uploaded: true },
      panCard: { url: '/docs/pan1.jpg', uploaded: true },
      electricityBill: { url: '/docs/bill1.jpg', uploaded: true }
    },
    personalInfo: {
      fullName: 'Priya Sharma',
      address: '123 MG Road, Bangalore, Karnataka 560001',
      experience: '3 years',
      skills: ['Deep Cleaning', 'Kitchen Cleaning', 'Bathroom Cleaning']
    }
  },
  {
    id: 'mv002',
    maidId: 'm002',
    maidName: 'Anjali Reddy',
    maidEmail: 'anjali.reddy@email.com',
    maidPhone: '+91 87654 32109',
    status: 'approved',
    submittedAt: '2024-01-10T14:20:00Z',
    reviewedAt: '2024-01-12T09:15:00Z',
    reviewedBy: 'Admin',
    notes: 'All documents verified successfully.',
    documents: {
      aadharCard: { url: '/docs/aadhar2.jpg', uploaded: true },
      panCard: { url: '/docs/pan2.jpg', uploaded: true },
      electricityBill: { url: '/docs/bill2.jpg', uploaded: true }
    },
    personalInfo: {
      fullName: 'Anjali Reddy',
      address: '456 HSR Layout, Bangalore, Karnataka 560102',
      experience: '5 years',
      skills: ['Full House Cleaning', 'Deep Cleaning', 'Carpet Cleaning']
    },
    assignedServices: ['Regular Cleaning', 'Deep Cleaning', 'Kitchen Cleaning']
  },
  {
    id: 'mv003',
    maidId: 'm003',
    maidName: 'Sunita Kumar',
    maidEmail: 'sunita.kumar@email.com',
    maidPhone: '+91 76543 21098',
    status: 'rejected',
    submittedAt: '2024-01-08T11:45:00Z',
    reviewedAt: '2024-01-09T16:30:00Z',
    reviewedBy: 'Admin',
    rejectionReason: 'Unclear documents',
    notes: 'Electricity bill image is not clear. Please resubmit.',
    documents: {
      aadharCard: { url: '/docs/aadhar3.jpg', uploaded: true },
      panCard: { url: '/docs/pan3.jpg', uploaded: true },
      electricityBill: { url: '/docs/bill3.jpg', uploaded: true }
    },
    personalInfo: {
      fullName: 'Sunita Kumar',
      address: '789 Whitefield, Bangalore, Karnataka 560066',
      experience: '2 years',
      skills: ['Regular Cleaning', 'Kitchen Cleaning']
    }
  },
];

export const AdminMaidVerificationSection: React.FC<AdminMaidVerificationSectionProps> = ({
  verifications = mockVerifications,
  onApproveVerification = () => {},
  onRejectVerification = () => {},
}) => {
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

  const itemsPerPage = 10;

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

  const handleApprove = () => {
    if (selectedVerification) {
      onApproveVerification(selectedVerification.id, approvalNotes, selectedServices);
      setShowApproveDialog(false);
      setApprovalNotes('');
      setSelectedServices([]);
      setSelectedVerification(null);
    }
  };

  const handleReject = () => {
    if (selectedVerification && rejectionReason) {
      onRejectVerification(selectedVerification.id, rejectionReason, rejectionNotes);
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
                  {verification.documents.aadharCard.uploaded ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
                {verification.documents.aadharCard.uploaded && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="h-3 w-3 mr-1" />
                      Preview
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>

              <div className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <Label className="font-medium">PAN Card</Label>
                  {verification.documents.panCard.uploaded ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
                {verification.documents.panCard.uploaded && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="h-3 w-3 mr-1" />
                      Preview
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>

              <div className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <Label className="font-medium">Electricity Bill</Label>
                  {verification.documents.electricityBill.uploaded ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
                {verification.documents.electricityBill.uploaded && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="h-3 w-3 mr-1" />
                      Preview
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-3 w-3" />
                    </Button>
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Maid Verification Management
            </CardTitle>
            <CardDescription>
              Review and manage maid verification requests and document submissions
            </CardDescription>
          </div>
          <div className="flex items-center gap-4">
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
        <div className="flex items-center gap-4 mb-6">
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
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Maid Details</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Documents</TableHead>
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
                  <TableCell>
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
                  <TableCell>
                    <p className="text-sm">{new Date(verification.submittedAt).toLocaleDateString()}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(verification.submittedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {verification.documents.aadharCard.uploaded ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      {verification.documents.panCard.uploaded ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      {verification.documents.electricityBill.uploaded ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className="text-xs text-muted-foreground ml-2">3/3</span>
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
                          >
                            <Check className="h-4 w-4 mr-1" />
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
                          >
                            <X className="h-4 w-4 mr-1" />
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
                : 'No maid verification requests have been submitted yet'
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
              <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700">
                <Check className="h-4 w-4 mr-2" />
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
                  placeholder="Provide specific feedback to help the maid resubmit..."
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
                disabled={!rejectionReason}
              >
                <X className="h-4 w-4 mr-2" />
                Reject Verification
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
