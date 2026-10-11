export type Role='STUDENT'|'ADMIN';
export interface UserSummary{id:string;fullName:string;email:string;role:Role}
export interface AuthResponse{accessToken:string;refreshToken:string;accessTokenExpiresAt:string;user:UserSummary}
export interface LoginRequest{email:string;password:string}
export interface RegisterRequest{fullName:string;email:string;password:string;confirmPassword:string}
