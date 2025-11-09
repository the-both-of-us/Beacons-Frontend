export interface Admin {
  id: string;
  email: string;
  name: string;
  addedBy: string;
  addedAt: string;
  isActive: boolean;
  notes: string;
}

export interface CreateAdminRequest {
  email: string;
  name?: string;
  notes?: string;
}

export interface AdminStatusResponse {
  email: string;
  name: string;
  isAdmin: boolean;
}
