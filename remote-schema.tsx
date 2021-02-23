import Cors from 'cors';
import { ApolloServer, IResolvers, Config } from 'apollo-server-micro';
import { corsMiddleware } from './cors-middleware';

export interface RemoteSchemaOptions extends Config {
  path: string;
}

export const generateRemoteSchema = function generateRemoteSchema(
  options: RemoteSchemaOptions,
) {
  const cors = Cors({ methods: ['POST', 'OPTIONS'] });
  const { path, ...config } = options;
  const apolloServer = new ApolloServer({
    introspection: true,
    ...config,
  });
  const handler = apolloServer.createHandler({ path });
  return {
    default: async (req, res) => {
      await corsMiddleware(req, res, cors);
      return await handler(req, res);
    },
    config: {
      api: {
        bodyParser: false,
      },
    },
  };
}
