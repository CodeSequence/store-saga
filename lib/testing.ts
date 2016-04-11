import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { BehaviorSubject } from 'rxjs/subject/BehaviorSubject';
import { Injectable, Injector } from 'angular2/core';
import { Dispatcher } from '@ngrx/store';

import { Saga } from './interfaces';
import { SagaRunner } from './runner';

@Injectable()
export class SagaTester extends SagaRunner {
  private _state: Dispatcher<any>;
  private _actions: Dispatcher<any>;
  public output: BehaviorSubject<any>;

  constructor(injector: Injector) {
    const state = new Dispatcher<any>();
    const dispatcher = new Dispatcher<any>();

    super(state, dispatcher, injector, undefined);

    this._state = state;
    this._actions = dispatcher;
    this.output = new BehaviorSubject(undefined);
  }

  protected _connect(saga: Saga<any>) {
    return this._iterable.let(saga).subscribe(this.output);
  }

  send(state: any, action: any) {
    this._state.dispatch(state);
    this._actions.dispatch(action);
  }

  sendAction(action: any) {
    this.send({}, action);
  }

  sendState(state: any) {
    this.send(state, {});
  }

  get last(){
    return this.output.getValue();
  }
}
