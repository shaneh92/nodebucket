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

// category schema
const categorySchema = {
  type: "object",
  properties: {
    categoryName: { type: "string" },
    backgroundColor: { type: "string" },
  },
  required: ["categoryName", "backgroundColor"],
  additionalProperties: false,
};

// define a scheme to validate a new task
const taskSchema = {
  type: "object",
  properties: {
    text: { type: "string" },
    category: categorySchema,
  },
  required: ["text", "category"],
  additionalProperties: false,
};
// our new tasks schema for adding tasks into done or todo, uses the category schema
const tasksSchema = {
  type: "object",
  required: ["todo", "done"],
  additionalProperties: false,
  properties: {
    todo: {
      type: "array",
      items: {
        type: "object",
        properties: {
          _id: { type: "string" },
          text: { type: "string" },
          category: categorySchema,
        },
        required: ["_id", "text", "category"],
        additionalProperties: false,
      },
    },
    done: {
      type: "array",
      items: {
        type: "object",
        properties: {
          _id: { type: "string" },
          text: { type: "string" },
          category: categorySchema,
        },
        required: ["_id", "text", "category"],
        additionalProperties: false,
      },
    },
  },
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

    // connection to mongo, to find collection of employees, then find one empId.
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
 *             category:
 *                type: object
 *                properties:
 *                 categoryName:
 *                    type: string
 *                 backgroundColor:
 *                    type: string
 *             required: text, category
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

      const { task } = req.body;

      console.log("New task: ", task);
      console.log("body", req.body);

      // validate the req object
      const validator = ajv.compile(taskSchema);
      const valid = validator(task);

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

      const newTask = {
        _id: new ObjectId(),
        text: task.text,
        category: task.category,
      };

      const result = await db
        .collection("employees")
        .updateOne({ empId }, { $push: { todo: newTask } });

      console.log("result", result);

      // if no result, throw an error 404
      if (!result.modifiedCount) {
        const err = new Error("unable to create task for empId ", empId);
        err.status = 404;
        console.log("err", err);
        next(err);
        return;
      }

      res.status(201).send({ id: newTask._id });
    }, next);
  } catch (err) {
    console.log("err", err);
    next(err);
  }
});

/**
 * updateTask
 * @openapi
 * paths:
 * /api/empId/tasks:
 *   put:
 *     tags:
 *       - employees
 *     name: updateTask
 *     description: API for updating a document to MongoDB Atlas
 *     summary: updates a task document
 *     paremeters:
 *     - in: path
 *       name: empId
 *      required: true
 *     schema:
 *     type: integer
 *     description: ID of employee
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *              todo:
 *              type: array
 *                items:
 *                  type: object
 *                  properties:
 *                    _id:
 *                      type: string
 *                    text:
 *                      type: string
 *             category:
 *                type: object
 *                properties:
 *                categoryName:
 *                    type: string
 *                 backgroundColor:
 *                    type: string
 *             category:
 *                type: object
 *                properties:
 *                categoryName:
 *                    type: string
 *                 backgroundColor:
 *                    type: string
 *             required: text, category
 *     responses:
 *       '204':
 *         description: Task updated successfully
 *       '400':
 *         description: Bad request
 *       '404':
 *         description: Not found
 *       '500':
 *         description: Server Error
 */

router.put("/:empId/tasks", (req, res, next) => {
  try {
    let { empId } = req.params;
    empId = parseInt(empId, 10);

    // if not a number, throw an error 400
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

      // if its not a valid employee, throw an error 404
      if (!employee) {
        const err = new Error("unable to find employee with empId " + empId);
        err.status = 404;
        console.log("err", err);
        next(err);
        return;
      }

      const tasks = req.body;
      console.log("tasks", tasks);

      const validator = ajv.compile(tasksSchema);
      const valid = validator(tasks);
      console.log("valid", valid);

      // if its not valid, throw an error 400
      if (!valid) {
        const err = new Error("bad request");
        err.status = 400;
        err.errors = validator.errors;
        console.log("req.body validation failed", err);
        next(err);
        return;
      }

      // update the employee document
      const result = await db
        .collection("employees")
        .updateOne({ empId }, { $set: { todo: tasks.todo, done: tasks.done } });
      console.log("result", result);

      // if no result, throw an error 404
      if (!result.modifiedCount) {
        const err = new Error("unable to update tasks for empId " + empId);
        err.status = 404;
        console.log("err", err);
        next(err);
        return;
      }
      res.status(204).send();
    }, next);
  } catch (err) {
    console.log("err", err);
    next(err);
  }
});

/**
 * deleteTasks
 * @openapi
 * paths:
 * /{empId}/tasks/{taskId}:
 *   delete:
 *     summary: Delete a task for an employee
 *     parameters:
 *       - in: path
 *         name: empId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the employee
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the task to be deleted
 */

router.delete("/:empId/tasks/:taskId", (req, res, next) => {
  console.log("inside the delete tasks function");

  // try catch block
  try {
    let { empId } = req.params;
    const { taskId } = req.params;

    console.log(`EmpId: ${empId}, taskId: ${taskId}`);

    empId = parseInt(empId, 10);

    // if not a number, throw an error 400
    if (isNaN(empId)) {
      const err = new Error("input must be a number");
      err.status = 400;
      console.log("err", err);
      next(err);
      return;
    }

    // connects to mongo, finds collection of employees, then finds one employee by empId
    mongo(async (db) => {
      let emp = await db.collection("employees").findOne({ empId });

      console.log("emp", emp);

      // if its not a valid employee, throw an error 404
      if (!emp) {
        const err = new Error("unable to find employee with empId " + empId);
        err.status = 404;
        console.log("err", err);
        next(err);
        return;
      }
      // Chris asked a very important question in teams which resulted in this change to allow for an empty array written by Prof Krasso
      if (!emp.todo) emp.todo = []; //if todo array is null
      if (!emp.done) emp.done = []; //if done array is null

      // filters out our value, and if value doesn't exist it will just produce an array of the the values that do exist
      // prettier-ignore
      const todoItems = emp.todo.filter(task => task._id.toString() !== taskId.toString());

      // prettier-ignore
      const doneItems = emp.done.filter(task => task._id.toString() !== taskId.toString());

      console.log(`Todo item: ${todoItems}; Done item: ${doneItems}`);
      // sets our array to the appropriate value

      // update the employee document
      // prettier-ignore
      const result = await db.collection("employees").updateOne(
          { 'empId': empId },
          { $set: { todo: todoItems, done: doneItems } }
        );
      console.log("result", result);

      res.status(204).send();
    }, next);
  } catch {
    console.log("err", err);
    next(err);
  }
});

// exporting router module
module.exports = router;
