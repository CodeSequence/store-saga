import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { BehaviorSubject } from 'rxjs/subject/BehaviorSubject';
import { Injectable, Injector } from 'angular2/core';

import { Saga } from './interfaces';
import { SagaRunner } from './runner';

@Injectable()
export class SagaTester extends SagaRunner {
  public output: BehaviorSubject<any>;

  constructor(injector: Injector) {
    const dispatcher = new BehaviorSubject(undefined);

    super(injector, dispatcher, undefined, undefined, []);

    this.output = dispatcher;
  }

  send(state: any, action: any) {
    this.next({ state, action });
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
