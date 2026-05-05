import {createHash} from 'crypto';
import dotenv from 'dotenv';
import express from 'express';
import http from 'node:http';
import cors from 'cors';
import {ParsedQs} from "qs";

dotenv.config({ quiet: true });

const app = express();
app.use(express.json());
app.use(cors());

const baseURL = 'https://ws.audioscrobbler.com/2.0/';

function generateSig(method: string, params?: Map<string, string>) {
  let baseMap: Map<string, string>;
  if (params) baseMap = params;
  else baseMap = new Map<string, string>();
  baseMap.set('api_key', process.env.LFM_API_KEY);
  baseMap.set('method', method);
  const sortedMap = new Map<string, string>([...baseMap].sort());
  let craftedSigString = "";
  for (const [key, value] of sortedMap) {
    craftedSigString += key + value;
  }
  craftedSigString += process.env.LFM_API_SECRET;
  return createHash('md5').update(craftedSigString).digest('hex');
}

function prepQuery(method: string, params?: Map<string, string>) {
  const apiSig = generateSig(method, params);
  const urlParams = new URLSearchParams([...params]);
  urlParams.set('api_sig', apiSig);
  urlParams.set('format', 'json');
  return urlParams.toString();
}

async function doGetReq(method: string, params?: Map<string, string>) {
  const urlParams = prepQuery(method, params);
  const req = await fetch(`${baseURL}?${urlParams}`);
  return await req.json();
}

async function doPostReq(method: string, params?: Map<string, string>) {
  const urlParams = prepQuery(method, params);
  const req = await fetch(`${baseURL}?${urlParams}`, {
    method: 'POST',
  });
  return await req.json();
}

function convertQuery(query: ParsedQs) {
  return new Map<string, string>(Object.entries(query as Record<string, string>));
}

app.get('/getToken', async (req, res) => {
  const lfmReq = await doGetReq('auth.getToken', convertQuery(req.query));
  return res.send(lfmReq);
})

app.get('/getSession', async (req, res) => {
  if (!req.query.token) return res.sendStatus(400);
  const lfmReq = await doGetReq('auth.getSession', convertQuery(req.query));
  return res.send(lfmReq);
})

app.post('/updateNowPlaying', async (req, res) => {
  if (!req.query.sk || !req.query.artist || !req.query.track) return res.sendStatus(400);
  const lfmReq = await doPostReq('track.updateNowPlaying', convertQuery(req.query));
  return res.send(lfmReq);
})

app.post('/scrobble', async (req, res) => {
  if (!req.query.sk || !req.query.artist || !req.query.track || !req.query.timestamp) return res.sendStatus(400);
  const lfmReq = await doPostReq('track.scrobble', convertQuery(req.query));
  return res.send(lfmReq);
})

http.createServer(app).listen(44285);
