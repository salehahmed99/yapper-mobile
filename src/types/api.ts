/**
 * Generic API Response
 */
export interface IApiResponse<T> {
  data: T;
  count: number;
  message: string;
}
