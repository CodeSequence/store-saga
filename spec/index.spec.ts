require('core-js');
require('reflect-metadata');
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/do';
import {Injector} from 'angular2/core';
import {provideStore, Store, Action} from '@ngrx/store';
import {Saga, useSaga, useSagaFactory, default as middleware} from '../lib';

const ADD = 'ADD';
const SUBTRACT = 'SUBTRACT';

function reducer(state: number = 0, action) {
  switch(action.type){
    case ADD:
      return state + 1;
    case SUBTRACT:
      return state - 1;
    default:
      return state;
  }
}

describe('@ngrx/store Saga Middleware', function() {
  function runSaga(saga: Saga<number>): Store<number> {
    const injector = Injector.resolveAndCreate([
      provideStore(reducer, 0),
      middleware,
      useSaga(saga)
    ]);

    return injector.get(Store);
  }

  it('should pass!', function(){
    expect(true).toBe(true);
  });

  it('should should pass a saga$ observable with the latest action and state', function() {
    let state: number, action: Action;
    const saga = saga$ => saga$.do(saga => {
      state = saga.state;
      action = saga.action
    })
    .filter(() => false);

    const store = runSaga(saga);

    store.dispatch({ type: ADD });

    expect(state).toEqual(1);
    expect(action).toEqual({ type: ADD });

    store.dispatch({ type: SUBTRACT });

    expect(state).toEqual(0);
    expect(action).toEqual({ type: SUBTRACT });
  });

  it('should push latest iterable$ even if state did not change', function() {
    let state: number, action: Action;
    const saga = saga$ => saga$.do(saga => {
      state = saga.state;
      action = saga.action
    })
    .filter(() => false);

    const store = runSaga(saga);

    store.dispatch({ type: 'ANY' });

    expect(state).toEqual(0);
    expect(action).toEqual({ type: 'ANY' });
  });
});
