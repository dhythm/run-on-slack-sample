import { DefineFunction, Schema } from 'deno-slack-sdk/mod.ts'

export const ExecuteTestOnCiFunction = DefineFunction({
  callback_id: "execute_test_on_ci",
  title: "Execute Test on CI",
  description: "Execute E2E test on CI",
  source_file: "functions/execute_test_on_ci/mod.ts",
  input_parameters: {
    properties: {
      interactivity: {
        type: Schema.slack.types.interactivity,
      },
      branch: {
        type: Schema.types.string,
        description: "Which branch do you want to execute test?",
      },
      reason: {
        type: Schema.types.string,
        description: "The reason for the time off request",
      },
    },
    required: [
      "branch",
      "interactivity",
    ],
  },
  output_parameters: {
    properties: {},
    required: [],
  },
})

