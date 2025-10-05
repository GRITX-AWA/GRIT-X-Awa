/**
 * Service for fetching and managing analyzed exoplanets
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://grit-x-awa-1035421252747.europe-west1.run.app';

export interface AnalyzedExoplanet {
  id: number;
  job_id: string;
  row_index: number;
  dataset_type: 'kepler' | 'tess';
  predicted_class: string;
  confidence_score?: number;

  // Validation
  validated: boolean;
  validation_status?: 'pending' | 'matched' | 'new_discovery' | 'error';
  matched_with_id?: number;
  stored_in_bucket: boolean;
  bucket_path?: string;

  // Timestamps
  created_at: string;
  validated_at?: string;

  // Kepler fields
  kepid?: number;
  kepler_name?: string;
  koi_disposition?: string;
  koi_pdisposition?: string;
  koi_score?: number;
  koi_fpflag_nt?: number;
  koi_fpflag_ss?: number;
  koi_fpflag_co?: number;
  koi_fpflag_ec?: number;
  koi_period?: number;
  koi_impact?: number;
  koi_duration?: number;
  koi_depth?: number;
  koi_prad?: number;
  koi_teq?: number;
  koi_insol?: number;
  koi_model_snr?: number;
  koi_tce_plnt_num?: number;
  koi_steff?: number;
  koi_slogg?: number;
  koi_srad?: number;
  koi_kepmag?: number;

  // TESS fields
  toi?: number;
  tid?: number;
  tfopwg_disp?: string;
  rastr?: string;
  decstr?: string;
  pl_orbper?: number;
  pl_rade?: number;
  pl_trandep?: number;
  pl_trandurh?: number;
  pl_eqt?: number;
  pl_insol?: number;
  st_rad?: number;
  st_teff?: number;
  st_logg?: number;
  st_dist?: number;
  st_pmra?: number;
  st_pmdec?: number;
  st_tmag?: number;
  toi_created?: string;
  rowupdate?: string;

  // Common
  ra?: number;
  dec?: number;
}

export interface ExoplanetStats {
  total_analyzed: number;
  validated: number;
  pending_validation: number;
  matched_with_dataset: number;
  new_discoveries: number;
  class_distribution: Record<string, number>;
  dataset_type: string;
}

class ExoplanetService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = null;
      }
      throw new Error(errorData?.detail || `Request failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get all analyzed exoplanets with optional filters
   */
  async getAnalyzedExoplanets(params?: {
    dataset_type?: 'kepler' | 'tess';
    validated?: boolean;
    validation_status?: 'pending' | 'matched' | 'new_discovery' | 'error';
    limit?: number;
    offset?: number;
  }): Promise<AnalyzedExoplanet[]> {
    const queryParams = new URLSearchParams();
    if (params?.dataset_type) queryParams.set('dataset_type', params.dataset_type);
    if (params?.validated !== undefined) queryParams.set('validated', String(params.validated));
    if (params?.validation_status) queryParams.set('validation_status', params.validation_status);
    if (params?.limit) queryParams.set('limit', String(params.limit));
    if (params?.offset) queryParams.set('offset', String(params.offset));

    const endpoint = `/api/v1/exoplanets?${queryParams.toString()}`;
    return this.request<AnalyzedExoplanet[]>(endpoint);
  }

  /**
   * Get new exoplanet discoveries (not matched with existing dataset)
   */
  async getNewDiscoveries(params?: {
    dataset_type?: 'kepler' | 'tess';
    limit?: number;
  }): Promise<AnalyzedExoplanet[]> {
    const queryParams = new URLSearchParams();
    if (params?.dataset_type) queryParams.set('dataset_type', params.dataset_type);
    if (params?.limit) queryParams.set('limit', String(params.limit));

    const endpoint = `/api/v1/exoplanets/new-discoveries?${queryParams.toString()}`;
    return this.request<AnalyzedExoplanet[]>(endpoint);
  }

  /**
   * Get analyzed exoplanets by job ID
   */
  async getExoplanetsByJob(jobId: string): Promise<AnalyzedExoplanet[]> {
    return this.request<AnalyzedExoplanet[]>(`/api/v1/exoplanets/job/${jobId}`);
  }

  /**
   * Get a specific analyzed exoplanet by ID
   */
  async getExoplanetById(id: number): Promise<AnalyzedExoplanet> {
    return this.request<AnalyzedExoplanet>(`/api/v1/exoplanets/${id}`);
  }

  /**
   * Trigger validation for a job
   */
  async triggerValidation(jobId: string): Promise<{ status: string; message: string; job_id: string }> {
    return this.request(`/api/v1/exoplanets/validate/${jobId}`, {
      method: 'POST',
    });
  }

  /**
   * Get statistics for analyzed exoplanets
   */
  async getStats(datasetType?: 'kepler' | 'tess'): Promise<ExoplanetStats> {
    const queryParams = new URLSearchParams();
    if (datasetType) queryParams.set('dataset_type', datasetType);

    const endpoint = `/api/v1/exoplanets/stats/summary?${queryParams.toString()}`;
    return this.request<ExoplanetStats>(endpoint);
  }
}

export const exoplanetService = new ExoplanetService();
