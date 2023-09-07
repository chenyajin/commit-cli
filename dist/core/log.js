"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.log = log;
var _child_process = require("child_process");
/*
 * @Author: ChenYaJin
 * @Date: 2023-09-04 09:15:17
 * @LastEditors: ChenYaJin
 * @LastEditTime: 2023-09-04 09:48:03
 * @Description: 
 */

/**
 * Asynchronously gets the git log output
 */
function log(repoPath, done) {
  (0, _child_process.exec)('git log -1', {
    maxBuffer: Infinity,
    cwd: repoPath
  }, function (error, stdout, stderr) {
    if (error) {
      throw error;
    }
    done(stdout);
  });
}