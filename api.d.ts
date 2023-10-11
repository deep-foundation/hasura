import { AxiosResponse } from 'axios';
export interface HasuraAxiosResponse extends AxiosResponse {
    error?: string;
}
export interface HasuraApiOptions {
    path: string;
    ssl: boolean;
    secret: string;
    errorHandler?: (result: any) => any;
}
export interface HasuraApiQueryOptions {
    route?: string;
}
export declare class HasuraApi {
    options: HasuraApiOptions;
    defaultErrorHandler: (result: any) => void;
    constructor(options: HasuraApiOptions);
    validateStatus(): boolean;
    getError(result: AxiosResponse): null | string;
    sql(sql: string): Promise<HasuraAxiosResponse>;
    explain(query: string): Promise<HasuraAxiosResponse>;
    query(data: any, options?: HasuraApiQueryOptions): Promise<HasuraAxiosResponse>;
    metadata(data: any, options?: HasuraApiQueryOptions): Promise<HasuraAxiosResponse>;
}
