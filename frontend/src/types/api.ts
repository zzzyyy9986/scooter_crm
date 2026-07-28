export type ScooterStatus = 'available' | 'in_use' | 'maintenance' | 'offline';
export type RentalStatus = 'active' | 'completed';

export interface ScooterModel {
  id: number;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export interface Scooter {
  id: number;
  number: string;
  scooter_model_id: number | null;
  model: string | null;
  scooter_model?: ScooterModel;
  status: ScooterStatus;
  battery_level: number;
  latitude: number;
  longitude: number;
  created_at: string;
  updated_at: string;
}

export interface ScooterFormData {
  number: string;
  scooter_model_id: number | '';
  status: ScooterStatus;
  battery_level: number;
  latitude: number;
  longitude: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface Rental {
  id: number;
  scooter_id: number;
  user_id: number;
  started_at: string;
  ended_at: string | null;
  status: RentalStatus;
  scooter?: Scooter;
  user?: User;
}

export interface RentalFormData {
  scooter_id: number;
  user_id: number;
}

export interface Analytics {
  scooters_by_status: Record<ScooterStatus, number>;
  active_rentals_count: number;
  average_battery_level: number;
  total_scooters: number;
}

export interface ApiErrorBody {
  message?: string;
  errors?: Record<string, string[]>;
}
