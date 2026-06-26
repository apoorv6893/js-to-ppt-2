const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const os = require("os");
const { execFile } = require("child_process");

const app = express();
const PORT = process.env.PORT || 3000;

const upload = multer({
  storage: multer.memoryStorage()
});

app.use(express.static("public"));

app.get("/health", (req, res) => {
  res.json({
    status: "ok"
  });
});

app.post("/generate", upload.single("script"), async (req, res) => {

  if (!req.file) {
    return res.status(400).json({
      error: "No JavaScript file uploaded."
    });
  }

  const jobDir = fs.mkdtempSync(
    path.join(os.tmpdir(), "ppt-")
  );

  const inputFile = path.join(jobDir, "input.js");
  const outputFile = path.join(jobDir, "output.pptx");

  fs.writeFileSync(
    inputFile,
    req.file.buffer
  );

  execFile(
    "node",
    [
      path.join(__dirname, "generator.js"),
      inputFile,
      outputFile
    ],
    {
      cwd: jobDir
    },
    (error, stdout, stderr) => {

      if (error) {

        fs.rmSync(jobDir, {
          recursive: true,
          force: true
        });

        return res.status(500).json({
          error: stderr || error.message
        });
      }

      if (!fs.existsSync(outputFile)) {

        fs.rmSync(jobDir, {
          recursive: true,
          force: true
        });

        return res.status(500).json({
          error: "PowerPoint was not generated."
        });
      }

      res.download(
        outputFile,
        "presentation.pptx",
        () => {

          fs.rmSync(jobDir, {
            recursive: true,
            force: true
          });

        }
      );

    }
  );

});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
