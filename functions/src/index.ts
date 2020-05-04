import * as functions from 'firebase-functions';

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

export const helloWorld = functions.region('europe-west3').https.onRequest((request, response) => {
	response.send("Hello from Firebase!");
});
