import { useState, useEffect } from 'react';
import { DashboardNavbar } from '@/components/dashboard/DashboardNavbar';
import { AdminDashboardSidebar } from './AdminDashboardSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, Search, Filter, MessageSquare, TrendingUp, Users, Calendar, Loader2, Send, BarChart3, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import FeedbackService, { Feedback } from '@/services/feedbackService';
import { useUser } from '@/contexts/UserContext';
import MaidPerformanceOverview from '@/components/feedback/MaidPerformanceOverview';
import FeedbackActionPanel from '@/components/feedback/FeedbackActionPanel';
import AuditTrailModal from '@/components/feedback/AuditTrailModal';

export default function AdminFeedbackPage() {
  const { user } = useUser();
  const { toast } = useToast();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedMaidId, setSelectedMaidId] = useState<string>('');
  const [maidsList, setMaidsList] = useState<any[]>([]);
  const [maidAnalytics, setMaidAnalytics] = useState<any>(null);
  const [selectedFeedbackForAction, setSelectedFeedbackForAction] = useState<any>(null);
  const [auditTrail, setAuditTrail] = useState<any[]>([]);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [loadingAudit, setLoadingAudit] = useState(false);
  const [filters, setFilters] = useState({
    rating: '',
    maidId: '',
    customerId: '',
    search: '',
    status: ''
  });
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [adminResponse, setAdminResponse] = useState('');
  const [submittingResponse, setSubmittingResponse] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [disputedFeedback, setDisputedFeedback] = useState<any[]>([]);
  const [loadingDisputed, setLoadingDisputed] = useState(false);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchFeedbacks();
      fetchStats();
      fetchMaidsList();
      fetchDisputedFeedback();
    }
  }, [user, page, filters]);

  const fetchMaidsList = async () => {
    try {
      const response = await fetch('/api/maids/list', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setMaidsList(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching maids list:', error);
    }
  };

  const fetchDisputedFeedback = async () => {
    setLoadingDisputed(true);
    try {
      const response = await fetch('/api/feedback/disputed?limit=10', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setDisputedFeedback(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching disputed feedback:', error);
    } finally {
      setLoadingDisputed(false);
    }
  };

  const fetchMaidAnalytics = async (maidId: string) => {
    try {
      const response = await fetch(`/api/feedback/maid/${maidId}/analytics`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setMaidAnalytics(data.data);
      }
    } catch (error) {
      console.error('Error fetching maid analytics:', error);
    }
  };

  const fetchAuditTrail = async (feedbackId: string) => {
    setLoadingAudit(true);
    try {
      const response = await fetch(`/api/feedback/${feedbackId}/audit-trail`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setAuditTrail(data.data || []);
        setShowAuditModal(true);
      }
    } catch (error) {
      console.error('Error fetching audit trail:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch audit trail',
        variant: 'destructive'
      });
    } finally {
      setLoadingAudit(false);
    }
  };

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const response = await FeedbackService.getAllFeedback({
        page,
        limit: 20,
        rating: filters.rating && filters.rating !== 'all-ratings' ? parseInt(filters.rating) : undefined,
        maidId: filters.maidId || undefined,
        customerId: filters.customerId || undefined,
        status: filters.status && filters.status !== 'all-statuses' ? filters.status : undefined
      });

      if (response.success && response.data) {
        setFeedbacks(response.data.data || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
      }
    } catch (error: any) {
      console.error('Error fetching feedbacks:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch feedbacks',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await FeedbackService.getFeedbackStats(
        filters.maidId || undefined
      );

      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleMaidSelect = (maidId: string) => {
    setSelectedMaidId(maidId);
    if (maidId) {
      fetchMaidAnalytics(maidId);
    } else {
      setMaidAnalytics(null);
    }
  };

  const handleRecalculateRating = async () => {
    if (!selectedMaidId) return;
    try {
      const response = await fetch(`/api/feedback/maid/${selectedMaidId}/recalculate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Maid rating recalculated successfully'
        });
        fetchMaidAnalytics(selectedMaidId);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to recalculate rating',
        variant: 'destructive'
      });
    }
  };

  const handleActionComplete = async () => {
    if (selectedMaidId) {
      await fetchMaidAnalytics(selectedMaidId);
    }
    await fetchFeedbacks();
    await fetchDisputedFeedback();
    toast({
      title: 'Success',
      description: 'Action completed successfully'
    });
  };

  const handleSubmitAdminResponse = async () => {
    if (!selectedFeedback || !adminResponse.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a response',
        variant: 'destructive'
      });
      return;
    }

    setSubmittingResponse(true);
    try {
      const response = await FeedbackService.updateAdminResponse(
        selectedFeedback.id,
        adminResponse
      );

      if (response.success) {
        toast({
          title: 'Success',
          description: 'Admin response updated successfully',
        });
        setIsDialogOpen(false);
        fetchFeedbacks();
        fetchStats();
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update response',
        variant: 'destructive'
      });
    } finally {
      setSubmittingResponse(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-sm font-medium">{rating}/5</span>
      </div>
    );
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'bg-green-100 text-green-800';
    if (rating >= 3) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  if (user?.role !== 'ADMIN') {
    return (
      <div className="h-screen flex flex-col overflow-hidden bg-background">
        <DashboardNavbar />
        <div className="flex flex-1 overflow-hidden">
          <div className="hidden md:block">
            <AdminDashboardSidebar />
          </div>
          <main className="flex-1 relative overflow-y-auto focus:outline-none">
            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">Access denied. Admin privileges required.</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      {/* Top navigation */}
      <DashboardNavbar 
        onMobileMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
      />

      {/* Main content area with sidebar and page content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Desktop (always visible) */}
        <div className="hidden md:block">
          <AdminDashboardSidebar />
        </div>
        
        {/* Mobile Sidebar (controlled by navbar hamburger) */}
        {isMobileSidebarOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            
            {/* Sidebar */}
            <div className="fixed inset-y-0 left-0 z-50 md:hidden">
              <AdminDashboardSidebar open={true} setOpen={setIsMobileSidebarOpen} forceOpen={true} />
            </div>
          </>
        )}

        {/* Page content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="space-y-6">
                {/* Header */}
                <div>
                  <h1 className="text-3xl font-bold">Feedback & Rating Management</h1>
                  <p className="text-muted-foreground mt-2">
                    Comprehensive admin dashboard for feedback management, maid performance tracking, and dispute resolution
                  </p>
                </div>

                {/* Tabs Navigation */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="disputed" className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Disputed
            </TabsTrigger>
            <TabsTrigger value="feedback" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              All Feedback
            </TabsTrigger>
          </TabsList>

        {/* Stats Cards */}
        {stats && (
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Feedback</p>
                      <p className="text-2xl font-bold">{stats.totalFeedback}</p>
                    </div>
                    <MessageSquare className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Average Rating</p>
                      <p className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">With Comments</p>
                      <p className="text-2xl font-bold">{stats.feedbacksWithComments}</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Without Comments</p>
                      <p className="text-2xl font-bold">{stats.feedbacksWithoutComments}</p>
                    </div>
                    <Calendar className="h-8 w-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}

        {/* ANALYTICS TAB */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Maid Performance Analytics</CardTitle>
              <CardDescription>
                Select a maid to view comprehensive performance metrics and analytics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Maid Selector */}
              <div className="space-y-3">
                <Label htmlFor="maid-select">Select Maid</Label>
                <Select value={selectedMaidId} onValueChange={handleMaidSelect}>
                  <SelectTrigger id="maid-select">
                    <SelectValue placeholder="Choose a maid to view analytics..." />
                  </SelectTrigger>
                  <SelectContent>
                    {maidsList.map((maid: any) => (
                      <SelectItem key={maid.id} value={maid.id}>
                        {maid.name} - {maid.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Performance Overview */}
              {selectedMaidId && maidAnalytics && (
                <div className="space-y-6">
                  <MaidPerformanceOverview
                    maidId={selectedMaidId}
                    maidName={maidAnalytics.maidName}
                    analytics={maidAnalytics}
                    onRecalculate={handleRecalculateRating}
                  />

                  {/* Recent Feedback for Selected Maid */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Feedback</CardTitle>
                      <CardDescription>Latest 10 feedback entries for {maidAnalytics.maidName}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {maidAnalytics.recentFeedback?.map((feedback: any) => (
                          <div key={feedback.id} className="flex items-start justify-between p-3 border rounded-lg">
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                {renderStars(feedback.overallRating)}
                                <span className="text-xs text-muted-foreground">
                                  {new Date(feedback.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                By: {feedback.customer?.name}
                              </p>
                              {feedback.comment && (
                                <p className="text-sm mt-2">{feedback.comment}</p>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedFeedbackForAction(feedback)}
                            >
                              Actions
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Feedback Action Panel */}
                  {selectedFeedbackForAction && (
                    <FeedbackActionPanel
                      feedbackId={selectedFeedbackForAction.id}
                      currentStatus={selectedFeedbackForAction.status}
                      currentWeight={selectedFeedbackForAction.weight}
                      onStatusChange={handleActionComplete}
                      onWeightAdjust={handleActionComplete}
                      onNoteAdd={handleActionComplete}
                      onRecalculate={handleActionComplete}
                    />
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* DISPUTED FEEDBACK TAB */}
        <TabsContent value="disputed" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Disputed Feedback</CardTitle>
              <CardDescription>
                Feedback entries marked as disputed requiring admin review and resolution
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingDisputed ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : disputedFeedback.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No disputed feedback</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {disputedFeedback.map((feedback: any) => (
                    <Card key={feedback.id} className="bg-yellow-50 border-yellow-200">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className="bg-yellow-200 text-yellow-900">DISPUTED</Badge>
                              <Badge className={getRatingColor(feedback.overallRating)}>
                                {renderStars(feedback.overallRating)}
                              </Badge>
                            </div>
                            <p className="text-sm font-medium">
                              Maid: {feedback.booking?.maid?.name} | Customer: {feedback.customer?.name}
                            </p>
                            {feedback.comment && (
                              <p className="text-sm text-muted-foreground mt-2">
                                <strong>Feedback:</strong> {feedback.comment}
                              </p>
                            )}
                            {feedback.disputeReason && (
                              <p className="text-sm text-yellow-900 mt-2 bg-yellow-100 p-2 rounded">
                                <strong>Dispute Reason:</strong> {feedback.disputeReason}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => fetchAuditTrail(feedback.id)}
                            >
                              View Audit
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => setSelectedFeedbackForAction(feedback)}
                            >
                              Resolve
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ALL FEEDBACK TAB - Original Filters */}
        <TabsContent value="feedback" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={filters.status}
                  onValueChange={(value) => setFilters({ ...filters, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-statuses">All Statuses</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="DISPUTED">Disputed</SelectItem>
                    <SelectItem value="RESOLVED">Resolved</SelectItem>
                    <SelectItem value="REMOVED">Removed</SelectItem>
                    <SelectItem value="INVALID">Invalid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Rating</Label>
                <Select
                  value={filters.rating}
                  onValueChange={(value) => setFilters({ ...filters, rating: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Ratings" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-ratings">All Ratings</SelectItem>
                    <SelectItem value="5">5 Stars</SelectItem>
                    <SelectItem value="4">4 Stars</SelectItem>
                    <SelectItem value="3">3 Stars</SelectItem>
                    <SelectItem value="2">2 Stars</SelectItem>
                    <SelectItem value="1">1 Star</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Maid ID</Label>
                <Input
                  placeholder="Filter by Maid ID"
                  value={filters.maidId}
                  onChange={(e) => setFilters({ ...filters, maidId: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Customer ID</Label>
                <Input
                  placeholder="Filter by Customer ID"
                  value={filters.customerId}
                  onChange={(e) => setFilters({ ...filters, customerId: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Search</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search feedback..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="pl-8"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feedback List */}
        <Card>
          <CardHeader>
            <CardTitle>All Feedback</CardTitle>
            <CardDescription>
              {stats && `${stats.totalFeedback} total feedback entries`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : feedbacks.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No feedback found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {feedbacks.map((feedback) => (
                  <Card key={feedback.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-start gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge className={getRatingColor(feedback.overallRating)}>
                                  {renderStars(feedback.overallRating)}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                  {new Date(feedback.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="space-y-1 text-sm">
                                <p>
                                  <span className="font-medium">Customer:</span>{' '}
                                  {feedback.customer?.name || 'Unknown'}
                                </p>
                                <p>
                                  <span className="font-medium">Maid:</span>{' '}
                                  {feedback.booking?.maid?.name || 'N/A'}
                                </p>
                                <p>
                                  <span className="font-medium">Service:</span>{' '}
                                  {feedback.booking?.service?.name || 'N/A'}
                                </p>
                              </div>
                              {feedback.comment && (
                                <div className="mt-2 p-3 bg-muted rounded-lg">
                                  <p className="text-sm">{feedback.comment}</p>
                                </div>
                              )}
                              {feedback.adminResponse && (
                                <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                                  <p className="text-xs font-medium text-blue-800 mb-1">
                                    Admin Response:
                                  </p>
                                  <p className="text-sm text-blue-900">{feedback.adminResponse}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewFeedback(feedback)}
                        >
                          {feedback.adminResponse ? 'Update Response' : 'Add Response'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <Button
                  variant="outline"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        </TabsContent>

        {/* Feedback Detail Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Feedback Details</DialogTitle>
              <DialogDescription>
                View feedback and add admin response
              </DialogDescription>
            </DialogHeader>
            {selectedFeedback && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Overall Rating</Label>
                  {renderStars(selectedFeedback.overallRating)}
                </div>
                {selectedFeedback.qualityRating && (
                  <div className="space-y-2">
                    <Label>Quality Rating</Label>
                    {renderStars(selectedFeedback.qualityRating)}
                  </div>
                )}
                {selectedFeedback.punctualityRating && (
                  <div className="space-y-2">
                    <Label>Punctuality Rating</Label>
                    {renderStars(selectedFeedback.punctualityRating)}
                  </div>
                )}
                {selectedFeedback.behaviorRating && (
                  <div className="space-y-2">
                    <Label>Behavior Rating</Label>
                    {renderStars(selectedFeedback.behaviorRating)}
                  </div>
                )}
                {selectedFeedback.comment && (
                  <div className="space-y-2">
                    <Label>Comment</Label>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm">{selectedFeedback.comment}</p>
                    </div>
                  </div>
                )}
                {selectedFeedback.improvements && (
                  <div className="space-y-2">
                    <Label>Suggestions for Improvement</Label>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm">{selectedFeedback.improvements}</p>
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Admin Response</Label>
                  <Textarea
                    value={adminResponse}
                    onChange={(e) => setAdminResponse(e.target.value)}
                    placeholder="Enter your response to this feedback..."
                    rows={4}
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmitAdminResponse}
                    disabled={submittingResponse || !adminResponse.trim()}
                    className="flex-1"
                  >
                    {submittingResponse ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        {selectedFeedback.adminResponse ? 'Update Response' : 'Submit Response'}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Audit Trail Modal */}
        <AuditTrailModal
          open={showAuditModal}
          onOpenChange={setShowAuditModal}
          auditEntries={auditTrail}
          isLoading={loadingAudit}
        />
                </Tabs>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
