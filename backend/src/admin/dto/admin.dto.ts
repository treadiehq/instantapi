export class AdminStatsDto {
  totalEndpoints: number;
  authenticatedEndpoints: number;
  unauthenticatedEndpoints: number;
  totalUsers: number;
  endpointsCreatedToday: number;
  endpointsCreatedThisWeek: number;
  javascriptCount: number;
  pythonCount: number;
  expiringSoon: number; // Expiring in next 24 hours
}

export class AdminEndpointDto {
  id: string;
  language: string;
  kind: string;
  code: string;
  name: string | null;
  description: string | null;
  organizationId: string | null;
  userEmail: string | null;
  createdAt: Date;
  expiresAt: Date;
  ttlMinutes: number;
  ttlHours: number; // For backward compatibility
}

export class AdminEndpointsQueryDto {
  page?: number;
  limit?: number;
  authType?: 'authenticated' | 'unauthenticated' | 'all';
  language?: 'javascript' | 'python' | 'all';
  search?: string; // Search in code, name, or email
  sortBy?: 'createdAt' | 'expiresAt';
  sortOrder?: 'asc' | 'desc';
}

export class AdminEndpointsResponseDto {
  endpoints: AdminEndpointDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

