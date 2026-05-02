export type UserRole = 'buyer' | 'lawyer' | 'bank' | 'developer' | 'admin';
export type PropertyStatus = 'pending' | 'analyzing' | 'complete' | 'archived';
export type RiskLevel = 'green' | 'yellow' | 'red';
export type DocumentType =
  | 'cadastral_extract'
  | 'construction_permit'
  | 'ownership_contract'
  | 'mortgage_certificate'
  | 'id_document'
  | 'use_permit'
  | 'property_tax'
  | 'court_order'
  | 'other';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  consent_gdpr: boolean;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
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
  created_at: Date;
  updated_at: Date;
}

export interface Document {
  id: string;
  property_id: string;
  user_id: string;
  document_type: DocumentType;
  original_filename: string;
  stored_filename: string;
  file_path: string;
  file_size_bytes?: number;
  mime_type?: string;
  encryption_iv?: string;
  is_encrypted: boolean;
  ocr_text?: string;
  ocr_status: 'pending' | 'processing' | 'complete' | 'failed';
  extracted_data?: Record<string, unknown>;
  upload_date: Date;
  created_at: Date;
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
  created_at: Date;
  updated_at: Date;
}

export interface RiskItem {
  id: string;
  report_id: string;
  category: string;
  severity: RiskLevel | 'info';
  title: string;
  description: string;
  recommendation?: string;
  source_document_id?: string;
  is_resolved: boolean;
  created_at: Date;
}

export interface AuthPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}
