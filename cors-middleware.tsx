import Cors from 'cors';

export const corsMiddleware = async (req, res, cors) => {
  return await new Promise((resolve, reject) => cors(req, res, (result) => {
    if (result instanceof Error) return reject(result);
    return resolve(result);
  }));
}
