import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { ExecuteTestOnCiFunction } from "../functions/execute_test_on_ci/definition.ts";

/**
 * A Workflow composed of two steps: asking for time off details from the user
 * that started the workflow, and then forwarding the details along with two
 * buttons (approve and deny) to the user's manager.
 */
export const ExecuteTestOnCiWorkflow = DefineWorkflow({
  callback_id: "execute_test",
  title: "Execute Test on CI",
  description:
    "Execute E2E test on CI environement",
  input_parameters: {
    properties: {
      interactivity: {
        type: Schema.slack.types.interactivity,
      },
    },
    required: ["interactivity"],
  },
});

// Step 1: opening a form.
const formData = ExecuteTestOnCiWorkflow.addStep(
  Schema.slack.functions.OpenForm,
  {
    title: "Test Details",
    interactivity: ExecuteTestOnCiWorkflow.inputs.interactivity,
    submit_label: "Submit",
    description: "Enter executing test details",
    fields: {
      required: ["branch"],
      elements: [
        {
          name: "branch",
          title: "Branch",
          type: Schema.types.string,
          enum: ["main"],
          choices: [
            { value: "main", title: "main" },
          ]
        },
        {
          name: "reason",
          title: "Reason",
          type: Schema.types.string,
        },
      ],
    },
  },
);

// Step 2: execute a test.
ExecuteTestOnCiWorkflow.addStep(ExecuteTestOnCiFunction, {
  interactivity: formData.outputs.interactivity,
  interactor: ExecuteTestOnCiWorkflow.inputs.interactivity.interactor.id,
  branch: formData.outputs.fields.branch,
  reason: formData.outputs.fields.reason,
});

