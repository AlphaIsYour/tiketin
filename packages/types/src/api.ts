// packages/types/src/api.ts
export interface ApiError {
    statusCode: number;
    message: string | string[];
    error?: string;
}

export interface Paginated<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
}