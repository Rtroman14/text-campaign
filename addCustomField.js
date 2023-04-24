const Airtable = require("./src/Airtable");
const HighLevelApi = require("./src/HighLevel");

(async () => {
    try {
        const records = await Airtable.recordsByView(
            "appGB7S9Wknu6MiQb",
            "Campaigns",
            "Text - workflow"
        );

        const apiTokens = records.map((record) => record["API Token"]);
        const uniqueTokens = [...new Set(apiTokens)];

        // TODO: create custom field
        for (let uniqueToken of uniqueTokens) {
            const HighLevel = new HighLevelApi(uniqueToken);

            const newCustomField = await HighLevel.createCustomField("Conversation");

            console.log(newCustomField);
        }
    } catch (error) {
        console.error(error);
    }
})();
