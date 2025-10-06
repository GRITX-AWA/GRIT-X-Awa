/**
 * Service for planet and star classification using habitability zones
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://grit-x-awa-1035421252747.europe-west1.run.app';

export interface PlanetAnalysisRequest {
  temperature_k?: number;
  radius_earth?: number;
  orbital_period_days?: number;
  insolation?: number;
  star_temperature_k?: number;
  star_radius_solar?: number;
}

export interface PlanetClassification {
  planet_type: string;
  radius_earth?: number;
  description: string;
  likely_composition: string;
  temperature_k?: number;
  temperature_celsius?: number;
  orbital_period_days?: number;
  orbital_class?: string;
}

export interface HabitabilityStatus {
  is_habitable: boolean;
  is_conservative_habitable: boolean;
  is_optimistic_habitable: boolean;
  temperature_class: string;
  temperature_celsius: number | null;
  zone_description: string;
}

export interface StarClassification {
  spectral_type: string;
  spectral_class_full: string;
  color: string;
  temperature_k: number;
  description: string;
  relative_brightness: string;
  typical_mass_range: string;
  radius_solar?: number;
  size_class?: string;
}

export interface PlanetAnalysisResponse {
  planet_classification: PlanetClassification;
  habitability_status: HabitabilityStatus;
  star_classification?: StarClassification;
  habitability_score?: number;
}

export interface HabitabilityZone {
  min_temp_k: number;
  max_temp_k: number;
  min_temp_c: number;
  max_temp_c: number;
  description: string;
}

export interface HabitabilityZones {
  strict: HabitabilityZone;
  conservative: HabitabilityZone;
  optimistic: HabitabilityZone;
}

class ClassificationService {
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
   * Analyze a planet's habitability and classification
   */
  async analyzePlanet(data: PlanetAnalysisRequest): Promise<PlanetAnalysisResponse> {
    return this.request<PlanetAnalysisResponse>('/api/v1/classifications/analyze', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Get information about all star types
   */
  async getStarTypes(): Promise<{ star_types: StarClassification[] }> {
    return this.request<{ star_types: StarClassification[] }>('/api/v1/classifications/star-types');
  }

  /**
   * Get information about all planet types
   */
  async getPlanetTypes(): Promise<{ planet_types: PlanetClassification[] }> {
    return this.request<{ planet_types: PlanetClassification[] }>('/api/v1/classifications/planet-types');
  }

  /**
   * Get information about habitability zones
   */
  async getHabitabilityZones(): Promise<{ zones: HabitabilityZones }> {
    return this.request<{ zones: HabitabilityZones }>('/api/v1/classifications/habitability-zones');
  }

  /**
   * Client-side classification functions for immediate feedback
   */
  classifyStarType(temp_k: number): string {
    if (!temp_k) return 'Unknown';
    
    if (temp_k >= 30000) return 'O-type';
    if (temp_k >= 10000) return 'B-type';
    if (temp_k >= 7500) return 'A-type';
    if (temp_k >= 6000) return 'F-type';
    if (temp_k >= 5200) return 'G-type';
    if (temp_k >= 3700) return 'K-type';
    if (temp_k >= 2400) return 'M-type';
    return 'L/T-type';
  }

  classifyPlanetType(radius_earth: number): string {
    if (!radius_earth) return 'Unknown';
    
    if (radius_earth < 0.5) return 'Sub-Earth';
    if (radius_earth < 1.25) return 'Earth-like';
    if (radius_earth < 2.0) return 'Super-Earth';
    if (radius_earth < 4.0) return 'Mini-Neptune';
    if (radius_earth < 10.0) return 'Neptune-like';
    return 'Jupiter-like';
  }

  getHabitabilityZone(temp_k: number): string {
    if (!temp_k) return 'Unknown';
    
    if (temp_k < 200) return 'Frozen World';
    if (temp_k < 273.15) return 'Cold';
    if (temp_k <= 373.15) return 'Habitable Zone';
    if (temp_k <= 450) return 'Warm';
    if (temp_k <= 500) return 'Very Hot';
    return 'Inferno';
  }

  isHabitable(temp_k: number): boolean {
    return temp_k >= 273.15 && temp_k <= 373.15;
  }

  isConservativeHabitable(temp_k: number): boolean {
    return temp_k >= 200 && temp_k <= 450;
  }

  /**
   * Calculate a simple habitability score (0-100)
   */
  calculateHabitabilityScore(
    temp_k?: number,
    radius_earth?: number,
    insolation?: number
  ): number {
    let score = 0;

    // Temperature (0-50 points)
    if (temp_k) {
      if (temp_k >= 273.15 && temp_k <= 373.15) {
        score += 50;
      } else if (temp_k >= 200 && temp_k <= 450) {
        const perfectRange = 50;
        if (temp_k < 273.15) {
          score += 25 - ((273.15 - temp_k) / 73.15) * 25;
        } else {
          score += 25 - ((temp_k - 373.15) / 76.85) * 25;
        }
      }
    }

    // Size (0-30 points)
    if (radius_earth) {
      if (radius_earth >= 0.5 && radius_earth <= 1.5) {
        score += 30;
      } else if (radius_earth >= 1.5 && radius_earth <= 2.5) {
        score += 20;
      } else if (radius_earth >= 2.5 && radius_earth <= 4.0) {
        score += 10;
      }
    }

    // Insolation (0-20 points)
    if (insolation) {
      if (insolation >= 0.25 && insolation <= 1.75) {
        score += 20;
      } else if (insolation >= 0.1 && insolation <= 3.0) {
        score += 10;
      }
    }

    return Math.min(score, 100);
  }
}

export const classificationService = new ClassificationService();
