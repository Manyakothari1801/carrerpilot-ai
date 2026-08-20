export type Role = 'STUDENT' | 'ADMIN'
export interface UserSummary { id: string; fullName: string; email: string; role: Role }
export interface AuthResponse { accessToken: string; refreshToken: string; accessTokenExpiresAt: string; user: UserSummary }
