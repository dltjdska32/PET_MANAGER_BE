export interface ChatAccessTokenPayload {
    sub: string | number;
    userName?: string;
    userEmail?: string;
    userRole?: string;
    exp?: number;
}
export interface ChatSocketSession {
    userId: string;
    userName?: string;
    userEmail?: string;
    userRole?: string;
    exp?: number;
}
