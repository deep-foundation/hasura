import Cors from 'cors';

export interface AuthWebhookOptions {
  findUserByToken: (token: string) => Promise<{
    'X-Hasura-Role': string;
    'X-Hasura-User-Id': string;
    [key: string]: string;
  }>;
}

export const corsMiddleware = async (req, res, cors) => {
  return await new Promise((resolve, reject) => cors(req, res, (result) => {
    if (result instanceof Error) return reject(result);
    return resolve(result);
  }));
}

export const generateAuthWebhookNextjs = function generateAuthWebhookNextjs(
  options: AuthWebhookOptions,
) {
  const cors = Cors({ methods: ['GET', 'HEAD'] });
  return async (req, res) => {
    await corsMiddleware(req, res, cors);
    var token = req?.headers?.['Authorization'];
    if (typeof(token) === 'string') res.status(400).json({ error: '!token' });
    res.json(await options.findUserByToken(token));
  };
}
