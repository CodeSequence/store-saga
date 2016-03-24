import 'rxjs/add/operator/count';
import { Observable } from 'rxjs/Observable';
import { SagaIteration } from '../lib/interfaces';
import { whenAction, put, toPayload, createSaga, applySelector, all } from '../lib/util';

describe('Saga Utilities', function() {
  describe('createSaga', function() {
    it('should throw an error if the function length differs from the provider array', () => {
      const create = () => createSaga(function(a, b, c): any {}, []);

      expect(create).toThrow();
    });
  });

  describe('whenAction', function() {
    const iteration = (type: string) => ({ action: { type }, state: {} });

    it('should create a filter that matches the provided action type', () => {
      const filter = whenAction('demo');

      expect(filter(iteration('fail'))).toBe(false);
      expect(filter(iteration('demo'))).toBe(true);
    });

    it('should match multiple action types', () => {
      const filter = whenAction('a', 'b', 'c');

      expect(filter(iteration('a'))).toBe(true);
      expect(filter(iteration('b'))).toBe(true);
      expect(filter(iteration('c'))).toBe(true);

      expect(filter(iteration('d'))).toBe(false);
    });
  });

  describe('put', function() {
    it('should wrap an action into an observable', function(done) {
      const action = { type: 'TEST ACTION' };

      put(action).subscribe(next => {
        expect(next).toBe(action);
        done();
      });
    });
  });

  describe('toPayload', function() {
    it('should map a saga iteration to an action payload', function() {
      const payload = { value: 123 };
      const iteration: SagaIteration<any> = {
        state: {},
        action: {
          type: 'TEST',
          payload
        }
      };

      expect(toPayload(iteration)).toBe(payload);
    });
  });

  describe('applySelector', function() {
    it('should apply a selector to the state of a saga iteration', function(done) {
      const action = { type: 'TEST' };
      const target = [1, 2, 3];
      const state = { list: target };
      const iteration: SagaIteration<typeof state> = { state, action };
      const saga$ = Observable.of(iteration);

      const selector = (saga$: Observable<typeof state>) => saga$.map(s => s.list);

      saga$.let(applySelector(selector)).subscribe(next => {
        expect(next).toEqual({
          action,
          state: target
        });

        done();
      });
    });
  });

  describe('all', function() {
    it('should filter all values in an observable', function(done) {
      Observable
        .of(1, 2, 3, 4, 5)
        .filter(all)
        .count()
        .subscribe(count => {
          expect(count).toBe(0);
          done();
        });
    });
  });
});
