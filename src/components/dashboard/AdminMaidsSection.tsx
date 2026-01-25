import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Shield, ChevronLeft, ChevronRight, User, Phone, MapPin, Star, Search } from 'lucide-react';

import QrCodeRenderer from '@/components/qr/QrCodeRenderer';
import { apiRequest, HttpMethod } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface Maid {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  experience: string;
  specializations: string[];
  rating: number;
  status: 'active' | 'inactive' | 'on_leave';
  rawStatus: 'PENDING_VERIFICATION' | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'BLACKLISTED' | 'ON_LEAVE';
  totalBookings: number;
  joinDate: string;
  weeklyOffDay?: string | null;
  availability?: Record<string, any> | null;
}

interface AdminMaidsSectionProps {
  allMaids: Maid[];
  onAddMaid: (maid: Omit<Maid, 'id' | 'rating' | 'totalBookings' | 'joinDate'>) => void;
  onVerifyMaid: (maidId: string) => void;
}

export const AdminMaidsSection: React.FC<AdminMaidsSectionProps> = ({
  allMaids,
  onAddMaid,
  onVerifyMaid,
}) => {
  const { toast } = useToast();
  const [showAddMaidDialog, setShowAddMaidDialog] = useState(false);
  const [showQrDialog, setShowQrDialog] = useState(false);
  const [qrMaid, setQrMaid] = useState<Maid | null>(null);
  const [weeklyOffDialogOpen, setWeeklyOffDialogOpen] = useState(false);
  const [weeklyOffMaid, setWeeklyOffMaid] = useState<Maid | null>(null);
  const [weeklyOffDay, setWeeklyOffDay] = useState<string>('NONE');
  const [savingWeeklyOff, setSavingWeeklyOff] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [searchTerm, setSearchTerm] = useState('');

  const [newMaid, setNewMaid] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    experience: '',
    specializations: [] as string[],
    status: 'inactive' as const,
    rawStatus: 'INACTIVE' as const,
    availability: null as Record<string, any> | null,
  });

  const getPaginatedData = (data: Maid[], page: number) => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  const openWeeklyOffDialog = (maid: Maid) => {
    setWeeklyOffMaid(maid);
    setWeeklyOffDay(maid.weeklyOffDay || 'NONE');
    setWeeklyOffDialogOpen(true);
  };

  const saveWeeklyOff = async () => {
    if (!weeklyOffMaid) return;
    setSavingWeeklyOff(true);
    try {
      const payload = {
        weeklyOffDay: weeklyOffDay === 'NONE' ? null : weeklyOffDay
      };
      const res: any = await apiRequest(`/maids/${weeklyOffMaid.id}/weekly-off`, {
        method: HttpMethod.PUT,
        requiresAuth: true,
        body: payload
      });

      if (res?.success === false) {
        throw new Error(res?.error || res?.message || 'Failed to update weekly off day');
      }

      toast({
        title: 'Weekly Leave Updated',
        description: 'Maid weekly off day updated successfully.'
      });

      setWeeklyOffDialogOpen(false);
      setWeeklyOffMaid(null);
    } catch (e: any) {
      toast({
        title: 'Update Failed',
        description: e?.message || 'Failed to update weekly off day',
        variant: 'destructive'
      });
    } finally {
      setSavingWeeklyOff(false);
    }
  };

  const getTotalPages = (data: Maid[]) => {
    return Math.ceil(data.length / itemsPerPage);
  };

  const getSerialNumber = (index: number, page: number) => {
    return (page - 1) * itemsPerPage + index + 1;
  };

  const handleAddMaid = () => {
    onAddMaid(newMaid);
    setNewMaid({
      name: '',
      email: '',
      phone: '',
      address: '',
      experience: '',
      specializations: [],
      status: 'inactive',
      rawStatus: 'INACTIVE',
      availability: null,
    });
    setShowAddMaidDialog(false);
  };

  const qrPayload = qrMaid
    ? JSON.stringify({
        maidId: qrMaid.id,
        userId: qrMaid.id,
        name: qrMaid.name,
        email: qrMaid.email,
        type: 'maid_verification',
        timestamp: new Date().toISOString(),
      })
    : '';

  const copyQrPayload = async () => {
    if (!qrPayload) return;
    try {
      await navigator.clipboard.writeText(qrPayload);
    } catch {}
  };

  const getStatusColor = (status: Maid['status']) => {
    switch (status) {
      case 'active':
        return 'bg-success/20 text-success';
      case 'inactive':
        return 'bg-muted text-muted-foreground';
      case 'on_leave':
        return 'bg-warning/20 text-warning';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const formatStatus = (status: Maid['status']) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'inactive':
        return 'Inactive';
      case 'on_leave':
        return 'On Leave';
      default:
        return 'Inactive';
    }
  };

  const filteredMaids = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return allMaids;
    return allMaids.filter((maid) => {
      const name = maid.name.toLowerCase();
      const email = maid.email.toLowerCase();
      const phone = maid.phone.toLowerCase();
      const address = maid.address?.toLowerCase() ?? '';
      const specs = maid.specializations.map((spec) => spec.toLowerCase()).join(' ');
      return (
        name.includes(term) ||
        email.includes(term) ||
        phone.includes(term) ||
        address.includes(term) ||
        specs.includes(term)
      );
    });
  }, [allMaids, searchTerm]);

  const totalPages = Math.max(1, getTotalPages(filteredMaids));
  const paginatedMaids = getPaginatedData(filteredMaids, currentPage);

  useMemo(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const Pagination = ({ currentPage, totalPages, onPageChange }: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  }) => (
    <div className="flex items-center justify-between mt-4">
      <div className="text-sm text-muted-foreground">
        Page {currentPage} of {totalPages}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  return (
    <Card className="dashboard-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Maid Management
            </CardTitle>
            <CardDescription>Manage homecare partner accounts, verify new homecare partners, and monitor performance</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-success/20 text-success">
              {allMaids.filter(m => m.status === 'active').length} active
            </Badge>
            <Badge variant="secondary" className="bg-muted text-muted-foreground">
              {allMaids.filter(m => m.status === 'inactive').length} inactive
            </Badge>
            <Badge variant="secondary" className="bg-warning/20 text-warning">
              {allMaids.filter(m => m.status === 'on_leave').length} on leave
            </Badge>
            <Dialog open={showAddMaidDialog} onOpenChange={setShowAddMaidDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Shield className="h-4 w-4 mr-2" />
                  Add New Maid
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Add New Homecare Partner</DialogTitle>
                  <DialogDescription>
                    Fill in the homecare partner's details to register them in the system.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={newMaid.name}
                        onChange={(e) => setNewMaid({...newMaid, name: e.target.value})}
                        placeholder="Enter full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newMaid.email}
                        onChange={(e) => setNewMaid({...newMaid, email: e.target.value})}
                        placeholder="Enter email address"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={newMaid.phone}
                        onChange={(e) => setNewMaid({...newMaid, phone: e.target.value})}
                        placeholder="Enter phone number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="experience">Experience</Label>
                      <Select onValueChange={(value) => setNewMaid({...newMaid, experience: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select experience" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1 year">1 year</SelectItem>
                          <SelectItem value="2 years">2 years</SelectItem>
                          <SelectItem value="3 years">3 years</SelectItem>
                          <SelectItem value="4 years">4 years</SelectItem>
                          <SelectItem value="5 years">5 years</SelectItem>
                          <SelectItem value="6+ years">6+ years</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      value={newMaid.address}
                      onChange={(e) => setNewMaid({...newMaid, address: e.target.value})}
                      placeholder="Enter full address"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Specializations</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {['Regular Cleaning', 'Deep Cleaning', 'Kitchen Cleaning', 'Bathroom Cleaning', 'Full House Cleaning', 'Carpet Cleaning'].map((spec) => (
                        <div key={spec} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={spec}
                            checked={newMaid.specializations.includes(spec)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewMaid({
                                  ...newMaid,
                                  specializations: [...newMaid.specializations, spec]
                                });
                              } else {
                                setNewMaid({
                                  ...newMaid,
                                  specializations: newMaid.specializations.filter(s => s !== spec)
                                });
                              }
                            }}
                          />
                          <Label htmlFor={spec} className="text-sm">{spec}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddMaidDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddMaid}>
                    Add Maid
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              Showing {paginatedMaids.length > 0 ? `${getSerialNumber(0, currentPage)}-
              ${getSerialNumber(paginatedMaids.length - 1, currentPage)}` : 0} of {filteredMaids.length} maids
            </p>
          </div>
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by name, email, phone, or specialization"
              className="pl-9"
            />
          </div>
        </div>

        <div className="rounded-lg border border-border bg-background">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">S.No</TableHead>
                <TableHead>Homecare Partner</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Weekly Leave</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedMaids.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                    {filteredMaids.length === 0 ? 'No maids match your search.' : 'No maids on this page.'}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedMaids.map((maid, index) => (
                  <TableRow key={maid.id}>
                    <TableCell className="font-medium">
                      {getSerialNumber(index, currentPage)}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium">{maid.name}</p>
                        <p className="text-xs text-muted-foreground">{maid.email}</p>
                        <div className="flex flex-wrap gap-1">
                          {maid.specializations.map((spec) => (
                            <Badge key={spec} variant="outline" className="text-[11px] uppercase tracking-wide">
                              {spec}
                            </Badge>
                          ))}
                          {maid.specializations.length === 0 && (
                            <Badge variant="outline" className="text-[11px] uppercase tracking-wide">
                              No specializations
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{maid.phone}</span>
                        </div>
                        <div className="flex items-start gap-2 text-xs text-muted-foreground">
                          <MapPin className="mt-0.5 h-3 w-3" />
                          <span>{maid.address || 'Address unavailable'}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(maid.status)}>
                        {formatStatus(maid.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {maid.weeklyOffDay ? (
                        <Badge variant="outline">
                          {maid.weeklyOffDay}
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openWeeklyOffDialog(maid)}
                        >
                          Set Weekly Leave
                        </Button>
                      )}
                    </TableCell>
                    <TableCell>
                      {maid.rating > 0 ? (
                        <div className="flex items-center gap-2 text-sm">
                          <Star className="h-4 w-4 text-amber-500" />
                          <span>{maid.rating.toFixed(1)} • {maid.totalBookings} bookings</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">No ratings yet</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setQrMaid(maid);
                            setShowQrDialog(true);
                          }}
                        >
                          View QR
                        </Button>
                        {maid.rawStatus === 'PENDING_VERIFICATION' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onVerifyMaid(maid.id)}
                          >
                            Verify
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {filteredMaids.length > itemsPerPage && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </CardContent>

      <Dialog
        open={showQrDialog}
        onOpenChange={(open) => {
          setShowQrDialog(open);
          if (!open) setQrMaid(null);
        }}
      >
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Homecare Partner QR Code</DialogTitle>
            <DialogDescription>Customer can scan this QR to verify and complete the booking.</DialogDescription>
          </DialogHeader>
          <div className="grid place-items-center gap-3">
            {qrPayload && <QrCodeRenderer data={qrPayload} size={220} />}
            {qrMaid?.name && <div className="text-sm text-muted-foreground">{qrMaid.name}</div>}
            {qrPayload && (
              <Button variant="outline" size="sm" onClick={copyQrPayload}>
                Copy QR Data
              </Button>
            )}
          </div>
          <DialogFooter />
        </DialogContent>
      </Dialog>
      <Dialog open={weeklyOffDialogOpen} onOpenChange={setWeeklyOffDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Set Weekly Leave</DialogTitle>
            <DialogDescription>
              Choose the homecare partner's weekly leave day. On that day, auto-generated assignments will go to reassignment as MAID_ON_LEAVE.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Weekly Off Day</Label>
              <Select value={weeklyOffDay} onValueChange={setWeeklyOffDay}>
                <SelectTrigger>
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE">None</SelectItem>
                  <SelectItem value="MONDAY">MONDAY</SelectItem>
                  <SelectItem value="TUESDAY">TUESDAY</SelectItem>
                  <SelectItem value="WEDNESDAY">WEDNESDAY</SelectItem>
                  <SelectItem value="THURSDAY">THURSDAY</SelectItem>
                  <SelectItem value="FRIDAY">FRIDAY</SelectItem>
                  <SelectItem value="SATURDAY">SATURDAY</SelectItem>
                  <SelectItem value="SUNDAY">SUNDAY</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWeeklyOffDialogOpen(false)} disabled={savingWeeklyOff}>
              Cancel
            </Button>
            <Button onClick={saveWeeklyOff} disabled={savingWeeklyOff}>
              {savingWeeklyOff ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};