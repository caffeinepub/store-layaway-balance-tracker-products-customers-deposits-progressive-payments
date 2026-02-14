import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface PendingBalance {
    id: string;
    model: string;
    customerLastName: string;
    customerFirstName: string;
    payments: Array<Payment>;
    mobileNumber: string;
    deposit: bigint;
    isPaid: boolean;
    productType: string;
    email: string;
    category: string;
    salePrice: bigint;
}
export type Time = bigint;
export interface RepairRecord {
    id: string;
    customerLastName: string;
    contactStatus: ContactStatus;
    customerFirstName: string;
    mobileNumber: string;
    email: string;
    receivedTimestamp: Time;
    isDelivered: boolean;
    quoteAmount?: bigint;
    problemDescription: string;
    deviceCategory: string;
    deviceModel: string;
}
export interface Payment {
    date: Time;
    amount: bigint;
}
export interface UserProfile {
    name: string;
}
export enum ContactStatus {
    toCall = "toCall",
    called = "called"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addPayment(id: string, amount: bigint): Promise<PendingBalance>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createPendingBalance(id: string, category: string, productType: string, model: string, customerFirstName: string, customerLastName: string, mobileNumber: string, email: string, salePrice: bigint, deposit: bigint): Promise<PendingBalance>;
    createRepairRecord(id: string, deviceCategory: string, deviceModel: string, customerFirstName: string, customerLastName: string, mobileNumber: string, email: string, problemDescription: string, quoteAmount: bigint | null): Promise<RepairRecord>;
    getAllPendingBalances(): Promise<Array<PendingBalance>>;
    getAllRepairRecords(): Promise<Array<RepairRecord>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getOpenRepairRecords(): Promise<Array<RepairRecord>>;
    getRepairRecord(id: string): Promise<RepairRecord>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    markRepairDelivered(id: string): Promise<RepairRecord>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    unmarkRepairDelivered(id: string): Promise<RepairRecord>;
    updateContactStatus(id: string, status: ContactStatus): Promise<RepairRecord>;
    updateRepairQuote(id: string, newQuote: bigint): Promise<RepairRecord>;
}
