export interface RecruiterData {
  verified?: boolean;
  name: string;
  companyLogo?: string;
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
