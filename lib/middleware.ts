import 'rxjs/add/operator/withLatestFrom';
import 'rxjs/add/operator/map';
import { Injector, Provider } from 'angular2/core';
import { createMiddleware, Dispatcher } from '@ngrx/store';

import { SagaRunner } from './runner';

export function middlewareFactory(dispatcher$: Dispatcher<any>, injector: Injector) {
  let runner: SagaRunner;

  return state$ => state$
    .withLatestFrom(dispatcher$)
    .map(([ state, action ]) => {
      if( !runner ) {
        runner = injector.get(SagaRunner);
      }

      runner.next({ state, action });

      return state;
    });
}

export const sagaMiddleware = createMiddleware(middlewareFactory, [
  Dispatcher,
  Injector
]);
