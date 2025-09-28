"use strict";

const http = require("http");
const url = require("url");
const fs = require("fs");
const path = require("path");
const { Utils } = require("./modules/utils");

class AppServer {
  constructor({ port = 3000, baseDir = __dirname } = {}) {
    this.port = port;
    this.baseDir = baseDir;
    this.filePath = path.join(this.baseDir, "file.txt");
    this.server = http.createServer(this.handleRequest.bind(this));
  }

  start() {
    this.server.listen(this.port, () => {
      console.log(`Server is running at http://localhost:${this.port}`);
    });
  }

  async handleRequest(req, res) {
    const { pathname, query } = url.parse(req.url, true);
    try {
      if (req.method !== "GET")
        return this.respond(res, 405, "Method Not Allowed");

      if (pathname.includes("/getDate")) return this.routeGetDate(res, query);
      if (pathname.includes("/writeFile"))
        return this.routeWriteFile(res, query);

        const readMatch = pathname.match(/^\/readFile\/([^/]+)$/);
        if (readMatch) return this.routeReadFile(res, readMatch[1]);

      return this.respond(res, 404, "Not Found");
    } catch (err) {
      console.error(err);
      return this.respond(res, 500, "Internal Server Error");
    }
  }

  routeGetDate(res, query) {
    const name = (query.name || "No Name Provided").toString();
    const prefix = Utils.greet(name);
    const now = Utils.getDate();

    const html = `
      <div style="text-align:center; font-family: Arial, sans-serif;">
        <p style="color: blue; font-weight: bold; font-size: 1.2em;">
          ${Utils.escapeHtml(prefix)} <em>${Utils.escapeHtml(now)}</em>
        </p>
      </div>
    `;
    this.respond(res, 200, html, "text/html; charset=utf-8");
  }

  routeWriteFile(res, query) {
    const text = query.text;
    if (!text) return this.respond(res, 400, "Please provide ?text=something");
    console.log(this.filePath);
    fs.appendFile(this.filePath, text + "\n", (err) => {
      if (err) {
        console.error(err);
        return this.respond(res, 500, "Error writing to file");
      }
      this.respond(res, 200, `Text "${text}" appended to file.txt`);
    });
  }

  routeReadFile(res, requestedName) {
    const safeName = path.basename(requestedName);
    const requestedPath = path.join(this.baseDir, safeName);

    if (!Utils.isInsideDir(this.baseDir, requestedPath)) {
      return this.respond(res, 400, "Invalid filename");
    }

    fs.readFile(requestedPath, "utf8", (err, data) => {
      if (err) {
        if (err.code === "ENOENT") {
          return this.respond(
            res,
            404,
            `Error 404: File "${safeName}" does not exist`
          );
        }
        return this.respond(res, 500, "Error reading file");
      }
      const html = `<pre>${Utils.escapeHtml(data)}</pre>`;
      this.respond(res, 200, html, "text/html; charset=utf-8");
    });
  }

  respond(res, status, body, contentType = "text/plain; charset=utf-8") {
    res.writeHead(status, { "Content-Type": contentType });
    res.end(body);
  }
}

new AppServer({ port: process.env.PORT ? Number(process.env.PORT) : 3000 }).start();
