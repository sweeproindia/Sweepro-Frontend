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
      return await apiRequest<MaidVerification[]>('/documents/admin-verification-data', {
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
      return await apiRequest<MaidVerification>(`/documents/review/${id}`, {
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
      return await apiRequest<MaidVerification>(`/documents/verification/${id}/approve`, {
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
      return await apiRequest<MaidVerification>(`/documents/verification/${id}/reject`, {
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
      return await apiRequest('/documents/verification-stats', {
        method: HttpMethod.GET,
        requiresAuth: true
      });
    } catch (error) {
      console.error('Error fetching verification stats:', error);
      throw error;
    }
  }

  // Submit verification request (for maids)
  async submitVerification(
    data:
      | {
          personalInfo: MaidVerification['personalInfo'];
          documents: FormData;
        }
      | FormData
  ): Promise<ApiResponse<MaidVerification>> {
    try {
      const formData = data instanceof FormData ? data : data.documents;
      return await apiRequest<MaidVerification>('/documents/upload-verification', {
        method: HttpMethod.POST,
        body: formData,
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
