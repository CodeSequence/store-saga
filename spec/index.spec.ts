import './test_harness';
import {ReflectiveInjector, Provider} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {provideStore, Store, Action, Dispatcher, usePostMiddleware} from '@ngrx/store';
import {Saga, SagaRunner, schedulerProvider, SagaScheduler, createSaga, whenAction, installSagaMiddleware} from '../lib';
import {SagaTester} from '../lib/testing';

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

  function runSaga(saga: Provider): Store<number> {
    const injector = ReflectiveInjector.resolveAndCreate([
      provideStore(reducer, 0),
      installSagaMiddleware(saga),
      schedulerProvider
    ]);

    return injector.get(Store);
  }

  describe('Middleware', function() {
    it('should should pass a saga$ observable with the latest action and state', function() {
      let state: number, action: Action;
      const saga = createSaga<number>(() => saga$ => saga$.do(saga => {
        state = saga.state;
        action = saga.action
      })
      .filter(() => false));

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
      const saga = createSaga<number>(() => saga$ => saga$.do(saga => {
        state = saga.state;
        action = saga.action
      })
      .filter(() => false));

      const store = runSaga(saga);

      store.dispatch({ type: 'ANY' });

      expect(state).toEqual(0);
      expect(action).toEqual({ type: 'ANY' });
    });
  });

  describe('SagaRunner', function() {
    let runner: SagaRunner;
    let child: SagaRunner;
    let dispatcher: Dispatcher<Action>;

    beforeEach(() => {
      const rootInjector = ReflectiveInjector.resolveAndCreate([ Dispatcher, SagaRunner, schedulerProvider ]);
      const childInjector = rootInjector.resolveAndCreateChild([ SagaRunner ]);

      runner = rootInjector.get(SagaRunner);
      child = childInjector.get(SagaRunner);
      dispatcher = rootInjector.get(Dispatcher);
    });

    it('should resolve the parent SagaRunner if it is available', function() {
      expect(child).not.toBe(runner);
      expect(child.parent).toBe(runner);
    });

    it('should let you run an effect', function() {
      let factoryCalled = false;
      let sagaCalled = false;
      const effect = createSaga(() => {
        factoryCalled = true;
        return () => {
          sagaCalled = true;

          return Observable.empty();
        }
      });

      runner.run(effect);
      expect(factoryCalled).toBe(true);
      expect(sagaCalled).toBe(true);
    });

    it('should let you pause an effect', function() {
      const watch = 'Watch';
      const next = 'Next';
      let callCount = 0;
      const effect = createSaga(() => saga$ => saga$
        .filter(whenAction(watch))
        .map(() => ({ type: next }))
        .do(() => ++callCount)
      );

      runner.run(effect);
      runner.next({ action: { type: watch }, state: {} });
      runner.pause(effect);
      runner.next({ action: { type: watch }, state: {} });

      expect(callCount).toEqual(1);
    });

    it('should not call the injector when restarting a paused effect', function() {
      let callCount = 0;
      const effect = createSaga(() => {
        ++callCount;
        return saga$ => saga$.filter(() => false);
      });

      runner.run(effect);
      runner.pause(effect);
      runner.run(effect);

      expect(callCount).toEqual(1);
    });

    it('should use the injector to resolve a stopped effect', function() {
      let callCount = 0;
      const effect = createSaga(() => {
        ++callCount;
        return saga$ => saga$.filter(() => false);
      });

      runner.run(effect);
      runner.stop(effect);
      runner.run(effect);

      expect(callCount).toEqual(2);
    });

    it('should call parent methods if the parent is set', function() {
      spyOn(runner, 'next');
      spyOn(child, '_next');
      spyOn(runner, 'stop');
      spyOn(child, '_stop');
      spyOn(runner, 'pause');
      spyOn(child, '_pause');
      spyOn(runner, 'run');
      spyOn(child, '_run');

      const effect = createSaga(() => saga$ => saga$.filter(() => false));

      child.next({ action: {}, state: {} });
      child.run(effect);
      child.pause(effect);
      child.run(effect);
      child.stop(effect);

      expect(runner.next).toHaveBeenCalled();
      expect(child['_next']).not.toHaveBeenCalled();
      expect(runner.pause).toHaveBeenCalled();
      expect(child['_pause']).not.toHaveBeenCalled();
      expect(runner.stop).toHaveBeenCalled();
      expect(child['_stop']).not.toHaveBeenCalled();
      expect(runner.run).toHaveBeenCalled();
      expect(child['_run']).not.toHaveBeenCalled();
    });
  });

  describe('SagaTester', function() {

    it('should use asap scheduler by default', function () {
      const rootInjector = ReflectiveInjector.resolveAndCreate([ SagaTester ]);
      let tester: SagaTester = rootInjector.get(SagaTester);

      const saga = createSaga<number>(() => saga$ => saga$
        .filter(whenAction(ADD))
        .map(() => ({ type: SUBTRACT })));

      tester.run(saga);

      tester.sendAction({ type: ADD })
      expect(tester.last).toEqual({ type: SUBTRACT })
    });
  });

});
