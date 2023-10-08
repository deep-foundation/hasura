import Cors from 'cors';

export const corsMiddleware = async (req: any, res: any, cors: any) => {
  return await new Promise((resolve, reject) => cors(req, res, (result: any) => {
    if (result instanceof Error) return reject(result);
    return resolve(result);
  }));
}
