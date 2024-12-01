require("dotenv").config();

const http = require("http");
const fs = require("fs");
const path = require("path");

const correctCombination = JSON.parse(process.env.CORRECT_COMBINATION);

http
  .createServer((req, res) => {
    if (req.method === "GET" && req.url === "/") {
      // Serve the HTML file
      const filePath = path.join(__dirname, "index.html");
      fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
          res.writeHead(500, { "Content-Type": "text/plain" });
          res.end("Error loading the page.");
        } else {
          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(data);
        }
      });
    } else if (req.method === "POST" && req.url === "/validate-lock") {
      // Handle combination validation
      let body = "";

      req.on("data", (chunk) => {
        body += chunk.toString();
      });

      req.on("end", () => {
        const parsedBody = JSON.parse(body);
        const userCombination = parsedBody.combination;

        const success =
          JSON.stringify(userCombination) ===
          JSON.stringify(correctCombination);
        const message = success
          ? "You unlocked the lock!"
          : "The combination is incorrect. Try again.";

        res.writeHead(200, {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        });
        res.end(
          JSON.stringify({
            success,
            message,
            enteredCombination: userCombination,
          })
        );
      });
    } else if (req.method === "GET" && req.url.startsWith("/static/")) {
      // Serve static files (e.g., CSS, JS)
      const filePath = path.join(__dirname, req.url);
      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(404, { "Content-Type": "text/plain" });
          res.end("File not found.");
        } else {
          const ext = path.extname(filePath);
          const mimeType =
            {
              ".css": "text/css",
              ".js": "application/javascript",
            }[ext] || "text/plain";

          res.writeHead(200, { "Content-Type": mimeType });
          res.end(data);
        }
      });
    } else {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("404: Not Found");
    }
  })
  .listen(5000, () =>
    console.log("Server is running on http://localhost:5000")
  );
