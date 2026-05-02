export type UserRole = 'buyer' | 'lawyer' | 'bank' | 'developer' | 'admin';
export type RiskLevel = 'green' | 'yellow' | 'red';
export type PropertyStatus = 'pending' | 'analyzing' | 'complete' | 'archived';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  plan?: string;
  reports_used?: number;
  reports_limit?: number;
  created_at: string;
}

export interface Property {
  id: string;
  user_id: string;
  title: string;
  address: string;
  municipality?: string;
  parcel_number?: string;
  property_type?: string;
  area_sqm?: number;
  asking_price_eur?: number;
  seller_name?: string;
  developer_name?: string;
  status: PropertyStatus;
  coordinates_lat?: number;
  coordinates_lng?: number;
  notes?: string;
  doc_count?: number;
  overall_status?: RiskLevel;
  overall_score?: number;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  property_id: string;
  document_type: string;
  original_filename: string;
  file_size_bytes?: number;
  mime_type?: string;
  ocr_status: string;
  upload_date: string;
  created_at: string;
}

export interface RiskItem {
  id: string;
  report_id: string;
  category: string;
  severity: RiskLevel | 'info';
  title: string;
  description: string;
  recommendation?: string;
  is_resolved: boolean;
}

export interface RiskReport {
  id: string;
  property_id: string;
  overall_score: number;
  overall_status: RiskLevel;
  cadastral_status: RiskLevel;
  permit_status: RiskLevel;
  ownership_status: RiskLevel;
  mortgage_status: RiskLevel;
  developer_status: RiskLevel;
  ai_summary: string;
  questions_for_seller: string[];
  questions_for_notary: string[];
  missing_documents: string[];
  disclaimer: string;
  version: number;
  risk_items: RiskItem[];
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  total?: number;
}
