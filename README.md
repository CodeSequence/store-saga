# store-saga
An Rx implementation of redux-saga for @ngrx/store and Angular 2.

Based on [redux-saga-rxjs](https://github.com/salsita/redux-saga-rxjs) by Salsita, with inspiration from [redux-saga](https://github.com/yelouafi/redux-saga) by Yelouafi.

## Usage
`store-saga` depends on @ngrx/store and Angular 2. After configuring @ngrx/store, install `store-saga`:

```bash
npm install store-saga --save
```

Write a saga:
```ts
import {createSaga} from 'store-saga';

export const increment = createSaga(function(){
  return saga$ => saga$
    .filter(saga => saga.action.type === 'DECREMENT')
    .map(() => {
      return { type: 'INCREMENT'}
    });
});
```

Install the store-saga middleware in the same place you provide your ngrx/store:

```ts
import {installSagaMiddleware} from 'store-saga';

bootstrap(App, [
  provideStore(reducer, initialState),
  installSagaMiddleware(increment)
]);
```

## Documentation
* [Utilities](docs/utilities.md) - Information on various utility functions
* [SagaRunner](docs/saga-runner.md) - Use the `SagaRunner` service to run, stop, and pause saga effects dynamically
* [Testing](docs/testing.md) - Learn how to test saga effects using the provided `SagaTester` service
