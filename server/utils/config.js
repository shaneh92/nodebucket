/**
 * Title: app.js
 * Author: Professor Krasso
 * Date: 8/21/2023
 */

//this is only a production example
"use strict";

const {
  DB_USERNAME = "nodebucket_user",
  DB_PASSWORD = "s3cret",
  DB_NAME = "nodebucket",
} = process.env;

const CONFIG = {
  DB_URL: `mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@bellevueuniversity.ut5xprd.mongodb.net/${DB_NAME}?retryWrites=true&w=majority`,
  DB_NAME: DB_NAME,
};

module.exports = CONFIG;
