import {Subscription} from 'rxjs/Subscription';
import {Subject} from 'rxjs/Subject';
import {Injectable, OpaqueToken, provide, Provider, Injector, Inject, SkipSelf, Optional} from 'angular2/core';
import {Action, Dispatcher} from '@ngrx/store';

import {Saga} from './interfaces';

@Injectable()
export class SagaRunner {
  private _iterable: Subject<any>;
  private _resolvedSagas: Map<Provider, Saga<any>>;
  private _runningSagas: Map<Saga<any>, Subscription>;

  constructor(
    private _injector: Injector,
    @Inject(Dispatcher) private _dispatcher: Subject<Action>,
    @Optional() @SkipSelf() private _parent: SagaRunner
  ) {
    if( !_parent ) {
      this._iterable = new Subject();
      this._resolvedSagas = new Map<Provider, Saga<any>>();
      this._runningSagas = new Map<Saga<any>, Subscription>();
    }
  }

  private _next(update: { state: any, action: any }) {
    this._iterable.next(update);
  }

  next(update: { state: any, action: any }) {
    if( this._parent ) {
      return this._parent.next(update);
    }

    this._next(update);
  }

  private _run(saga: Provider, injector: Injector){
    if( !this._resolvedSagas.has(saga) ) {
      this._resolvedSagas.set(saga, injector.resolveAndInstantiate(saga));
    }

    const resolved = this._resolvedSagas.get(saga);

    if( !this._runningSagas.has(resolved) ) {
      const subscription = resolved(this._iterable).subscribe(this._dispatcher);
      this._runningSagas.set(resolved, subscription);
    }
    else {
      throw new Error('Saga Effect is already running');
    }
  }

  run(saga: Provider, injector: Injector = this._injector) {
    if( this._parent ) {
      return this._parent.run(saga, injector);
    }

    this._run(saga, injector);
  }

  private _pause(saga: Provider) {
    if( this._resolvedSagas.has(saga) ) {
      const resolved = this._resolvedSagas.get(saga);

      if( this._runningSagas.has(resolved) ) {
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
    if( this._parent ) {
      return this._parent.pause(saga);
    }

    this._pause(saga);
  }

  private _stop(saga: Provider) {
    this.pause(saga);

    if(this._resolvedSagas.has(saga)) {
      this._resolvedSagas.delete(saga);
    }
    else {
      throw new Error('Saga Effect cannot be stopped: Effect is not resolved');
    }
  }

  stop(saga: Provider) {
    if( this._parent ) {
      return this._parent.stop(saga);
    }

    this._stop(saga);
  }

  get parent() {
    return this._parent;
  }
}
