export interface RecruiterData {
  verified?: boolean;
  name: string;
  companyLogo?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  company_name?: string;
  title?: string;
  phone?: string;
  timezone?: string;
  language?: string;
  website?: string;
  industry?: string;
  company_size?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  is_profile_complete?: boolean;
  profileProgress?: number;
  updateProfileProgress?: (progress: number) => Promise<void>;
  updateUserProfile?: (data: any) => Promise<void>;
}

export interface RecruiterRegistrationData {
  name: string;
  email: string;
  password: string;
  phone: string;
  designation: string;
  company_name: string;
  industry: string;
  country: string;
  state: string;
  city: string;
  zip: string;
  address: string;
}

export interface RecruiterLoginData {
  email: string;
  password: string;
}
