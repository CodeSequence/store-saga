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

Install the store-saga middleware in the same place you provide ngrx/store:

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

## Motivation
Angular 2 components can receive visible input from a few different sources:
  * Inputs injected into the constructor using dependency injection
  * Inputs provided by property bindings using the `@Input()` decorator
  * Events emitted from the template

A _pure_ component has no invisible inputs, instead relying on the above strategies for accepting input.

### How can an input be _invisible_ ?
Consider the following simple counter component:
```js
@Component({
  selector: 'counter',
  template: `
    {{ value }}
    <button (click)="add()">Add</button>
  `
})
class Counter {
  value = Math.random() * 30;

  add() {
    this.value = this.value + 1;
  }
}
```
It receives input from an event binding in the template, but it relies on a hidden input: `Math.random()`. These _hidden inputs_ can be thought of as side effects. If you use this `<counter />` component anywhere in your application, it has unknown consequences. If you write components that have side effects, they are generally harder to test and make it more difficult to reason about the correctness of your application.

A very common source of side effects in apps are Http requests. If a component makes an Http request or injects a service that makes a request, you are introducing side effects into your component. Components with side effects are considered _impure_. This is because an Http request - even if you are injecting the Http service - has unknown consequences. Before you make the request you have no guarantee if the request will succeed or fail.

If you are using @ngrx/store in your application to manage state, you are already doing a lot of the work necessary to make your components more pure. However @ngrx/store does not provide any way to deal with side effects out-of-the-box. Sagas are just that: a way to isolate side effects in your application so that you can write pure components.

## How do they work?
In store-saga, sagas are simply functions that accept a `saga$` observable and return a new observable of actions. The `saga$` observable emits every time state changes, providing you with the new state and the action that caused state to update. You filter over the `saga$` observable to listen for specific actions or state changes in your application, execute side-effect producing code, and return new actions to dispatch.

For example, imagine building a `<login-form />` component that accepts a username and password. In order to verify authentication you need to make an Http request to your authentication server. This request is a side-effect and should be isolated from our `<login-form />` component. To do this, we will have the component dispatch an `AUTH_REQUEST` action when the user submits the form:

```js
@Component({
  selector: 'login-form',
  template: `
    <form (submit)="login()">
      <label>
        Username
        <input type="text" [(ngModel)]="username">
      </label>

      <label>
        Password
        <input type="password" [(ngModel)]="password">
      </label>

      <button type="submit">Login</button>
    </form>
  `
})
export class LoginForm {
  constructor(private store: Store<State>) { }

  username = '';
  password = '';

  login() {
    this.store.dispatch({
      type: 'AUTH_REQUESTED',
      payload: {
        username: this.username,
        password: this.password
      }
    });
  }
}
```

Now we can write a saga that listens for the `AUTH_REQUESTED` action and makes the Http request. If the request succeeds, we will dispatch an `AUTH_SUCCESS` action and if the request fails we will dispatch an `AUTH_FAILURE` action:

```js
const loginEffect = createSaga(function(http: Http) {

  return function(saga$: Observable<any>) {
    return saga$
      .filter(iteration => iteration.action.type === 'AUTH_REQUESTED')
      .map(iteration => iteration.action.payload)
      .mergeMap(payload => {
        return http.post('/auth', JSON.stringify(payload))
          .map(res => {
            return {
              type: 'AUTH_SUCCESS',
              payload: res.json()
            }
          })
          .catch(err => {
            return Observable.of({
              type: 'AUTH_FAILURE',
              payload: err.json()
            });
          });
      });
  };

}, [ Http ]);
```

The last step is to install the saga middleware when our application bootstraps, providing all of the sagas we want to run:

```js
import { installSagaMiddleware } from 'store-saga';

bootstrap(App, [
  provideStore(reducer),
  installSagaMiddleware(loginEffect)
]);
```

Now our side effect is completely isolated from our `<login-form />` component. This also has the benefit of decoupling our asynchronous business logic from our UI, making your code more portable and - with the help of built-in saga testers - easier to test.
