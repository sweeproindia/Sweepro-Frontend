import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, Check, Info, Home, Calendar, Layers } from 'lucide-react';

interface Service {
  id: string;
  name: string;
}

interface PropertyPricing {
  id: string;
  planId: string;
  propertyType: string;
  bhkType: string;
  squareFeet: number;
  sqftLabel: string;
  pricing: Record<string, number>;
  isActive: boolean;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  finalPrice: number;
  discountPercent: number;
  duration: number;
  sessionsPerWeek: number;
  sessionsPerMonth: number;
  isActive: boolean;
  isPopular: boolean;
  service?: Service;
  hasBufferSystem?: boolean;
  bufferDaysAllowed?: number;
  propertyPricing?: PropertyPricing[];
}

interface AdminPlansSectionProps {
  plans: SubscriptionPlan[];
}

export const AdminPlansSection: React.FC<AdminPlansSectionProps> = ({ plans }) => {
  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString('en-IN')}`;
  };

  const getPlanFeatures = (plan: SubscriptionPlan) => {
    const features = [
      `${plan.sessionsPerWeek} sessions per week`,
      `${plan.sessionsPerMonth} sessions per month`,
      plan.service?.name || 'Service included',
      'Professional cleaning staff',
    ];

    if (plan.hasBufferSystem && plan.bufferDaysAllowed > 0) {
      features.push(`${plan.bufferDaysAllowed} buffer days/month`);
    }

    return features;
  };

  const getGroupedPricing = (plan: SubscriptionPlan) => {
    if (!plan.propertyPricing || !Array.isArray(plan.propertyPricing)) {
      return null;
    }

    const grouped: Record<string, Record<string, PropertyPricing[]>> = {};

    plan.propertyPricing.forEach((pricing) => {
      if (!pricing.isActive) return;

      const propertyType = pricing.propertyType || 'apartment';
      const bhkType = pricing.bhkType?.toLowerCase() || '2bhk';

      if (!grouped[propertyType]) {
        grouped[propertyType] = {};
      }
      if (!grouped[propertyType][bhkType]) {
        grouped[propertyType][bhkType] = [];
      }
      grouped[propertyType][bhkType].push(pricing);
    });

    // Sort square feet within each group
    Object.keys(grouped).forEach(propertyType => {
      Object.keys(grouped[propertyType]).forEach(bhkType => {
        grouped[propertyType][bhkType].sort((a, b) => a.squareFeet - b.squareFeet);
      });
    });

    return grouped;
  };

  const getDurationLabel = (durationId: string) => {
    const labels: Record<string, string> = {
      '1month': '1 Month',
      '3month': '3 Months',
      '6month': '6 Months'
    };
    return labels[durationId] || durationId;
  };

  const getBhkLabel = (bhkType: string) => {
    const labels: Record<string, string> = {
      '2bhk': '2 BHK',
      '3bhk': '3 BHK',
      '4bhk': '4 BHK'
    };
    return labels[bhkType.toLowerCase()] || bhkType.toUpperCase();
  };

  const getPropertyTypeLabel = (propertyType: string) => {
    const labels: Record<string, string> = {
      'apartment': 'Apartment',
      'bungalow': 'Bungalow'
    };
    return labels[propertyType.toLowerCase()] || propertyType;
  };

  return (
    <Card className="dashboard-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          Subscription Plans & Pricing
        </CardTitle>
        <CardDescription>
          View current subscription plans with detailed property-based pricing. Contact developers to modify plans.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {plans.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No subscription plans found</p>
          </div>
        ) : (
          <div className="space-y-8">
            {plans.map((plan) => {
              const groupedPricing = getGroupedPricing(plan);

              return (
                <Card key={plan.id} className={`border-2 ${plan.isPopular ? 'border-primary' : 'border-border'}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-2xl flex items-center gap-3">
                          {plan.name}
                          {plan.isPopular && (
                            <Badge className="bg-primary">Popular</Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="text-sm mt-2">
                          {plan.description || 'No description available'}
                        </CardDescription>
                      </div>
                      <Badge variant={plan.isActive ? 'default' : 'secondary'}>
                        {plan.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Basic Plan Info */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Sessions/Week</p>
                        <p className="text-2xl font-bold text-primary">{plan.sessionsPerWeek}</p>
                      </div>
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Sessions/Month</p>
                        <p className="text-2xl font-bold text-primary">{plan.sessionsPerMonth}</p>
                      </div>
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Duration</p>
                        <p className="text-2xl font-bold text-primary">{plan.duration} mo</p>
                      </div>
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Buffer Days</p>
                        <p className="text-2xl font-bold text-primary">
                          {plan.hasBufferSystem ? plan.bufferDaysAllowed || 0 : 'None'}
                        </p>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-600" />
                        Plan Features
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {getPlanFeatures(plan).map((feature, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                            <span className="text-muted-foreground">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Detailed Property Pricing */}
                    {groupedPricing && Object.keys(groupedPricing).length > 0 && (
                      <div className="space-y-4">
                        <h4 className="font-semibold text-sm flex items-center gap-2">
                          <Home className="h-4 w-4 text-primary" />
                          Property-Based Pricing
                        </h4>
                        
                        {Object.entries(groupedPricing).map(([propertyType, bhkGroups]) => (
                          <div key={propertyType} className="border rounded-lg overflow-hidden">
                            <div className="bg-primary/10 px-4 py-2">
                              <p className="font-semibold text-primary">{getPropertyTypeLabel(propertyType)}</p>
                            </div>
                            
                            {Object.entries(bhkGroups).map(([bhkType, pricingArray]) => (
                              <div key={bhkType} className="p-4 border-t">
                                <div className="flex items-center gap-2 mb-3">
                                  <Layers className="h-4 w-4 text-muted-foreground" />
                                  <p className="font-semibold">{getBhkLabel(bhkType)}</p>
                                </div>
                                
                                <div className="overflow-x-auto">
                                  <table className="w-full text-sm">
                                    <thead>
                                      <tr className="border-b">
                                        <th className="text-left py-2 px-3 font-medium">Size Range</th>
                                        <th className="text-right py-2 px-3 font-medium">1 Month</th>
                                        <th className="text-right py-2 px-3 font-medium">3 Months</th>
                                        <th className="text-right py-2 px-3 font-medium">6 Months</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {pricingArray.map((pricing, idx) => (
                                        <tr key={idx} className="border-b last:border-0">
                                          <td className="py-2 px-3">
                                            {pricing.sqftLabel || `${pricing.squareFeet} sq ft`}
                                          </td>
                                          <td className="text-right py-2 px-3 font-medium">
                                            {formatPrice(pricing.pricing['1month'] || 0)}
                                          </td>
                                          <td className="text-right py-2 px-3 font-medium">
                                            {formatPrice(pricing.pricing['3month'] || 0)}
                                          </td>
                                          <td className="text-right py-2 px-3 font-medium">
                                            {formatPrice(pricing.pricing['6month'] || 0)}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Info Note */}
                    <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 p-3 rounded">
                      <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
                      <span>
                        Contact development team to modify plan details or pricing structure. 
                        All pricing is calculated based on property type, BHK configuration, and square footage.
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
