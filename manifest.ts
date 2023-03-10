import { Manifest } from "deno-slack-sdk/mod.ts";
import { ExecuteTestOnCiFunction } from "./functions/execute_test_on_ci/definition.ts";
import { ExecuteTestOnCiWorkflow } from "./workflows/ExecuteTestOnCiWorkflow.ts";
// import { CreateTimeOffRequestWorkflow } from "./workflows/CreateTimeOffRequestWorkflow.ts";
// import { SendTimeOffRequestToManagerFunction } from './functions/send_time_off_request_to_manager/definition.ts'

/**
 * The app manifest contains the app's configuration. This
 * file defines attributes like app name and description.
 * https://api.slack.com/future/manifest
 */
// export default Manifest({
//   name: "Request Time Off",
//   description: "Ask your manager for some time off",
//   icon: "assets/default_new_app_icon.png",
//   workflows: [CreateTimeOffRequestWorkflow],
//   functions: [SendTimeOffRequestToManagerFunction],
//   outgoingDomains: [],
//   botScopes: [
//     "commands",
//     "chat:write",
//     "chat:write.public",
//     "datastore:read",
//     "datastore:write",
//   ],
// });
export default Manifest({
  name: "Execute Test on CI",
  description: "Execute E2E test on CI",
  icon: "assets/default_new_app_icon.png",
  workflows: [ExecuteTestOnCiWorkflow],
  functions: [ExecuteTestOnCiFunction],
  outgoingDomains: [
    "api.github.com",
    "circleci.com",
  ],
  botScopes: [
    "commands",
    "chat:write",
    "chat:write.public",
  ],
});
