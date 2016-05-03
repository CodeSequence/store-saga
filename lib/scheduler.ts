import {provide, Provider, OpaqueToken} from '@angular/core';
import { async } from 'rxjs/scheduler/async';

export const SagaScheduler = new OpaqueToken('@ngrx/store/sagas Scheduler');

export const schedulerProvider = provide(SagaScheduler, { useValue: async });
