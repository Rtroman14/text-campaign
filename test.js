const Airtable = require("./src/Airtable");
const _ = require("./src/Helpers");

(async () => {
    try {
        let contact = await Airtable.getContact("appKGnVZPa1Aft0gE", "Text - facilities");

        contact = { ...contact, "Company Name": "McCrea Property Group" };

        let highLevelContact = _.mapContact(contact);

        console.log(highLevelContact);
    } catch (error) {
        console.log(error);
    }
})();
