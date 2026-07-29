const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");
const locale = require("dayjs/locale/az");

dayjs.extend(utc);
dayjs.extend(timezone);

dayjs.locale("az");


function formatProductDate(date) {
  const now = dayjs().tz("Asia/Baku");
  const d = dayjs(date).tz("Asia/Baku");

  // Bu gün
  if (d.format("YYYY-MM-DD") === now.format("YYYY-MM-DD")) {
    return `Bu gün ${d.format("HH:mm")}`;
  }

  // Dünən
  if (
    d.add(1, "day").format("YYYY-MM-DD") === now.format("YYYY-MM-DD")
  ) {
    return `Dünən ${d.format("HH:mm")}`;
  }

  // Köhnə tarix
  return d.format("D MMMM, YYYY");
}


module.exports = formatProductDate;