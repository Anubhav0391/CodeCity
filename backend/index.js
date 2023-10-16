const express = require("express");
const OpenAI = require("openai");
const cors = require("cors");
const simpleGit = require("simple-git");
const fs = require("fs");
require("dotenv").config();

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.API_KEY });

app.get("/github-callback", async (req, res) => {
  const code = req.query.code;
  console.log(code);
  const params =
    "?client_id=" +
    CLIENT_ID +
    "&client_secret=" +
    CLIENT_SECRET +
    "&code=" +
    code;

  await fetch("https://github.com/login/oauth/access_token" + params, {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
  })
    .then((resp) => resp.json())
    .then((data) => {
      res.json(data);
      console.log(data);
    });
});

app.post("/push", async (req, res) => {
  try {
    const {
      accessToken,
      branchName,
      fileContent,
      fileName,
      owner,
      repo,
      commitMessage,
    } = req.body;

    // Set up the git instance
    const git = simpleGit();
    console.log({
      accessToken,
      branchName,
      fileContent,
      fileName,
      owner,
      repo,
      commitMessage,
    });
    // Clone the repository
    await git.clone(
      `https://${accessToken}@github.com/${owner}/${repo}.git`,
      "./temp-folder"
    );
    console.log("cloned");
    // Write the file content to the specified file name
    const filePath = `./temp-folder/${fileName}`;
    fs.writeFileSync(filePath, fileContent, "utf8");
    console.log("file written");
    // Set the working directory to the cloned repository
    git.cwd("./temp-folder");

    // Stage and commit the file
    await git.add(fileName);
    await git.commit(commitMessage);
    console.log("file added");
    // Push the changes to the specified branch
    await git.push("origin", branchName);
    console.log("file pushed");
    // Clean up the temporary folder
    fs.rmdirSync("./temp-folder", { recursive: true });

    res.status(200).json({ message: "File pushed to repository successfully" });
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({
        error: "An error occurred while pushing the file to the repository",
      });
  }
});

app.get("/client_id", async (req, res) => {
  res.send(CLIENT_ID);
});

app.post("/run", async (req, res) => {
  const { inp_code } = req.body;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "Your task is to give the output of the given code (inp_code).",
        },
        {
          role: "user",
          content: `inp_code : ${inp_code}`,
        },
      ],
      temperature: 0.7,
    });

    res.status(200).send(completion.choices[0].message.content);
  } catch (error) {
    res.status(400).send({
      error,
    });
  }
});

app.post("/convert", async (req, res) => {
  const { inp_code, out_lang } = req.body;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `Your task is to convert the code (inp_code) into aother language (out_lang).`,
        },
        {
          role: "user",
          content: `out_lang : ${out_lang} \n inp_code : ${inp_code}`,
        },
      ],
      temperature: 0.7,
    });

    res.status(200).send(completion.choices[0].message.content);
  } catch (error) {
    res.status(400).send({
      error,
    });
  }
});

app.post("/debug", async (req, res) => {
  const { inp_code } = req.body;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "Your task is to debug the code (inp_code) and give the output in the format delimated in angular brackets <Explain the bug in first line \n Here is the correct code : \n ``` \n correct code here \n ```>",
        },
        {
          role: "user",
          content: `inp_code : ${inp_code}`,
        },
      ],
      temperature: 0.7,
    });

    res.status(200).send(completion.choices[0].message.content);
  } catch (error) {
    res.status(400).send({
      error,
    });
  }
});

app.post("/quality", async (req, res) => {
  const { inp_code } = req.body;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "Your task is to check the quality of the code (inp_code) on various parameters and give the suggestion for quality improvement.",
        },
        {
          role: "user",
          content: `inp_code : ${inp_code}`,
        },
      ],
      temperature: 0.7,
    });

    res.status(200).send(completion.choices[0].message.content);
  } catch (error) {
    res.status(400).send({
      error,
    });
  }
});

app.listen(8080, () => {
  console.log(`Server listening on port 8080`);
});
