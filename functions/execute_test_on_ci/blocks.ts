// deno-lint-ignore no-explicit-any
export default function executionTestHeaderBlocks(inputs: any): any[] {
  return [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: `E2E test has been executed`,
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Interactor:* <@${inputs.interactivity.interactor.id}>`,
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Execution Date:* ${Date.now().toString()}`,
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Reason:* ${inputs.reason ? inputs.reason : "N/A"}`,
      },
    },
  ];
}


