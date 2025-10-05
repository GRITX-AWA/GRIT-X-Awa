const API_BASE_URL = 'http://localhost:8000';

export interface SpaceData {
  id: number;
  // Kepler fields
  kepid?: number;
  kepoi_name?: string;
  kepler_name?: string;
  koi_disposition?: string;
  koi_pdisposition?: string;
  koi_score?: number;
  koi_fpflag_nt?: number;
  koi_fpflag_ss?: number;
  koi_fpflag_co?: number;
  koi_fpflag_ec?: number;
  koi_period?: number;
  koi_time0bk?: number;
  koi_impact?: number;
  koi_duration?: number;
  koi_depth?: number;
  koi_prad?: number;
  koi_teq?: number;
  koi_insol?: number;
  koi_model_snr?: number;
  koi_tce_plnt_num?: number;
  koi_tce_delivname?: string;
  koi_steff?: number;
  koi_slogg?: number;
  koi_srad?: number;
  koi_sma?: number;
  koi_incl?: number;
  koi_kepmag?: number;
  ra?: number;
  dec?: number;
  // TESS fields
  toi?: number;
  tid?: number;
  tfopwg_disp?: string;
  rastr?: string;
  decstr?: string;
  st_teff?: number;
  st_logg?: number;
  st_rad?: number;
  st_mass?: number;
  st_dist?: number;
  sy_dist?: number;
  st_pmra?: number;
  st_pmdec?: number;
  st_tmag?: number;
  pl_orbper?: number;
  pl_rade?: number;
  pl_trandep?: number;
  pl_trandurh?: number;
  pl_eqt?: number;
  pl_insol?: number;
  pl_tranmid?: number;
  toi_created?: string;
  rowupdate?: string;
  // Common
  description?: string;
}

export interface PredictionRequest {
  input: number[][];
}

export interface PredictionResponse {
  prediction: any;
}

export interface ModelInfo {
  framework: string;
  architecture: string;
  input_shape: number[];
  optimizer: string;
}

class ApiService {
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
      const error: any = new Error(`API request failed: ${response.statusText}`);
      error.status = response.status;
      error.data = errorData;
      throw error;
    }

    return response.json();
  }

  async getDatasets(): Promise<SpaceData[]> {
    return this.request<SpaceData[]>('/data/');
  }

  async createDataset(data: Omit<SpaceData, 'id'>): Promise<SpaceData> {
    return this.request<SpaceData>('/data/data', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getPredictions(data: PredictionRequest): Promise<PredictionResponse> {
    return this.request<PredictionResponse>('/predictions/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getModelInfo(): Promise<ModelInfo> {
    return this.request<ModelInfo>('/models/');
  }

  async runDeepAnalysis(objectId: string): Promise<any> {
    return this.request<any>(`/analysis/deep/${objectId}`);
  }

  /**
   * Upload CSV file and get ML predictions
   * @param file - CSV file to upload
   * @returns Upload response with predictions
   */
  async uploadAndPredict(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const url = `${API_BASE_URL}/api/v1/upload/csv`;
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      // Don't set Content-Type header - browser will set it with boundary
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = null;
      }
      const error: any = new Error(errorData?.detail || `Upload failed: ${response.statusText}`);
      error.status = response.status;
      error.data = errorData;
      throw error;
    }

    return response.json();
  }

  /**
   * Get predictions by job ID
   * @param jobId - Unique job identifier
   */
  async getPredictionsByJobId(jobId: string): Promise<PredictionJobResponse> {
    return this.request<PredictionJobResponse>(`/api/v1/predictions/job/${jobId}`);
  }

  /**
   * Get recent predictions
   * @param limit - Maximum number of predictions to return
   */
  async getRecentPredictions(limit: number = 50): Promise<PredictionResult[]> {
    return this.request<PredictionResult[]>(`/api/v1/predictions/recent?limit=${limit}`);
  }
}

export const apiService = new ApiService();

// ===== Type Definitions for Upload Feature =====

export interface UploadResponse {
  success: boolean;
  message: string;
  job_id: string;
  dataset_type: string;
  file_url: string;
  total_predictions: number;
  predictions: PredictionResult[];
}

export interface PredictionResult {
  job_id: string;
  row_index: number;
  dataset_type: string;
  predicted_class: string;
  confidence: Record<string, number>;
  created_at: string;
}

export interface PredictionJobResponse {
  job_id: string;
  dataset_type: string;
  created_at: string;
  predictions: PredictionResult[];
}
