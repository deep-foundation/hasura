import axios, { AxiosResponse } from 'axios';
import Debug from 'debug';

const debug = Debug('deepcase:hasura');

export interface HasuraAxiosResponse extends AxiosResponse {
  error?: string;
}

export interface HasuraApiOptions {
  path: string;
  ssl: boolean;
  secret: string;
}

export class HasuraApi {
  options: HasuraApiOptions;
  constructor(options: HasuraApiOptions) {
    this.options = options;
  }
  validateStatus() { return true };
  getError(result: AxiosResponse): null | string {
    const { status } = result;
    const error = status >= 200 && status < 300 ? null : result.statusText;
    return error;
  }
  sql(sql: string) {
    return this.query({
      type: 'run_sql',
      args: {
        sql,
      },
    })
  }
  async query(data: any) {
    debug('query', data?.type);
    const result: HasuraAxiosResponse = await axios({
      method: 'post',
      url: `http${this.options.ssl ? 's' : ''}://${this.options.path}/v1/query`,
      headers: {
        ...(this.options.secret ? { 'x-hasura-admin-secret': this.options.secret } : {}),
      },
      data,
      validateStatus: this.validateStatus,
    });
    result.error = this.getError(result);
    if (result.error) debug('error', result?.error, result?.data);
    return result;
  }
}
