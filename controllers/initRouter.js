const Data = require('../models/data');
const { convertTime } = require('../utils/dateTime')

module.exports = async (req, res) => {
    try {
        let data, marks = 0;
        let wordsFound = await Data.findOne({ date: convertTime() });
        if (wordsFound.user.length >= 1) {
            data = wordsFound.user.find(e => e.id.equals(req.user._id))
            if (data === undefined)
                return res.json({ success: true, marks: 0, words: [] });
            marks = wordsFound.rank.find(e => e.user.equals(req.user._id))
            marks = marks.marks
        }
        return res.json({ success: true, words: wordsFound.user.length >= 1 ? data.wordsFound : [], marks: marks }).status(200)
    } catch (e) {
        return res.json({ error: "Unauthorized" }).status(404);
    }
}