import { EventEmitter } from "events";

export const userCreatedEvent = new EventEmitter<{"user": [{identifier: string, firstname: string, lastname: string}]}>();