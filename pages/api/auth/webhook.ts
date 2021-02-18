import { generateAuthWebhookNextjs } from '@deepcase/hasura/auth-webhook';

export default generateAuthWebhookNextjs({
  findUserByToken: async (token) => ({
    'X-Hasura-Role': token,
    'X-Hasura-User-Id': token,
  }),
});
