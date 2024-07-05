const Data = require('./models/data');
const UserStats = require("./models/stats");
const cron = require('node-cron');
const cache = require('./cache');
const { getYesterdayDate } = require('./utils/dateTime');

const upd = async () => {
    let datas = await Data.findOne({ date: getYesterdayDate() }, { rank: 1 }).populate({ path: 'rank', populate: { path: 'user' } });
    let rankUpd = [], ctr = 0; d = {};
    let marks = [];
    let uni = new Set(datas.rank.map(e => e.marks));
    uni.forEach((e) => marks.push(e));
    marks.sort((a, b) => b - a);
    for (let mark of marks)
        d[mark] = ++ctr;
    datas.rank.forEach(async (data) => {
        rankUpd.push({ user: data.user, marks: data.marks, rank: d[data.marks] })
        const userStats = await UserStats.findOne({ user: data.user })
        if (userStats.maxRank === 0)
            userStats.maxRank = d[data.marks];
        else
            userStats.maxRank = Math.min(userStats.maxRank, d[data.marks])
        userStats.maxMarks = Math.max(userStats.maxMarks, data.marks)
        userStats.gamesPlayed++;
        await userStats.save()
    })
    rankUpd.sort((a, b) => (a.marks === b.marks) ? a.user.name.localeCompare(b.user.name.localeCompare) : b.marks - a.marks);
    await Data.findOneAndUpdate({ _id: datas.id }, { rank: rankUpd }, { overwrite: true });

}


cron.schedule('10 0 * * *', async () => {
    await upd();
    console.log('updating')
    cache.delete('newDay');
    cache.delete('rank');
    console.log("CRON JOB!!!!");
}, {
    timezone: 'Asia/Kolkata'
})
const updLeader = async () => {

    let marks = new Set();
    stats.forEach(stat => marks.add(stat.totalScore));
    marks = Array.from(marks);
    marks.sort((a, b) => b - a);
    let d = {}, ctr = 0;
    for (let mark of marks)
        d[mark] = ++ctr;
    console.log(marks, d);
    stats.forEach(async (stat) => {
        stat.rank = d[stat.totalScore];
        stat.save();
    })

}
cron.schedule('18 1 * * *', async () => {
    await updLeader();
    cache.delete('stats');
}, {
    timezone: 'Asia/Kolkata'
})