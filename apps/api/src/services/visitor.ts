/** Identity material for dedup. Lives only for the duration of a request. */
export interface Visitor {
  ip: string;
  userAgent: string;
}
