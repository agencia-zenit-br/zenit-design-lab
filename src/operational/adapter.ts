/** Contract for future authorized, server-backed record APIs.
 * The concrete product supplies authentication, tenant/instance scoping,
 * entitlements and field capabilities. UI never assumes an empty response
 * is proof of authorization, or infers persistence from a local callback.
 */
import type {CollectionQuery,RecordWithId} from './collectionCore';
export type PageResult<Row>=Readonly<{rows:readonly Row[];total:number;page:number;pageSize:number}>;
export type VersionedRecord=RecordWithId&{revision:number};
export type OperationResult<Row>=
  |{ok:true;record:Row}
  |{ok:false;kind:'unauthorized'|'forbidden'|'conflict'|'invalid'|'offline'|'server';message:string};
export interface RecordsDataSource<Row extends VersionedRecord>{
  list(query:CollectionQuery,signal?:AbortSignal):Promise<OperationResult<PageResult<Row>>>;
  read(id:Row['id'],signal?:AbortSignal):Promise<OperationResult<Row>>;
  update(id:Row['id'],expectedRevision:number,patch:Partial<Row>):Promise<OperationResult<Row>>;
}
/** Backend adapters require independent policy tests, request cancellation,
 * freshness semantics, authenticated context and no-store for private data.
 * Not implemented by the in-memory Design Lab fixture. */
