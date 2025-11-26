export class RequestOption {
    url: string;
    resource: string;
    request: any;
    type: ResponseType = 'JSON';
    json: boolean = true;
    method: MethodHttp;
    excludeLoader: string = '0';
    pathVariables: (string | number | boolean)[] = [];
    queryParams: QueryParamsApi[] = [];
}

export interface QueryParamsApi {
    key: string;
    value: string | number;
}

type MethodHttp = 'GET' | 'POST' | 'PUT' | 'DELETE';
type ResponseType = 'JSON' | 'BLOB';
