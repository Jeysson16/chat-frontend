export interface ResponseModel<T = any> {
    clientName?: string;
    isSuccess?: boolean;
    lstError?: string[];
    lstItem?: Array<T>;
    pagination?: any;
    resultado?: number;
    serverName?: string;
    ticket?: string;
    userName?: string;
    item?: T;
}
