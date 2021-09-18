import express from 'express';
import cors from 'cors';

import admin, { firestore } from 'firebase-admin';
const serviceAccount = require('./auth_key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const app = express();
const port = 3000;

export const db = admin.firestore();

const boards: admin.firestore.CollectionReference = db.collection('boards');
const userBoards = db.collection('user-boards');

// middleware to handle requests with json body
app.use(express.json());

// allow requests from frontend in dev
app.use(
  cors({
    origin: 'http://localhost:3000'
  })
);

app.listen(port, () => {
  console.log(`application is running on port ${port}.`);
});

app.post('/api/create-board', async (req, res) => {});

app.post('/api/get-board/:boardId', async (req, res) => {
  const boardId = req.params.boardId;

  const querySnapshot = await firestore()
    .collection('boards')
    .where('boardId', '==', boardId)
    .get();

  querySnapshot.docs.forEach((doc) => {
    res.status(200).send(doc.data());
  });
});

app.get('/api/get-boards/:userId', async (req, res) => {
  let boardsIds;

  const promiseArray = [];
  const results = [];
  const userId = req.params.userId;

  const userBoardsQuerySnapshort = await firestore()
    .collection('user-boards')
    .where('userId', '==', userId)
    .get();

  userBoardsQuerySnapshort.docs.forEach((doc) => {
    boardsIds = doc.data().boards;
  });

  boardsIds.forEach((boardsId) => {
    const promise = firestore()
      .collection('boards')
      .where('boardId', '==', boardsId)
      .get()
      .then((querySnapshot) => {
        querySnapshot.docs.forEach((doc) => {
          results.push(doc.data());
        });
      });

    promiseArray.push(promise);
  });

  await Promise.all(promiseArray);
  res.status(200).send(results);
});

app.post('/api/link-board', async (req, res) => {});

app.post('/api/board/update-task', async (req, res) => {});

app.post('/api/board/create-task', async (req, res) => {});

app.post('/api/board/delete-task', async (req, res) => {});
