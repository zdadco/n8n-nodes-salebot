// This file ensures n8n can find and load your nodes and credentials
const { Salebot } = require("./nodes/Salebot/Salebot.node.js");
const { SalebotApi } = require("./credentials/SalebotApi.credentials.js");

module.exports = {
	nodeTypes: {
		salebot: Salebot,
	},
	credentialTypes: {
		salebotApi: SalebotApi,
	},
};
