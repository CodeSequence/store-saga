import 'rxjs/add/observable/from';
import 'rxjs/add/operator/observeOn';
import 'rxjs/add/operator/let';
import { Subscription } from 'rxjs/Subscription';
import { Subject } from 'rxjs/Subject';
import { Scheduler } from 'rxjs/Scheduler';
import { Observable } from 'rxjs/Observable';
import { NextObserver } from 'rxjs/Observer';
import {
  Injectable,
  OpaqueToken,
  provide,
  Provider,
  Injector,
  Inject,
  SkipSelf,
  Optional
} from 'angular2/core';
import { Action, Dispatcher } from '@ngrx/store';

import { async } from 'rxjs/scheduler/async';
import { SagaScheduler } from './scheduler';
import { Saga, SagaIteration } from './interfaces';

export const INIT_SAGAS = new OpaqueToken('@ngrx/store/sagas Bootstrap');

@Injectable()
export class SagaRunner implements NextObserver<SagaIteration<any>> {
  protected _iterable: Subject<SagaIteration<any>>;
  private _resolvedSagas: Map<Provider, Saga<any>>;
  private _runningSagas: Map<Saga<any>, Subscription>;

  constructor(
    private _injector: Injector,
    @Inject(Dispatcher) private _dispatcher: Subject<Action>,
    @Inject(SagaScheduler) private _scheduler: Scheduler,
    @Optional() @SkipSelf() private _parent: SagaRunner,
    @Optional() @Inject(INIT_SAGAS) initSagas: Provider[]
  ) {
    if (!_parent) {
      this._iterable = new Subject<SagaIteration<any>>();
      this._resolvedSagas = new Map<Provider, Saga<any>>();
      this._runningSagas = new Map<Saga<any>, Subscription>();

      if (!!initSagas) {
        initSagas.forEach(saga => this.run(saga));
      }
    }
  }

  private _next(update: SagaIteration<any>) {
    this._iterable.next(update);
  }

  next(update: { state: any, action: any }) {
    if (this._parent) {
      return this._parent.next(update);
    }

    this._next(update);
  }

  private _connect(saga: Saga<any>): Subscription {
    if (this._scheduler) {
      return this._iterable
        .let(saga)
        .observeOn(this._scheduler)
        .subscribe(this._dispatcher);
    }
    else {
      return this._iterable
        .let(saga)
        .subscribe(this._dispatcher);
    }
  }

  private _run(saga: Provider, injector: Injector) {
    if (!this._resolvedSagas.has(saga)) {
      this._resolvedSagas.set(saga, injector.resolveAndInstantiate(saga));
    }

    const resolved = this._resolvedSagas.get(saga);

    if (!this._runningSagas.has(resolved)) {
      this._runningSagas.set(resolved, this._connect(resolved));
    }
    else {
      throw new Error('Saga Effect is already running');
    }
  }

  run(saga: Provider, injector: Injector = this._injector) {
    if (this._parent) {
      return this._parent.run(saga, injector);
    }

    this._run(saga, injector);
  }

  private _pause(saga: Provider) {
    if (this._resolvedSagas.has(saga)) {
      const resolved = this._resolvedSagas.get(saga);

      if (this._runningSagas.has(resolved)) {
        const sub = this._runningSagas.get(resolved);

        sub.unsubscribe();
        this._runningSagas.delete(resolved);
      }
      else {
        throw new Error('Saga Effect cannot be paused: '
        + 'Effect is already paused');
      }
    }
    else {
      throw new Error('Saga Effect cannot be paused: '
      + 'Effect is not running and has not been resolved');
    }
  }

  pause(saga: Provider) {
    if (this._parent) {
      return this._parent.pause(saga);
    }

    this._pause(saga);
  }

  private _stop(saga: Provider) {
    this.pause(saga);

    if (this._resolvedSagas.has(saga)) {
      this._resolvedSagas.delete(saga);
    }
    else {
      throw new Error('Saga Effect cannot be stopped: Effect is not resolved');
    }
  }

  stop(saga: Provider) {
    if (this._parent) {
      return this._parent.stop(saga);
    }

    this._stop(saga);
  }

  get parent() {
    return this._parent;
  }
}
