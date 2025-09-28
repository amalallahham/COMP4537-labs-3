const express = require("express");
const greeting = require("./lang/en/greeting");
const { getDate } = require("./modules/utils");
const app = express();
const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "file.txt");


app.get("/getDate", (req, res) => {
  const name = req.query.name || "No Name Provided";
  const prefix = greeting.greetingWithDatePrefix.replace("%1", name);
  const now = getDate();

  res.send(`
        <div style="text-align: center; font-family: Arial, sans-serif;">
            <p style="color: blue; font-weight: bold; font-size: 1.2em;">
          ${prefix} <em> ${now}</em>
        </p>
        </div>
    `);
});


app.get("/writeFile", (req, res) => {
  const text = req.query.text;

  if (!text) {
    return res.status(400).send("Please provide ?text=something");
  }
  
   fs.appendFile(filePath, text + "\n", (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error writing to file");
    }
    res.send(`Text "${text}" appended to file.txt`);
  });
});

app.get("/readFile/:filename", (req, res) => {
  const filename = req.params.filename;
  const requestedPath = path.join(__dirname, filename);

  fs.readFile(requestedPath, "utf8", (err, data) => {
    if (err) {
      if (err.code === "ENOENT") {
        return res
          .status(404)
          .send(`Error 404: File "${filename}" does not exist`);
      }
      return res.status(500).send("Error reading file");
    }

    res.send(`<pre>${data}</pre>`);
  });
});




const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
