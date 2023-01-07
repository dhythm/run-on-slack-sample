import { ExecuteTestOnCiFunction } from "./definition.ts";
import { SlackAPI } from "deno-slack-api/mod.ts";
import { SlackFunction } from "deno-slack-sdk/mod.ts";
import { Buffer } from "https://deno.land/std/io/buffer.ts";
import executionTestHeaderBlocks from "./blocks.ts";
import { CIRCLE_CI_TOKEN, GITHUB_ACCOUNT_NAME, GITHUB_REPOSITORY_NAME } from "./secrets.ts";

// Custom function that sends a message to the user's manager asking
// for approval for the time off request. The message includes some Block Kit with two
// interactive buttons: one to approve, and one to deny.
export default SlackFunction(
  ExecuteTestOnCiFunction,
  async ({ inputs, token }) => {
    console.log("Forwarding the following execution test:", inputs);
    const client = SlackAPI(token, {});

    // Create a block of Block Kit elements composed of several header blocks
    // plus the interactive approve/deny buttons at the end
    const blocks = executionTestHeaderBlocks(inputs);

    const url = `https://circleci.com/api/v2/project/gh/${GITHUB_ACCOUNT_NAME}/${GITHUB_REPOSITORY_NAME}/pipeline`;
    const data = {
      branch: `${inputs.branch}`,
      parameters: { manual_execution: true },
    }
    const encodedCiToken = new Buffer(new TextEncoder().encode(CIRCLE_CI_TOKEN + ":")).toString('base64');

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${encodedCiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data)
    })
    console.log({ ...blocks })
    console.log({ ...res })

    // Send the message to the manager
    const msgResponse = await client.chat.postMessage({
      channel: inputs.manager,
      blocks,
      // Fallback text to use when rich media can't be displayed (i.e. notifications) as well as for screen readers
      text: "execution test has been submitted",
    });

    if (!msgResponse.ok) {
      console.log("Error during request chat.postMessage!", msgResponse.error);
    }

    // IMPORTANT! Set `completed` to false in order to keep the interactivity
    // points (the approve/deny buttons) "alive"
    // We will set the function's complete state in the button handlers below.
    return {
      completed: false,
    };
  },
);
