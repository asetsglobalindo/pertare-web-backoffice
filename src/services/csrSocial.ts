import ApiService from "@/lib/ApiService";
import { debugRequest, debugResponse, debugError } from "@/lib/debugApi";

export interface CSRSocialProgram {
  _id: string;
  title: {
    id: string;
    en: string;
  };
  description: {
    id: string;
    en: string;
  };
  images: Array<{
    id: string;
    en: string;
  }>;
  active_status: boolean;
  order: number;
  organization_id: string;
  created_at: string;
  created_by: string;
  updated_at?: string;
  updated_by?: string;
  meta_title?: {
    id: string;
    en: string;
  };
  meta_description?: {
    id: string;
    en: string;
  };
}

export interface CSRSocialCreateRequest {
  title: {
    id: string;
    en: string;
  };
  description: {
    id: string;
    en: string;
  };
  images?: Array<{
    id: string;
    en: string;
  }>;
  active_status?: boolean;
  order?: number;
  meta_title?: {
    id: string;
    en: string;
  };
  meta_description?: {
    id: string;
    en: string;
  };
}

export interface CSRSocialGetAllParams {
  page?: number;
  limit?: number;
  active_status?: boolean;
  query?: string;
  show_single_language?: string;
}

const CSRSocialServices = {
  // Get all CSR social programs (admin)
  getAll: async (params: CSRSocialGetAllParams = {}) => {
    try {
      debugRequest('GET', '/csr-social/admin', params);
      const response = await ApiService.secure().get("/csr-social/admin", params);
      debugResponse('/csr-social/admin', response);
      return response;
    } catch (error) {
      debugError('/csr-social/admin', error);
      throw error;
    }
  },

  // Get single CSR social program
  getById: async (id: string) => {
    try {
      debugRequest('GET', `/csr-social/admin/${id}`);
      const response = await ApiService.secure().get(`/csr-social/admin/${id}`);
      debugResponse(`/csr-social/admin/${id}`, response);
      return response;
    } catch (error) {
      debugError(`/csr-social/admin/${id}`, error);
      throw error;
    }
  },

  // Create new CSR social program
  create: async (data: CSRSocialCreateRequest) => {
    try {
      debugRequest('POST', '/csr-social/admin', undefined, data);
      const response = await ApiService.secure().post("/csr-social/admin", data);
      debugResponse('/csr-social/admin', response);
      return response;
    } catch (error) {
      debugError('/csr-social/admin', error);
      throw error;
    }
  },

  // Update CSR social program
  update: async (id: string, data: Partial<CSRSocialCreateRequest>) => {
    try {
      debugRequest('PUT', `/csr-social/admin/${id}`, undefined, data);
      const response = await ApiService.secure().put(`/csr-social/admin/${id}`, data);
      debugResponse(`/csr-social/admin/${id}`, response);
      return response;
    } catch (error) {
      debugError(`/csr-social/admin/${id}`, error);
      throw error;
    }
  },

  // Delete CSR social program
  delete: async (id: string) => {
    try {
      debugRequest('DELETE', `/csr-social/admin/${id}`);
      const response = await ApiService.secure().delete(`/csr-social/admin/${id}`);
      debugResponse(`/csr-social/admin/${id}`, response);
      return response;
    } catch (error) {
      debugError(`/csr-social/admin/${id}`, error);
      throw error;
    }
  },

  // Toggle status
  toggleStatus: async (id: string, active_status: boolean) => {
    try {
      const data = { active_status };
      debugRequest('PUT', `/csr-social/admin/${id}`, undefined, data);
      const response = await ApiService.secure().put(`/csr-social/admin/${id}`, data);
      debugResponse(`/csr-social/admin/${id}`, response);
      return response;
    } catch (error) {
      debugError(`/csr-social/admin/${id}`, error);
      throw error;
    }
  },

  // Get public CSR social programs (for frontend)
  getPublic: async (params: CSRSocialGetAllParams = {}) => {
    try {
      debugRequest('GET', '/csr-social', params);
      const response = await ApiService.get("/csr-social", params);
      debugResponse('/csr-social', response);
      return response;
    } catch (error) {
      debugError('/csr-social', error);
      throw error;
    }
  }
};

export default CSRSocialServices;