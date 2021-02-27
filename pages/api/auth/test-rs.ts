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
      return {
        role: context?.headers?.['x-hasura-role'],
        userId: context?.headers?.['x-hasura-user-id'],
      };
    },
  }
};

const context = ({ req }) => {
  return { headers: req.headers };
};

module.exports = generateRemoteSchema({ typeDefs, resolvers, context, path: '/api/auth/test-rs' });
