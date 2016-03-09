import {BehaviorSubject} from 'rxjs/subject/BehaviorSubject';
import {Injectable, Injector} from 'angular2/core';

import {SagaRunner} from './runner';

@Injectable()
export class SagaTester extends SagaRunner{
  public output: BehaviorSubject<any>;

  constructor(injector: Injector){
    const dispatcher = new BehaviorSubject(undefined);
    super(injector, dispatcher, undefined);

    this.output = dispatcher;
  }

  sendAction(action: any) {
    this.next({ state: {}, action });
  }

  sendState(state: any) {
    this.next({ state, action: {} });
  }

  send(state: any, action: any) {
    this.next({ state, action });
  }

  get last(){
    return this.output.getValue();
  }
}
