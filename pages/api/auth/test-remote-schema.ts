import gql from 'graphql-tag';
import { generateRemoteSchema } from '@deepcase/hasura/remote-schema';

const typeDefs = gql`
  type Query {
    authTest:  {
      X-Hasura-Role: String
      X-Hasura-User-Id: String
    }
  }
`;

const resolvers = {
  Query: {
    authTest: async (source, args, context, info) => {
      console.log(source, args, context, info);
      return {
        'X-Hasura-Role': 'demo',
        'X-Hasura-User-Id': 'demo',
      };
    },
  }
};

export default generateRemoteSchema({ typeDefs, resolvers });
