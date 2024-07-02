const Data = require('../models/data');
const { convertTime } = require('../utils/dateTime');
const assignMarks = { 4: 1, 5: 2, 6: 3, 7: 4, 8: 5 };

module.exports = async (req, res) => {
    try {
        const data = req.body.data.toLowerCase();
        console.log(req.body, 'efe', req.user);
        let marks = 0;
        let t = await Data.findOne({ date: convertTime() });
        if (t.words.includes(data)) {
            console.log(t);
            let mark = assignMarks[data.length];
            if (t.user.length === 0) {
                t.rank.push({ user: req.user._id, marks: mark })
                t.user.push({ id: req.user, wordsFound: [data] });
                marks = mark;
            } else {
                let idx = t.rank.findIndex((e) => e.user.equals(req.user._id));
                if (idx === -1) {
                    t.rank.push({ user: req.user._id, marks: mark })
                    t.user.push({ id: req.user, wordsFound: [data] });
                    marks = mark;
                } else {
                    t.rank[idx].marks += mark
                    if (t.rank[idx].marks >= 100) {
                        t.rank[idx].marks = 100;
                    }
                    marks = t.rank[idx].marks;
                    idx = t.user.findIndex(e => e.id.equals(req.user._id));
                    if (marks >= 100) t.user[idx].isWin = true;
                    t.user[idx].wordsFound.push(data);
                }
            }
            await t.save()
            return res.json({ "mark": mark, 'totalMark': marks, isWin: marks >= 100 ? true : false }).status(200);
        }
        return res.json({ "error": false }).status(404);
    } catch {
        return res.json({ "error": "unauthorized" }).status(403);
    }
}