import express, { Express } from 'express';
import { ApolloServer, IResolvers, Config } from 'apollo-server-express';

export interface RemoteSchemaOptions extends Config {
  wrapApp?: (app: Express) => void;
}

export const generateRemoteSchema = function generateRemoteSchema(
  options: RemoteSchemaOptions,
) {
  const app = express();
  const { wrapApp, ...config } = options;
  const server = new ApolloServer(config);
  server.applyMiddleware({ app });
  wrapApp && wrapApp(app);
  return app;
}
