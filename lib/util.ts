import 'rxjs/add/operator/withLatestFrom';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';
import { async } from 'rxjs/scheduler/async';

import { Provider, provide, OpaqueToken, Injector } from 'angular2/core';
import { POST_MIDDLEWARE, Dispatcher, Action, usePostMiddleware } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

import { SagaRunner, INIT_SAGAS } from './runner';
import { SagaScheduler } from './scheduler';
import { SagaIteration, Saga, SagaFactory } from './interfaces';
import { sagaMiddleware } from './middleware';

export function createSaga<T>(factory: SagaFactory<T>, deps: any[] = []) {
  if (factory.length !== deps.length) {
    throw new Error(`Cannot resolve all parameters for saga factory`);
  }

  return provide(new OpaqueToken('@ngrx/store Saga Effect'), {
    deps,
    useFactory: factory
  });
}

export function addInitSagas(...sagas: Provider[]): Provider[] {
  return sagas.map(saga => provide(INIT_SAGAS, {
    multi: true,
    useValue: saga
  }));
}

export function installSagaMiddleware(...sagas: Provider[]): Provider[] {
  return [
    provide(SagaScheduler, { useValue: async }),
    provide(SagaRunner, { useClass: SagaRunner }),
    ...usePostMiddleware(sagaMiddleware),
    ...addInitSagas(...sagas)
  ];
}


export function whenAction(...types: string[]) {
  return function(iteration: SagaIteration<any>): boolean {
    return types.indexOf(iteration.action.type) >= 0;
  };
}

export function toPayload(iteration: SagaIteration<any>): any {
  return iteration.action.payload;
}

export function all() {
  return false;
}


export function applySelector<T, V>(selectorFn: (obs$: Observable<T>) => Observable<V>) {
  return function(saga$: Observable<SagaIteration<T>>): Observable<SagaIteration<V>> {
    const selected$ = saga$.map(s => s.state).let(selectorFn);

    return saga$
      .withLatestFrom(selected$)
      .map(([ iteration, selected ]) => {
        return {
          action: iteration.action,
          state: selected
        };
      });
  };
}

export function put(action: Action): Observable<Action> {
  return Observable.of(action);
}
