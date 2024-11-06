export interface DriverDto {
    name: string;
    phoneNumber: string;
    licenses?: Array<{
        number: string;
        type: string;
        expiryDate: Date;
    }>;
    address?: string;
    email?: string;
    status?: 'ACTIVE' | 'INACTIVE';
    notes?: string;
}