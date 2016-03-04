import 'rxjs/add/operator/map';
import 'rxjs/add/operator/withLatestFrom';
import 'rxjs/add/observable/merge';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {OpaqueToken, provide, Provider} from 'angular2/core';
import {Action, Store, Dispatcher, POST_MIDDLEWARE} from '@ngrx/store'

export const SAGA_FUNCTIONS = new OpaqueToken('store-saga/saga-functions');

export interface Saga<State>{
  (iterable: Observable<{ state: State, action: Action }>): Observable<any>;
}

export function useSaga(saga: Saga<any>){
  return provide(SAGA_FUNCTIONS, { useValue: saga, multi: true });
}

export function useSagaFactory(useFactory: (...deps: any[]) => Saga<any>, deps: any[]){
  return provide(SAGA_FUNCTIONS, { deps, useFactory, multi: true });
}

export default provide(POST_MIDDLEWARE, {
  multi: true,
  deps: [ Dispatcher, SAGA_FUNCTIONS ],
  useFactory(dispatcher: Dispatcher<any>, sagas: Saga<any>[]){
    return function(state$: Observable<any>){
      const iterable$ = new Subject();
      const resolvedSagas = sagas.map(saga => saga(iterable$));

      Observable.merge(...resolvedSagas).subscribe(dispatcher);

      return state$
        .withLatestFrom(dispatcher)
        .map(([ state, action ]) => {
          iterable$.next({ state, action });

          return state;
        });
    }
  }
});
