exports.printDate=function printDate() {
    var temp = new Date();
    var dateStr = padStr(temp.getFullYear()) +
        padStr(1 + temp.getMonth()) +
        padStr(temp.getDate()) +
        padStr(temp.getHours()) +
        padStr(temp.getMinutes()) +
        padStr(temp.getSeconds());
    return dateStr;
}

function padStr(i) {
    return (i < 10) ? "0" + i : "" + i;
}

