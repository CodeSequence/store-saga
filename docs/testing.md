# Testing Sagas
store-saga ships with a testing helper called `SagaTester` that extends `SagaRunner`. It exposes some helpful methods to interact with a saga effect and make assertions about the effect's resultant stream.

Extending from our `authEffect` example written in the _Getting Started_ guide, let's write a test that ensures the effect is responding correctly to dispatched actions:

_Note: for this example I am using respond-ng, a simple Http mocking library I wrote to make unit testing Http calls easier_

```ts
import {Injector} from '@angular/core';
import RESPOND_PROVIDERS, {Respond} from 'respond-ng';
import {SagaTester} from 'store-saga/testing';

import {authEffect} from './auth-effect';

describe('Authentication Effect', () => {
  let sagaTester: SagaTester;
  let respond: Respond;

  beforeEach(() => {
    const injector = Injector.resolveAndCreate([
      SagaTester,
      RESPOND_PROVIDERS
    ]);

    sagaTester = injector.get(SagaTester);
    respond = injector.get(Respond);

    sagaTester.run(authEffect);
  });

  it('should auth a user when an auth action is dispatched', () => {
    const payload = { username: 'Mike', password: 'test' };
    respond.ok().when.post('/auth', payload)

    sagaTester.sendAction({ type: 'AUTH', payload });

    expect(sagaTester.last).toEqual({ type: 'AUTH_SUCCESS' });
  });
});
```

## SagaTester API
### Parameters
#### output
Output stream of all running sagas.

_Type_ __BehaviorSubject__

```ts
sagaTester.output.subscribe(action => { });
```

#### last
Most recent action dispatched from a saga

_Type_ __Action__

```ts
expect(sagaTester.last).toEqual({ type: 'INCREMENT' });
```

### Methods
#### sendAction(action)
Sends an action and an empty state object to all running sagas.

__Params__
* `action` __Action__ Action object to dispatch to sagas

```ts
sagaTester.sendAction({ type: 'INCREMENT' });
```

#### sendState(state)
Sends state and an empty action object to all running sagas.

__Params__
* `state` __any__ State object to dispatch to sagas

```ts
sagaTester.sendState({ counter: 3 });
```

#### send(state, action)
Sends both state and action objects to all running sagas.

__Params__
* `state` __any__ State object to dispatch to sagas
* `action` __Action__ Action object to dispatch to sagas

```ts
sagaTester.send({ counter: 3 }, { type: 'INCREMENT' });
```
