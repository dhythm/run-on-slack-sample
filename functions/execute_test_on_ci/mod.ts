import { ExecuteTestOnCiFunction } from "./definition.ts";
import { SlackAPI } from "deno-slack-api/mod.ts";
import { SlackFunction } from "deno-slack-sdk/mod.ts";
import { Buffer } from "https://deno.land/std/io/buffer.ts";
import executionTestHeaderBlocks from "./blocks.ts";
import { Octokit } from 'https://cdn.skypack.dev/octokit';

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
    console.log('--------------------\n' + JSON.stringify(blocks) + '\n--------------------')

    const url = `https://circleci.com/api/v2/project/gh/${env.GITHUB_ACCOUNT_NAME}/${env.GITHUB_REPOSITORY_NAME}/pipeline`;
    const data = {
      branch: `${inputs.branch}`,
      parameters: { manual_execution: true },
    }
    const encodedCiToken = new Buffer(new TextEncoder().encode(env.CIRCLE_CI_TOKEN + ":")).toString('base64');

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${encodedCiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data)
    })
    console.log('--------------------\n' + JSON.stringify(res) + '\n--------------------')

    // https://docs.github.com/en/rest/branches/branches#list-branches
    const octokit = new OctoKit({
      auth: env.GITHUB_TOKEN,
    })
    const branches = await octokit.request(`GET /repos/${env.GITHUB_ACCOUNT_NAME}/${env.GITHUB_REPOSITORY_NAME}/branches`, {
      owner: env.GITHUB_ACCOUNT_NAME,
      repo: env.GITHUB_REPOSITORY_NAME,
    })
    console.log('--------------------\n' + JSON.stringify(branches) + '\n--------------------')

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
