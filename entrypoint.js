const axios = require("axios");
const fs = require("fs");
const _ = require("lodash");
const { argv } = require("yargs");

const REQUIRED_ENV_VARS = [
  "GITHUB_EVENT_PATH",
  "GITHUB_REPOSITORY",
  "GITHUB_WORKFLOW",
  "GITHUB_ACTOR",
  "GITHUB_EVENT_NAME",
  "GITHUB_ACTION",
  "DISCORD_WEBHOOK",
];

process.env.GITHUB_ACTION =
  process.env.GITHUB_ACTION || "<missing GITHUB_ACTION env var>";

REQUIRED_ENV_VARS.forEach((env) => {
  if (!process.env[env] || !process.env[env].length) {
    console.error(
      `Env var ${env} is not defined. Maybe try to set it if you are running the script manually.`
    );
    process.exit(1);
  }
});

const eventContent = fs.readFileSync(process.env.GITHUB_EVENT_PATH, "utf8");

_.templateSettings.interpolate = /{{([\s\S]+?)}}/g;

let url;
let payload;

if (argv._.length === 0 && !process.env.DISCORD_EMBEDS) {
  // If argument and embeds NOT provided, let Discord show the event informations.
  url = `${process.env.DISCORD_WEBHOOK}/github`;
  payload = JSON.stringify(JSON.parse(eventContent));
} else {
  // Otherwise, if the argument or embeds are provided, let Discord override the message.
  const args = argv._.join(" ");
  const message = _.template(args)({
    ...process.env,
    EVENT_PAYLOAD: JSON.parse(eventContent),
  });

  let embedsObject;
  if (process.env.DISCORD_EMBEDS) {
    try {
      embedsObject = JSON.parse(process.env.DISCORD_EMBEDS);
    } catch (parseErr) {
      console.error("Error parsing DISCORD_EMBEDS :" + parseErr);
      process.exit(1);
    }
  }

  url = process.env.DISCORD_WEBHOOK;
  payload = JSON.stringify({
    content: message,
    ...(process.env.DISCORD_EMBEDS && { embeds: embedsObject }),
    ...(process.env.DISCORD_USERNAME && {
      username: process.env.DISCORD_USERNAME,
    }),
    ...(process.env.DISCORD_AVATAR && {
      avatar_url: process.env.DISCORD_AVATAR,
    }),
  });
}

// curl -X POST -H "Content-Type: application/json" --data "$(cat $GITHUB_EVENT_PATH)" $DISCORD_WEBHOOK/github

async function validateSubscription() {
  let repoPrivate;
  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (eventPath && fs.existsSync(eventPath)) {
    const payload = JSON.parse(fs.readFileSync(eventPath, "utf8"));
    repoPrivate = payload?.repository?.private;
  }

  const upstream = "Ilshidur/action-discord";
  const action = process.env.GITHUB_ACTION_REPOSITORY;
  const docsUrl =
    "https://docs.stepsecurity.io/actions/stepsecurity-maintained-actions";

  console.info("");
  console.info("\u001b[1;36mStepSecurity Maintained Action\u001b[0m");
  console.info(`Secure drop-in replacement for ${upstream}`);
  if (repoPrivate === false)
    console.info("\u001b[32m\u2713 Free for public repositories\u001b[0m");
  console.info(`\u001b[36mLearn more:\u001b[0m ${docsUrl}`);
  console.info("");

  if (repoPrivate === false) return;
  const serverUrl = process.env.GITHUB_SERVER_URL || "https://github.com";
  const body = { action: action || "" };

  if (serverUrl !== "https://github.com") body.ghes_server = serverUrl;
  try {
    await axios.post(
      `https://agent.api.stepsecurity.io/v1/github/${process.env.GITHUB_REPOSITORY}/actions/maintained-actions-subscription`,
      body,
      { timeout: 3000 },
    );
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 403) {
      console.error(
        `\u001b[1;31mThis action requires a StepSecurity subscription for private repositories.\u001b[0m`,
      );
      console.error(
        `\u001b[31mLearn how to enable a subscription: ${docsUrl}\u001b[0m`,
      );
      process.exit(1);
    }
    console.info("Timeout or API not reachable. Continuing to next step.");
  }
}

(async () => {
  await validateSubscription();

  console.log("Sending message ...");
  await axios.post(`${url}?wait=true`, payload, {
    headers: {
      "Content-Type": "application/json",
      "X-GitHub-Event": process.env.GITHUB_EVENT_NAME,
    },
  });
  console.log("Message sent ! Shutting down ...");
  process.exit(0);
})().catch((err) => {
  console.error("Error :", err.response.status, err.response.statusText);
  console.error("Message :", err.response ? err.response.data : err.message);
  process.exit(1);
});
