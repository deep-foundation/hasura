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
  errorHandler?: (result) => any;
}
export interface HasuraApiQueryOptions {
  route?: string;
}

export class HasuraApi {
  options: HasuraApiOptions;
  defaultErrorHandler = (result) => console.log('error', result?.error, result?.data);
  constructor(options: HasuraApiOptions) {
    this.options = { errorHandler: this.defaultErrorHandler, ...options };
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
    }, {
      route: '/v1/query',
    });
  }
  explain(query: string) {
    return this.query({
      query: {
        query
      },
    }, {
      route: '/v1/graphql/explain',
    });
  }
  async query(data: any, options: HasuraApiQueryOptions = { route: '/v1/query' }) {
    debug('query', data?.type);
    const result: HasuraAxiosResponse = await axios({
      method: 'post',
      url: `http${this.options.ssl ? 's' : ''}://${this.options.path}${options?.route}`,
      headers: {
        ...(this.options.secret ? { 'x-hasura-admin-secret': this.options.secret } : {}),
      },
      data,
      validateStatus: this.validateStatus,
    });
    result.error = this.getError(result);
    if (result.error) this.options.errorHandler(result);
    return result;
  }
  async metadata(data: any, options: HasuraApiQueryOptions = { route: '/v1/metadata' }) {
    return await this.query(data, options);
  }
}
