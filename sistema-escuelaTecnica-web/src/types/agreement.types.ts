import type { School } from './school.types';

export const DiscountType = {
    PERCENTAGE: 'PERCENTAGE',
    FIXED_AMOUNT: 'FIXED_AMOUNT'
} as const;

export type DiscountType = typeof DiscountType[keyof typeof DiscountType];

export interface Agreement {
    id: number;
    name: string;
    agreementCode: string;
    discountType: DiscountType;
    discountValue: number; // Decimal in DB, number in JS
    startDate: string; // Date string
    endDate: string | null;
    isActive: boolean;
    notes?: string;
    createdAt: string;
    updatedAt: string;

    // Relations
    schools?: School[];
    _count?: {
        schools: number;
    };
}

export interface CreateAgreementData {
    name: string;
    discountType: DiscountType;
    discountValue: number;
    startDate: string;
    endDate?: string | null;
    notes?: string;
    schoolIds?: number[];
}

export interface UpdateAgreementData {
    name?: string;
    discountType?: DiscountType;
    discountValue?: number;
    startDate?: string;
    endDate?: string | null;
    notes?: string;
    isActive?: boolean;
    schoolIds?: number[];
}
