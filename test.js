const slackNotification = require("./src/slackNotification");

(async () => {
    try {
        await slackNotification("Test");
    } catch (error) {
        console.log(error);
    }
})();
