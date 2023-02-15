const moment = require("moment");

const textOutreach = require("./src/textOutreach");
const Airtable = require("./src/Airtable");
const slackNotification = require("./src/slackNotification");
const _ = require("./src/Helpers");

const {
    NUM_CONTACTS,
    SLACK_NOTIFICATION,
    KEEP_ACCOUNTS,
    REMOVE_ACCOUNTS,
    removeAccounts,
    keepAccounts,
} = require("./config");

const today = moment(new Date()).format("MM/DD/YYYY");

(async () => {
    try {
        const getCampaigns = await Airtable.getCampaigns();
        let accounts = _.accountsToRun(getCampaigns);

        if (REMOVE_ACCOUNTS) {
            accounts = removeAccounts(accounts);
        }

        if (KEEP_ACCOUNTS) {
            accounts = keepAccounts(accounts);
        }

        SLACK_NOTIFICATION && (await slackNotification("Launching texts..."));

        for (let i = 1; i <= NUM_CONTACTS; i++) {
            const arrayTextOutreach = accounts.map((account) => textOutreach(account));

            const results = await Promise.all(arrayTextOutreach);

            // * check to see if client texted same prospect twice
            const textedProspects = results
                .filter((res) => res?.status === "Live")
                .map((res) => `${res.Client} - ${res.texted}`);

            const textedSameProspect = _.hasDuplicates(textedProspects);
            if (textedSameProspect) {
                await slackNotification("TEXTED SAME PROSPECT MULTIPLE TIMES!!");
                throw new Error("\nTEXTED SAME PROSPECT!!");
            }

            for (let result of results) {
                if (result?.status === "Need More Contacts") {
                    if (i > 2) {
                        await Airtable.updateCampaign(result.recordID, {
                            "Campaign Status": result.status,
                            "Last Updated": today,
                        });
                    } else {
                        await Airtable.updateCampaign(result.recordID, {
                            "Campaign Status": result.status,
                        });
                    }

                    // remove account from list
                    accounts = accounts.filter(
                        (currentAccount) => currentAccount.Account !== result.Account
                    );
                }
            }

            console.log(`\n --- Texts sent: ${i} / ${String(NUM_CONTACTS)} --- \n`);

            if (i === NUM_CONTACTS) {
                for (let account of accounts) {
                    await Airtable.updateCampaign(account.recordID, {
                        "Campaign Status": "Live",
                        "Last Updated": today,
                    });
                }
            } else {
                await _.minutesWait(1.9);
            }
        }

        return;
    } catch (error) {
        console.log(error);

        await slackNotification("There was an error with texts: \n", error.message);

        process.exit(1); // Retry Job Task by exiting the process
    }
})();
