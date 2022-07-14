export * from './githubWebhook/index.js';
export * from './ng-dev/index.js';
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp({...functions.firebaseConfig()});
