export interface AuthWebhookOptions {
    findUserByToken: (token: string) => Promise<{
        'X-Hasura-Role': string;
        'X-Hasura-User-Id': string;
        [key: string]: string;
    }>;
}
export declare const generateAuthWebhookNextjs: (options: AuthWebhookOptions) => (req: any, res: any) => Promise<any>;
