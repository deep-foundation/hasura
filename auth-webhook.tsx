import Cors from 'cors';
import { corsMiddleware } from './cors-middleware';

export interface AuthWebhookOptions {
  findUserByToken: (token: string) => Promise<{
    'X-Hasura-Role': string;
    'X-Hasura-User-Id': string;
    [key: string]: string;
  }>;
}

export const generateAuthWebhookNextjs = function generateAuthWebhookNextjs(
  options: AuthWebhookOptions,
) {
  const cors = Cors({ methods: ['GET', 'HEAD'] });
  return async (req, res) => {
    await corsMiddleware(req, res, cors);
    const bearer = req?.headers['Authorization'] || req?.headers['authorization'];
    const token = bearer.slice(7);
    if (typeof(token) !== 'string') return res.status(400).json({ error: '!token' });
    res.json(await options.findUserByToken(token));
  };
}
