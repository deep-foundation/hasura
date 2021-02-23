import gql from 'graphql-tag';
import { generateRemoteSchema } from '@deepcase/hasura/remote-schema';

const typeDefs = gql`
  type Query {
    authTest: AuthTest
  }
  type AuthTest {
    role: String
    userId: String
  }
`;

const resolvers = {
  Query: {
    authTest: async (source, args, context, info) => {
      console.log(source, args, context, info);
      return {
        role: 'demo',
        userId: 'demo',
      };
    },
  }
};

module.exports = generateRemoteSchema({ typeDefs, resolvers, path: '/api/auth/test-remote-schema' });
