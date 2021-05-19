import jwt from 'jsonwebtoken';

import gql from 'graphql-tag';
import { generateRemoteSchema } from '@deepcase/hasura/remote-schema';

const JWT_SECRET = process.env.JWT_SECRET;

const typeDefs = gql`
  type Query {
    jwt(jwt: JWTInput): JWTOutput
  }
  input JWTInput {
    userId: String
    role: String
  }
  type JWTOutput {
    token: String
    userId: String
    role: String
  }
`;

const resolvers = {
  Query: {
    jwt: async (source, args, context, info) => {
      const { userId, role } = args.jwt;
      const token = jwt.sign({
        "https://hasura.io/jwt/claims": {
          "x-hasura-allowed-roles": [role],
          "x-hasura-default-role": role,
          "x-hasura-user-id": userId,
        }
      }, JWT_SECRET);
      return { token, userId: userId, role: role };
    },
  }
};

const context = ({ req }) => {
  return { headers: req.headers };
};
console.log('JWT');
module.exports = generateRemoteSchema({ typeDefs, resolvers, context, path: '/api/auth/jwt' });
