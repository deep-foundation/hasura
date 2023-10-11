import { ApolloClient } from '@apollo/client';
export interface IApolloClientGeneratorOptions {
    initialStore?: any;
    token?: string;
    client?: string;
    secret?: string;
    ssl?: boolean;
    path?: string;
    headers?: any;
    ws?: boolean;
    relative?: boolean;
}
export declare function generateHeaders(options: IApolloClientGeneratorOptions): any;
export interface IApolloClient<T> extends ApolloClient<T> {
    jwt_token?: string;
    path?: string;
    ssl?: boolean;
}
export declare function generateApolloClient(options: IApolloClientGeneratorOptions, forwardingArguments?: {
    ApolloClient?: any;
    InMemoryCache?: any;
}): ApolloClient<any>;
