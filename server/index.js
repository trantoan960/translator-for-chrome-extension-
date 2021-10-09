const cors = require("cors");
const express = require("express");
const translate = require("@vitalets/google-translate-api");

const app = express();

app.use(cors());

app.get("/", function (req, res) {
  res.send("API running...");
});

app.get("/api/translator", async function (req, res) {
  const keywords = req.query.keywords; // hello
  const input = req.query.input; // en
  const output = req.query.output; // vi

  if (keywords && input && output) {
    const result = await translate(keywords, { from: input, to: output });

    console.log(result);
    if (result.text && result.text.length > 0)
      return res.status(200).json(result);
    return res.status(401).json({ message: "Failed" });
  }
});

app.listen(3000, function () {
  console.log("Success running on port 3000");
});
