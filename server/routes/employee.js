/**
 * Title: employee.js
 * Author: Shane Hingtgen
 * Date: 8/14/23
 */

"user strict";

const express = require("express");
const router = express.Router();
const { mongo } = require("../utils/mongo");

/**
 * findEmployeeById
 * @openapi
 * /api/employees/{empId}:
 *   get:
 *     tags:
 *       - Employees
 *     description: API for returning employees by Id.
 *     summary: returns employees by id in JSON format.
 *     responses:
 *       '200':
 *         description: Employee by Id.
 *       '400':
 *        description: Bad Request.
 *       '404':
 *         description: Not Found.
 *       '500':
 *         description: Server Exception.
 *       '501':
 *         description: MongoDB Exception.
 */

router.get("/:empId", (req, res, next) => {
  try {
    let { empId } = req.params; //get the empId from the req.params object
    empId = parseInt(empId, 10); // try to determine if empId is numerical value

    if (isNaN(empId)) {
      // if empId is not a number
      const err = new Error("input must be a number");
      err.status = 400;
      console.log("err", err);
      next(err);
      return;
    }

    mongo(async (db) => {
      const employee = await db.collection("employees").findOne({ empId }); //find employee by ID

      if (!employee) {
        // if empId does not exist
        const err = new Error("Unable to find employee with empId ", empId);
        err.status = 404;
        console.log("err", err);
        next(err);
        return;
      }

      res.send(employee);
    }, next);
  } catch (err) {
    console.log("err", err);
    next(err);
  }
});

module.exports = router;
