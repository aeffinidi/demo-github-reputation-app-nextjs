const { generateApi } = require("swagger-typescript-api");
const path = require("path");

const ISSUANCE_URL = "https://console-vc-issuance.prod.affinity-project.org";

generateApi({
  name: "issuance.api.ts",
  output: path.resolve(process.cwd(), "./services/issuance"),
  url: `${ISSUANCE_URL}/api/swagger`,
  httpClientType: "axios",
}).catch(console.error);
