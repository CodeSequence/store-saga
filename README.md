# store-saga
An Rx implementation of redux-saga for ngrx/store

## Usage
`store-saga` depends on @ngrx/store and Angular 2. After configuring @ngrx/store, install `store-saga`:

```bash
npm install store-saga --save
```

Write a saga:
```ts
import {Saga} from 'store-saga';

export const Increment: Saga = iterable => iterable
  .filter(({ state, action }) => action.type === 'DECREMENT')
  .map(() => ({ type: 'INCREMENT' }));
```

Bootstrap your app using the saga middleware provider and your saga:

```ts
import sagaMiddlewareProvider, { useSaga } from 'store-saga';

bootstrap(App, [
  provideStore(reducer, initialState),
  sagaMiddlewareProvider,
  useSaga(increment)
]);
```

## Saga Factories
To run your saga in the context of the injector, you can write saga factories instead:

```ts
import {Saga} from 'store-saga';
import {Http} from 'angular2/http';

export function authenticate(http: Http): Saga<State>{
  return iterable => iterable
    .filter(({ action }) => action.type === 'GET_USER')
    .flatMap(() => http.get('/user'))
    .map(res => res.json())
    .map(user => ({ type: 'USER_RETRIEVED', user }));
}
```

Then create a provider for the saga with `useSagaFactory`:
```ts
import {useSagaFactory} from 'store-saga';

bootstrap(App, [
  useSagaFactory(authenticate, [ Http ])
])
```
