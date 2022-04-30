const cron = require('node-cron');
const childProcess = require('child_process');

cron.schedule('* * * * *', async () => {
    const output = childProcess.execSync('npm run start').toString();
    console.log(output);
});
