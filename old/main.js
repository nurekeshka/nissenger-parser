const Cron = require("node-cron");
var childProcess = require('child_process');

Cron.schedule("* * * * *", async () => {
    const output = childProcess.execSync("npm run upload").toString();
    console.log(output);
});
