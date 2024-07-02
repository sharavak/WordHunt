const convertTime = () => {
    let date = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    date = date.split(',')[0].split("/");
    const month = parseInt(date[1]);
    date[1] = month <= 9 ? '0' + month : month + '';
    return date.join('/');
}
const getYesterdayDate = () => {
    let date = new Date();
    let istDate = new Date(date.getTime() + (5.5 * 3600000))
    istDate.setDate(istDate.getDate() - 1);
    let month = istDate.getMonth() + 1 <= 9 ? `0${istDate.getMonth() + 1}` : `${istDate.getMonth() + 1}`;
    return `${istDate.getDate()}/${month}/${istDate.getFullYear()}`
}
module.exports.convertTime = convertTime;
module.exports.getYesterdayDate = getYesterdayDate;