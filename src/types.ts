export interface User {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    avatar: string;
    job? : string;
    updatedAt?: string;
}

export interface UserState {
    users: User[];
    currentPage: number;
    total_pages: number;
    loading: boolean;
    error: string | null;
    searchTerm: string;

}
 

