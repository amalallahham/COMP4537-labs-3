'use strict';
const path = require('path');
const greeting = require(path.join('..', 'lang', 'en', 'greeting'));

class Utils {
  static getDate() {
    return new Date().toString();
  }

  static greet(name) {
    const tpl = greeting.greetingWithDatePrefix || 'Hello %1';
    return tpl.replace('%1', name || 'No Name Provided');
  }

  static isInsideDir(baseDir, targetPath) {
    const rel = path.relative(baseDir, targetPath);
    return !!rel && !rel.startsWith('..') && !path.isAbsolute(rel);
  }

  static escapeHtml(str) {
    return String(str)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }
}

module.exports = { Utils };
