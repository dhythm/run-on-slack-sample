import { ExecuteTestOnCiFunction } from "./definition.ts";
import { SlackAPI } from "deno-slack-api/mod.ts";
import { SlackFunction } from "deno-slack-sdk/mod.ts";
import { Buffer } from "https://deno.land/std/io/buffer.ts";
import executionTestHeaderBlocks from "./blocks.ts";

// Custom function that sends a message to the user's manager asking
// for approval for the time off request. The message includes some Block Kit with two
// interactive buttons: one to approve, and one to deny.
export default SlackFunction(
  ExecuteTestOnCiFunction,
  async ({ inputs, token, env }) => {
    console.log("Forwarding the following execution test:", inputs);
    const client = SlackAPI(token, {});

    // https://docs.github.com/en/rest/branches/branches#list-branches
    // https://api.slack.com/tutorials/tracks/create-github-issues-in-workflows
    const branchEndpoint = `https://api.github.com/repos/${env.GITHUB_ACCOUNT_NAME}/${env.GITHUB_REPOSITORY_NAME}/branches/${inputs.branch}`
    const branchResponse = await fetch(branchEndpoint, {
      method: "GET",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: "Bearer " + env.GITHUB_TOKEN,
        "Content-Type": "application/json",
      },
    })
    const branchStatus = branchResponse.status;
    if (branchStatus !== 200) {
      console.log("[ERROR] Branch is NOT found.", branchStatus);
      return {
        completed: true,
      }
    }

    const ciEndpoint = `https://circleci.com/api/v2/project/gh/${env.GITHUB_ACCOUNT_NAME}/${env.GITHUB_REPOSITORY_NAME}/pipeline`;
    const base64CiToken = btoa(env.CIRCLE_CI_TOKEN + ":")
    console.log(base64CiToken)

    const ciResponse = await fetch(ciEndpoint, {
      method: "POST",
      headers: {
        Authorization: `Basic ${base64CiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        branch: `${inputs.branch}`,
        parameters: { manual_execution: true },
      })
    })
    const ciStatus = ciResponse.status
    if (ciStatus !== 201) {
      console.log("[ERROR] Executing E2E test is failed.", ciResponse);
      return {
        completed: true,
      }
    }
    const ciResult = await ciResponse.json()
    const createdAt = ciResult?.['created_at'] ?? new Date(Date.now()).toISOString();

    // Create a block of Block Kit elements composed of several header blocks
    // plus the interactive approve/deny buttons at the end
    const blocks = executionTestHeaderBlocks({ ...inputs, createdAt });

    // Send the message to the manager
    const msgResponse = await client.chat.postMessage({
      channel: inputs.interactivity.interactor.id,
      blocks,
      // Fallback text to use when rich media can't be displayed (i.e. notifications) as well as for screen readers
      text: "Test starts to execute",
    });

    if (!msgResponse.ok) {
      console.log("Error during request chat.postMessage!", msgResponse.error);
      return {
        completed: true,
      }
    }

    return {
      completed: true,
    };
  },
);
