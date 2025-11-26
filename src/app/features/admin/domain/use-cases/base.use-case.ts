import { Observable } from 'rxjs';

export abstract class UseCase<TRequest, TResponse> {
  abstract execute(request?: TRequest): Observable<TResponse>;
}

export abstract class UseCaseWithParams<TRequest, TResponse> {
  abstract execute(request: TRequest): Observable<TResponse>;
}

export abstract class BaseUseCase<TRequest, TResponse> {
  abstract execute(request?: TRequest): Observable<TResponse>;
  
  protected abstract buildUseCaseObservable(params?: TRequest): Observable<TResponse>;
}