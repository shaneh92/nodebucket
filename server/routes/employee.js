/**
 * Title: employee.js
 * Author: Shane Hingtgen
 * Date: 8/14/23
 */

"user strict";

// imports
const express = require("express");
const router = express.Router();
const { mongo } = require("../utils/mongo");
const Ajv = require("ajv");
const { ObjectId } = require("mongodb");

const ajv = new Ajv(); //creates a new instance of Ajv class

// define a scheme to validate a new task
// TODO: Figure out why this is not preventing additional properties
// TODO: as of now it is allowing us to send a second property of bar.

const taskSchema = {
  type: "object",
  properties: {
    text: {
      type: "string",
    },
  },
  required: ["text"],
  additionalProperties: false,
};

/**
 * findEmployeeById
 * @openapi
 * /api/employees/{empId}:
 *   get:
 *     tags:
 *       - Employees
 *     description:  API for returning an employee document
 *     summary: returns an employee document
 *     parameters:
 *       - name: empId
 *         in: path
 *         required: true
 *         description: employee document id
 *         schema:
 *           type: number
 *     responses:
 *       '200':
 *         description: Employee document found
 *       '400':
 *         description: Bad request
 *       '404':
 *         description: Not found
 *       '500':
 *         description: Server Error
 */

router.get("/:empId", (req, res, next) => {
  try {
    let { empId } = req.params; //get the empId from the req.params object
    empId = parseInt(empId, 10); // try to determine if empId is numerical value

    //an early return method
    if (isNaN(empId)) {
      // if empId is not a number
      const err = new Error("input must be a number");
      err.status = 400;
      console.log("err", err);
      next(err);
      return;
    }

    mongo(
      async (db) => {
        const employee = await db.collection("employees").findOne({ empId }); //find employee by ID

        //another early return method
        if (!employee) {
          // if empId does not exist
          const err = new Error("Unable to find employee with empId ", empId);
          err.status = 404;
          console.log("err", err);
          next(err);
          return;
        }

        res.send(employee);
      },
      // err handling
      next
    );
  } catch (err) {
    console.log("err", err);
    next(err);
  }
});

/**
 * findAllTasks
 * @openapi
 * /api/empId:
 *   get:
 *     tags:
 *       - Employees
 *     description: API for returning an array of employee objects.
 *     summary: returns an array of employees in JSON format.
 *     responses:
 *       '200':
 *         description: Employee document found
 *       '400':
 *         description: Bad request
 *       '404':
 *         description: Not found
 *       '500':
 *         description: Server Error
 */

router.get("/:empId/tasks", (req, res, next) => {
  try {
    console.log("findAllTasks API");
    let { empId } = req.params; //get the empId from the req.params object
    empId = parseInt(empId, 10); // try to determine if empId is numerical value

    if (isNaN(empId)) {
      const err = new Error("input must be a number");
      err.status = 400;
      console.log("err", err);
      next(err);
      return;
    }

    // connection to mongo, to find collection, then find one empId.
    mongo(async (db) => {
      const tasks = await db
        .collection("employees")
        .findOne({ empId }, { projection: { empId: 1, todo: 1, done: 1 } });
      console.log("tasks", tasks);

      if (!tasks) {
        const err = new Error("unable to find tasks for empId ", empId);
        err.status = 404;
        console.log("err", err);
        next(err);
        return;
      }

      res.send(tasks); //return the tasks array
    }, next);
  } catch (err) {
    console.log("err", err);
    next(err);
  }
});

/**
 * createTask
 * @openapi
 * /api/empId/tasks:
 *   post:
 *     tags:
 *       - Employees
 *     name: createTask
 *     description: API for adding a new task document to MongoDB Atlas
 *     summary: Creates a new task document
 *     requestBody:
 *       description: Composer information
 *       content:
 *         application/json:
 *           schema:
 *             required:
 *               - empId
 *             properties:
 *              type: object
 *                text:
 *                  type: string
 *     responses:
 *       '200':
 *         description: Employee document found
 *       '400':
 *         description: Bad request
 *       '404':
 *         description: Not found
 *       '500':
 *         description: Server Error
 */

router.post("/:empId/tasks", (req, res, next) => {
  try {
    console.log("createTask API");

    let { empId } = req.params; //get the empId from the req.params object
    empId = parseInt(empId, 10); // try to determine if empId is numerical value

    if (isNaN(empId)) {
      const err = new Error("input must be a number");
      err.status = 400;
      console.log("err", err);
      next(err);
      return;
    }

    // connects to mongo, finds collection of employees, then finds one employee by empId
    mongo(async (db) => {
      const employee = await db.collection("employees").findOne({ empId });

      console.log("employee", employee);

      // if not employee found with empId error 404
      if (!employee) {
        const err = new Error("unable to find employee with empId ", empId);
        err.status = 404;
        console.log("err", err);
        return;
      }

      const { text } = req.body;
      console.log("req.body", req.body);

      // validate the req object
      const validator = ajv.compile(taskSchema);
      const valid = validator({ text });

      console.log("valid", valid);

      // if its not valid, throw an error 400
      if (!valid) {
        const err = new Error("Bad Request");
        err.status = 400;
        err.errors = validator.errors;
        console.log("req.body validation failed", err);
        next(err);
        return;
      }

      const task = {
        _id: new ObjectId(),
        text,
      };

      const result = await db
        .collection("employees")
        .updateOne({ empId }, { $push: { todo: task } });

      console.log("result", result);

      // if no result, throw an error 404
      if (!result.modifiedCount) {
        const err = new Error("unable to create task for empId ", empId);
        err.status = 404;
        console.log("err", err);
        next(err);
        return;
      }

      res.status(201).send({ id: task._id });
    }, next);
  } catch (err) {
    console.lofindg("err", err);
    next(err);
  }
});

// exporting router module
module.exports = router;
