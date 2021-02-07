import express from "express";

const app = express();

app.listen(5000, () => {
  console.log("Server is litening at http://localhost:5000");
});

app.get("/", function (req, res) {
  res.send("Server is running");
});
