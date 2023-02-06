const HighlevelApi = require("./HighLevel");
const Airtable = require("./Airtable");
const _ = require("./Helpers");

const slackNotification = require("./slackNotification");

module.exports = async (account) => {
    try {
        const Highlevel = new HighlevelApi(account["API Token"]);

        let view = "Text";

        if ("Tag" in account) {
            view = `Text - ${account.Tag}`;
        }

        const contact = await Airtable.getContact(account["Base ID"], view);

        if (contact) {
            let highLevelContact = _.mapContact(contact);

            try {
                const texted = await Highlevel.textContact(
                    highLevelContact,
                    account["Campaign ID"],
                    account["Account"]
                );

                if (texted.status == "200") {
                    await Airtable.updateContact(account["Base ID"], contact.recordID, {
                        "In Campaign": true,
                        Campaign: account.Campaign,
                        id: texted.id,
                    });

                    console.log(
                        `Account: ${account.Account} | Campaign: ${account.Campaign} | texted: ${highLevelContact.name}`
                    );

                    return { ...account, status: "Live", texted: highLevelContact.name };
                }
            } catch (error) {
                // RUNS IF ERROR WHILE TEXTING
                // await Airtable.updateContact(account["Base ID"], contact.recordID, {
                //     Error: true,
                // });

                console.log(`ERROR TEXTING CONTACT --- ${account.Client} --- ${error.message}`);

                return { ...account, status: "Error" };
            }
        } else {
            await slackNotification(
                `\n*Account:* ${account.Account}\n*Campaign:* ${account.Campaign} \n*Number of contacts:* 0\n`
            );

            return { ...account, status: "Need More Contacts" };
        }
    } catch (error) {
        console.log(error);

        return { ...account, status: "Error" };
    }
};
