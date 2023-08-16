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
 * Description: Accept values 1007-1012
 * @example
 * localhost:3000/api/employees/1007 - 200 Success
 * localhost:3000/api/employees/asdf - 400 Bad Request
 * localhost:3000/api/employees/1016 - 404 Not Found
 * localhost:3000/api/employees/1008 - 500 Server Error (DB not connected)
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
