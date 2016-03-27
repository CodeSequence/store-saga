import 'rxjs/add/operator/withLatestFrom';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import { Provider } from 'angular2/core';
import { createMiddleware, Dispatcher } from '@ngrx/store';

import { SagaRunner } from './runner';

export const sagaMiddleware = createMiddleware(function middlewareFactory(
  dispatcher$: Dispatcher<any>, runner: SagaRunner) {

  return state$ => state$
    .withLatestFrom(dispatcher$, (state, action) => ({ state, action }))
    .do(runner)
    .map(({ state }) => state);
}, [ Dispatcher, SagaRunner ]);
