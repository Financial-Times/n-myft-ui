// date-fns from v2 doesn't accept String arguments anymore.
// the detail => https://github.com/date-fns/date-fns/blob/HEAD/CHANGELOG.md#200---2019-08-20
// By adding validation for dates before their functions allows us to know it when unexpected value passed.

import isTodayOriginal from "date-fns/src/isToday";
import isAfterOriginal from "date-fns/src/isAfter";
import addMinutesOriginal from "date-fns/src/addMinutes";
import startOfDayOriginal from "date-fns/src/startOfDay";
import isValidOriginal from "date-fns/src/isValid";
import parseISO from "date-fns/src/parseISO";

const isValid = (date) => {
	if (!isValidOriginal(date)) {
		console.error("Invalid date passed", [date]); //eslint-disable-line
	}
	return date;
};

const isToday = (date) => isTodayOriginal(isValid(date));
const isAfter = (date, dateToCompare) =>
	isAfterOriginal(isValid(date), isValid(dateToCompare));
const addMinutes = (date, amount) => addMinutesOriginal(isValid(date), amount);
const startOfDay = (date) => startOfDayOriginal(isValid(date));

export { isToday, isAfter, addMinutes, startOfDay, isValid, parseISO };
