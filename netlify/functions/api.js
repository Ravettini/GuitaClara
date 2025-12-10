// Netlify serverless function que envuelve el backend Express
const express = require('express');
const serverless = require('serverless-http');
const app = require('../../backend/src/index').default || require('../../backend/src/index');

// Exportar como función serverless de Netlify
module.exports.handler = serverless(app);

