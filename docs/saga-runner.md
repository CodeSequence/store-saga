# SagaRunner
The `SagaRunner` service allows you to run, pause, and stop saga effects dynamically:

```ts
const authEffect = createSaga(...);

@Component({
  selector: 'profile-route',
  template: '...'
})
class ProfileRoute{
  constructor(private runner: SagaRunner){ }

  routerOnActivate(){
    this.runner.run(incrementEffect);
  }

  routerOnDeactivate(){
    this.runner.stop(incrementEffect);
  }
}
```

## Important Note About Injection
Sagas that are started during bootstrap use the root injector. However, a dynamically started saga may want to use a different injector to resolve the saga effect. This is especially the case when you are working on code splitting.

The `SagaRunner` service is designed to work in tandem with Angular 2's hierarchical injector. To use a different injector, simply re-provide the `SagaRunner` service in your component's providers array:

```ts
@Component({
  selector: 'admin-route',
  template: '...',
  providers: [ SagaRunner ]
})
class AdminRoute{
  constructor(runner: SagaRunner){
    // runner uses this component's injector to resolve
    // any saga effects, storing the resolved effect
    // and subscription with the root SagaRunner
  }
}
```

## SagaRunner API

### Methods
#### run(saga)
Resolves and starts a new saga, or resumes a previously paused saga.

__Params__
* `saga` __SagaProvider__ Saga to begin running

```ts
sagaRunner.run(saga);
```

#### stop(saga)
Stops a saga from running and discards the resolved saga.

__Params__
* `saga` __SagaProvider__ Saga to stop

```ts
sagaRunner.stop(saga)
```

#### pause(saga)
Pauses a saga but retains the resolved saga. In _most_ cases you should `stop` sagas. Only pause a saga if you are certain you will be restarting it.

__Params__
* `saga` __SagaProvider__ Saga to pause

```ts
sagaRunner.pause(saga)
```
