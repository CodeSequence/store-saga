import { Observable } from 'rxjs/Observable';
import { Action } from '@ngrx/store';

export interface SagaIteration<State>{
  state: State;
  action: Action;
}

export interface Saga<State>{
  (iterable: Observable<SagaIteration<State>>): Observable<any>;
}

export interface SagaFactory<State>{
  (...deps: any[]): Saga<State>;
}
