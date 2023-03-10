import { Trigger } from "deno-slack-api/types.ts";

// const trigger: Trigger = {
//   type: "shortcut",
//   name: "Request Time Off",
//   description: "Ask your manager for some time off",
//   workflow: "#/workflows/create_time_off",
//   inputs: {
//     interactivity: {
//       value: "{{data.interactivity}}",
//     },
//   },
// };
const trigger: Trigger = {
  type: "shortcut",
  name: "Execute Test",
  description: "Execute E2E test on CI",
  // workflow: "#/workflows/create_time_off",
  workflow: "#/workflows/execute_test",
  inputs: {
    interactivity: {
      value: "{{data.interactivity}}",
    },
  },
};

export default trigger;
