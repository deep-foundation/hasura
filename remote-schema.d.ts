import { Config } from 'apollo-server-micro';
export interface RemoteSchemaOptions extends Config {
    path: string;
}
export declare const generateRemoteSchema: (options: RemoteSchemaOptions) => {
    default: (req: any, res: any) => Promise<void>;
    config: {
        api: {
            bodyParser: boolean;
        };
    };
};
