# Utilities API

#### createSaga(factory: SagaFactory, dependencies: any[])
Creates a saga in the context of the injector.

__Params__
* `factory` __SagaFactory__ Factory function called in the context of the injector. Must return a function that implements the `Saga` interface.
* `dependencies` __any[]__ Array of dependencies the factory function needs

_Returns_ `Provider`

```ts
const authEffect = createSaga(function(http: Http) {
  return saga$ => saga$
    .filter(saga => saga.action.type === 'AUTH')
    .map(saga => saga.action.payload)
    .flatMap(payload => {
      return http.post('/auth', JSON.stringify(payload))
        .map(res => {
          return {
            type: 'AUTH_SUCESS',
            payload: res.json()
          }
        })
        .catch(error => Observable.of({
          type: 'AUTH_FAILED',
          payload: error.json()
        }));
    });
}, [ Http ]);
```

#### installSagaMiddleware(...sagas: Provider[])
Installs the saga middleware and initializes it to immediately begin running the provided sagas.

__Params__
* `...sagas` __Provider[]__ Sagas you want to begin running immediately.

_Returns_ `Provider[]`

```ts
boostrap(App, [
  provideStore(reducer),
  installSagaMiddleware(authEffect, signoutEffect)
]);
```

#### whenAction(actionType: string)
Filters a stream of `SagaIteration`s to only include iterations with an action of the provided type.

__Params__
* `actionType` __string__ Action type to filter for

_Returns_ `(iteration: SagaIteration) => boolean`

```ts
return saga$ => saga$
  .filter(whenAction('AUTH'))
```

#### toPayload
Function you can pass in to map a saga iteration to the payload of that iteration's action

```ts
return saga$ => saga$
  .map(toPayload)
  .do(payload => { ... });
```
