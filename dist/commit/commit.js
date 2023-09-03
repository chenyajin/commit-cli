"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.commit = commit;
var _child_process = require("child_process");
var _path = _interopRequireDefault(require("path"));
var _fs = require("fs");
var _dedent = _interopRequireDefault(require("dedent"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
async function addAll(add) {
  return new Promise((resolve, reject) => {
    if (add) {
      (0, _child_process.exec)(`git add .`, () => {
        resolve();
      });
    } else {
      resolve();
    }
  });
}
/**
 * Asynchronously git commit at a given path with a message
 * @param {string} repoPath 当前执行目录
 * @param {boolean} add 是否添加到暂存区
 * @param {string} message 提交信息header(type、scope、subject)
 * @param {object} options
 * @param {function} done 回调函数
 */
function commit(repoPath, add, message, options, done) {
  addAll(add).then(() => {
    commitCore(repoPath, message, options, done);
  });
}
function commitCore(repoPath, message, options, done) {
  let called = false;
  if (!options.hookMode) {
    let args = ['commit', '-m', (0, _dedent.default)(message)];
    let child = (0, _child_process.spawn)('git', args);
    child.on('error', function (err) {
      if (called) return;
      called = true;
      done(err);
    });
    child.on('close', function (code, signal) {
      if (called) return;
      called = true;
      if (code) {
        if (code === 128) {
          console.warn(`
            Git exited with code 128. Did you forget to run:

              git config --global user.email "you@example.com"
              git config --global user.name "Your Name"
            `);
        }
        done(Object.assign(new Error(`git exited with error code ${code}`), {
          code,
          signal
        }));
      } else {
        done(null);
      }
    });
  } else {
    const gitDirPath = (0, _child_process.execSync)('git rev-parse --absolute-git-dir', {
      encoding: 'utf8'
    }).trim();
    const commitFilePath = _path.default.join(gitDirPath, 'COMMIT_EDITMSG');
    try {
      const fd = (0, _fs.openSync)(commitFilePath, 'w');
      try {
        (0, _fs.writeFileSync)(fd, (0, _dedent.default)(message));
        done(null);
      } catch (e) {
        done(e);
      } finally {
        (0, _fs.closeSync)(fd);
      }
    } catch (e) {
      // windows doesn't allow opening existing hidden files
      // in 'w' mode... but it does let you do 'r+'!
      try {
        const fd = (0, _fs.openSync)(commitFilePath, 'r+');
        try {
          (0, _fs.writeFileSync)(fd, (0, _dedent.default)(message));
          done(null);
        } catch (e) {
          done(e);
        } finally {
          (0, _fs.closeSync)(fd);
        }
      } catch (e) {
        done(e);
      }
    }
  }
}