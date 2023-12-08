/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { onRequest } from "firebase-functions/v2/https";
//import * as logger from "firebase-functions/logger";
import * as express from 'express';
import * as cors from 'cors';

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

var admin = require("firebase-admin");
var serviceAccount = require("./gameoftheyear.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

export const helloWorld = onRequest((request, response) => {

    // logger.info("Hello logs!", { structuredData: true });

    response.json({

        message: "Hello world!!!!",
        id: 456789,
        format: 'json'
    });
});

export const getParam = onRequest((request, response) => {

    const nameValue = request.query.nombre || '';

    response.json({
        name: nameValue,
        id: 456789,
        format: 'json'
    });
});

export const getGame = onRequest(async (request, response) => {

    const gamesCollection = db.collection('Games');
    const gamesSnap = await gamesCollection.get();

    const id = request.query.id;

    response.json(gamesSnap.docs[parseInt(id!.toString())].data());
});

export const getGames = onRequest(async (request, response) => {

    const gamesCollection = db.collection('Games');
    const gamesSnap = await gamesCollection.get();
    const games = gamesSnap.docs.map((doc: { data: () => any; }) => doc.data());

    response.json(games);
});


//Express
const app = express();
app.use(cors({ origin: true }));

app.get('/gameoftheyear', async (request, response) => {

    const gamesCollection = db.collection('Games');
    const gamesSnap = await gamesCollection.get();
    const games = gamesSnap.docs.map((doc: { data: () => any; }) => doc.data());

    response.json(games);
});

app.post('/gameoftheyear/:id', async (request, response) => {

    const id = request.params.id;
    const gamesCollection = db.collection('Games').doc(id);
    const gamesSnap = await gamesCollection.get();

    if (gamesSnap.exists) {
        // response.json(gamesSnap.data());

        const prior = gamesSnap.data() || { votes: 1 };

        await gamesCollection.update({
            votes: prior.votes + 1
        });

        response.json({
            ok: true,
            message: `Game ${gamesSnap.data().name} updated with ${prior.votes + 1} votes.`
        });
    }
    else {
        response.status(404).json({
            ok: false,
            message: `Game ${id} doesn't exists.`
        });
    }
});

// exports.api = onRequest(app);

export const api = onRequest(app);
