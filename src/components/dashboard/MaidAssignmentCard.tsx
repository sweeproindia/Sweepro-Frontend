import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Star, Phone, MapPin, Calendar, Award, Shield, Zap } from 'lucide-react';
import { MaidAssignment } from '@/services/maidService';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

interface MaidAssignmentCardProps {
  assignment: MaidAssignment | null;
  onRefresh: () => void;
  hasSubscription?: boolean;
}

export const MaidAssignmentCard: React.FC<MaidAssignmentCardProps> = ({ assignment, onRefresh, hasSubscription = false }) => {
  const { toast } = useToast();

  if (!assignment || !assignment.maid) {
    return (
      <Card className="dashboard-card border-orange-200 bg-gradient-to-br from-orange-50 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Homecare Partner Assignment
          </CardTitle>
          <CardDescription>Your dedicated homecare partner for the month</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="relative">
            <Users className="h-16 w-16 text-orange-300 mx-auto mb-4" />
            <div className="absolute -top-2 -right-2 bg-orange-500 text-white rounded-full p-2">
              <Zap className="h-4 w-4" />
            </div>
          </div>
          <h4 className="font-semibold mb-2 text-lg">
            {hasSubscription ? 'Homecare Partner Coming Soon!' : 'Unlock Your Dedicated Homecare Partner'}
          </h4>
          <p className="text-muted-foreground text-sm mb-6">
            {hasSubscription 
              ? 'A dedicated homecare partner will be assigned to you within 24 hours of subscription activation'
              : 'Subscribe to a plan to get a dedicated homecare partner assigned to your home. Enjoy personalized, consistent cleaning service!'}
          </p>
          {!hasSubscription ? (
            <Link to="/subscription">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                <Zap className="h-4 w-4 mr-2" />
                Get Started with a Plan
              </Button>
            </Link>
          ) : (
            <Button variant="outline" onClick={onRefresh}>
              Refresh Status
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  const { maid } = assignment;

  const assignedDate = assignment.assignedAt ? new Date(assignment.assignedAt) : null;
  const assignedMonthLabel = assignedDate
    ? assignedDate.toLocaleDateString('en-US', { month: 'long' })
    : 'this month';

  const handleContactMaid = () => {
    if (maid.phone) {
      window.open(`tel:${maid.phone}`, '_blank');
    } else {
      toast({
        title: 'Contact Information',
        description: 'Homecare partner contact details are available through our support team for privacy reasons.',
        variant: 'default'
      });
    }
  };

  const handleRequestChange = () => {
    toast({
      title: 'Request Homecare Partner Change',
      description: 'Please contact support to request a homecare partner change.',
      action: (
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open('mailto:support@sweepro.com', '_blank')}
        >
          Contact Support
        </Button>
      )
    });
  };

  return (
    <Card className="dashboard-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Your Dedicated Homecare Partner
            </CardTitle>
            <CardDescription>
              Assigned for {assignedMonthLabel}
            </CardDescription>
          </div>
          <Badge variant={assignment.status === 'ACTIVE' ? 'default' : 'secondary'}>
            {assignment.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Homecare Partner Profile */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="flex-shrink-0">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                {maid.photoUrl ? (
                  <img
                    src={maid.photoUrl}
                    alt={maid.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <Users className="h-12 w-12 text-primary" />
                )}
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold">{maid.name}</h3>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <span className="font-bold">{maid.rating.toFixed(1)}</span>
                  <span className="text-sm text-muted-foreground ml-1">({maid.totalServices} services)</span>
                </div>
              </div>
              
              <p className="text-muted-foreground mb-4">
                {maid.bio || 'Professional cleaning specialist with excellent customer feedback'}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-primary" />
                  <span className="text-sm">{maid.experience} experience</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <span className="text-sm">{maid.skills.length} specialized skills</span>
                </div>
              </div>
            </div>
          </div>

          {/* Skills & Languages */}
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Specialized Skills</h4>
              <div className="flex flex-wrap gap-2">
                {maid.skills.slice(0, 5).map((skill, index) => (
                  <Badge key={index} variant="secondary">
                    {skill}
                  </Badge>
                ))}
                {maid.skills.length > 5 && (
                  <Badge variant="outline">
                    +{maid.skills.length - 5} more
                  </Badge>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Languages Spoken</h4>
              <div className="flex flex-wrap gap-2">
                {maid.languages.map((language, index) => (
                  <Badge key={index} variant="outline">
                    {language}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Assignment Details */}
          <div className="p-4 bg-muted/30 rounded-lg">
            <h4 className="font-medium mb-3">Assignment Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                {assignedDate && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Assigned On:</span>
                    <span className="font-medium">{assignedDate.toLocaleDateString()}</span>
                  </div>
                )}
                {assignment.notes && (
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span>Notes:</span>
                    <span className="font-medium">{assignment.notes}</span>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span>Service Status:</span>
                  <Badge variant="outline">
                    {assignment.status === 'ACTIVE' ? 'Active Service' : assignment.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Award className="h-4 w-4 text-muted-foreground" />
                  <span>Customer Rating:</span>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${
                          i < Math.floor(maid.rating)
                            ? 'text-yellow-500 fill-yellow-500'
                            : 'text-muted-foreground'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={handleContactMaid} className="flex-1">
              <Phone className="h-4 w-4 mr-2" />
              Contact Homecare Partner
            </Button>
            <Button variant="outline" onClick={handleRequestChange} className="flex-1">
              <Users className="h-4 w-4 mr-2" />
              Request Change
            </Button>
            <Button variant="outline" onClick={onRefresh} className="flex-1">
              Refresh Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
