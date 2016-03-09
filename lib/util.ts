import 'rxjs/add/operator/withLatestFrom';
import {Provider, provide, OpaqueToken, Injector} from 'angular2/core';
import {POST_MIDDLEWARE, Dispatcher, Action, Middleware} from '@ngrx/store';

import {SagaRunner} from './runner';
import {SagaIteration, Saga, SagaFactory} from './interfaces';

export function createSaga<T>(factory: SagaFactory<T>, deps: any[] = []){
  return provide(new OpaqueToken('@ngrx/store Saga Effect'), {
    deps,
    useFactory: factory
  });
}

export function installSagaMiddleware(...sagas: Provider[]): Provider[] {
  function factory(dispatcher: Dispatcher<any>, runner: SagaRunner): Middleware {
    sagas.forEach(saga => runner.run(saga));

    return state$ => state$
      .withLatestFrom(dispatcher)
      .map(([ state, action ]) => {
        runner.next({ state, action });

        return state;
      });
  }

  return [
    provide(POST_MIDDLEWARE, {
      multi: true,
      deps: [ Dispatcher, SagaRunner ],
      useFactory: factory
    }),
    provide(SagaRunner, {
      useClass: SagaRunner
    })
  ];
}


export function whenAction(type: string) {
  return function(t: SagaIteration<any>): boolean {
    return t.action.type === type;
  }
}

export function toPayload(t: SagaIteration<any>): any {
  return t.action.payload;
}
