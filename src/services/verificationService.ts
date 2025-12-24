import { apiRequest, HttpMethod, ApiResponse } from './api';

// Verification interfaces
export interface MaidVerification {
  id: string;
  maidId: string;
  maidName: string;
  maidEmail: string;
  maidPhone: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  notes?: string;
  rejectionReason?: string;
  personalInfo: {
    experience: string;
    skills: string[];
    address?: string;
    age?: number;
    languages?: string[];
  };
  documents: {
    [key: string]: {
      uploaded: boolean;
      url?: string;
      verifiedAt?: string;
    };
  };
}

export interface VerificationApprovalData {
  adminNotes?: string;
  assignedServices: string[];
}

export interface VerificationRejectionData {
  rejectionReason: string;
  adminNotes?: string;
}

// Verification Service
class VerificationService {
  // Get all verification requests
  async getAllVerifications(): Promise<ApiResponse<MaidVerification[]>> {
    try {
      return await apiRequest<MaidVerification[]>('/admin/verifications', {
        method: HttpMethod.GET,
        requiresAuth: true
      });
    } catch (error) {
      console.error('Error fetching verifications:', error);
      throw error;
    }
  }

  // Get verification by ID
  async getVerificationById(id: string): Promise<ApiResponse<MaidVerification>> {
    try {
      return await apiRequest<MaidVerification>(`/admin/verifications/${id}`, {
        method: HttpMethod.GET,
        requiresAuth: true
      });
    } catch (error) {
      console.error('Error fetching verification:', error);
      throw error;
    }
  }

  // Approve verification
  async approveVerification(
    id: string, 
    data: VerificationApprovalData
  ): Promise<ApiResponse<MaidVerification>> {
    try {
      return await apiRequest<MaidVerification>(`/admin/verifications/${id}/approve`, {
        method: HttpMethod.POST,
        body: data,
        requiresAuth: true
      });
    } catch (error) {
      console.error('Error approving verification:', error);
      throw error;
    }
  }

  // Reject verification
  async rejectVerification(
    id: string, 
    data: VerificationRejectionData
  ): Promise<ApiResponse<MaidVerification>> {
    try {
      return await apiRequest<MaidVerification>(`/admin/verifications/${id}/reject`, {
        method: HttpMethod.POST,
        body: data,
        requiresAuth: true
      });
    } catch (error) {
      console.error('Error rejecting verification:', error);
      throw error;
    }
  }

  // Get verification statistics
  async getVerificationStats(): Promise<ApiResponse<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  }>> {
    try {
      return await apiRequest('/admin/verifications/stats', {
        method: HttpMethod.GET,
        requiresAuth: true
      });
    } catch (error) {
      console.error('Error fetching verification stats:', error);
      throw error;
    }
  }

  // Submit verification request (for maids)
  async submitVerification(data: {
    personalInfo: MaidVerification['personalInfo'];
    documents: FormData;
  }): Promise<ApiResponse<MaidVerification>> {
    try {
      // For file uploads, we need to handle FormData differently
      return await apiRequest<MaidVerification>('/maids/verification/submit', {
        method: HttpMethod.POST,
        body: data,
        requiresAuth: true,
        headers: {
          // Don't set Content-Type for FormData, let browser set it with boundary
        }
      });
    } catch (error) {
      console.error('Error submitting verification:', error);
      throw error;
    }
  }

  // Get maid's own verification status
  async getMyVerificationStatus(): Promise<ApiResponse<{
    isSubmitted: boolean;
    overallStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'NOT_SUBMITTED';
    documents: {
      aadharCard?: { uploaded: boolean; status: string; rejectionReason?: string };
      policeVerification?: { uploaded: boolean; status: string; rejectionReason?: string };
      photo?: { uploaded: boolean; status: string; rejectionReason?: string };
    };
    message?: string;
  }>> {
    try {
      return await apiRequest('/documents/maid-verification-status', {
        method: HttpMethod.GET,
        requiresAuth: true
      });
    } catch (error) {
      console.error('Error fetching verification status:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const verificationService = new VerificationService();
