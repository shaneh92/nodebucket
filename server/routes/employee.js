/**
 * Title: employee.js
 * Author: Shane Hingtgen
 * Date: 8/14/23
 */

"user strict";

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
 *
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

    mongo(async (db) => {
      const employee = await db.collection("employees").findOne({ empId });

      console.log("employee", employee);

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
    console.log("err", err);
    next(err);
  }
});
module.exports = router;
