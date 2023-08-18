/**
 * Title: app.js
 * Author: Professor Krasso
 * Modified by: Shane Hingtgen
 * Date: 8/5/2023
 */
"use strict";

// Require statements, called common JS - Node JS specific
const express = require("express");
const createServer = require("http-errors");
const path = require("path");
const employeeRoute = require("./routes/employee");

// swagger
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

// Create the Express app
const app = express();

// Configure the app
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../dist/nodebucket")));
app.use("/", express.static(path.join(__dirname, "../dist/nodebucket")));

app.use("/api/employees", employeeRoute);

// more swagger: openapi specification
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Nodebucket RESTful APIs",
      version: "1.0.0",
    },
  },
  apis: ["./routes/*.js"], //files containing annotations for the OpenAPI Specification
};

// more swagger: assigning a variable to call swaggerJsdoc
const openapiSpecification = swaggerJsdoc(options);

// more swagger: wire openapiSpecification to app variable
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openapiSpecification));
app.use("/api", employeeRoute);

// error handler for 404 errors

app.use(function (req, res, next) {
  next(createServer(404)); // forward to error handler
});

// error handler for all other errors
app.use(function (err, req, res, next) {
  res.status(err.status || 500); // set response status code

  // send response to client in JSON format with a message and stack trace
  res.json({
    type: "error",
    status: err.status,
    message: err.message,
    stack: req.app.get("env") === "development" ? err.stack : undefined,
  });
});

module.exports = app; // export the Express application
