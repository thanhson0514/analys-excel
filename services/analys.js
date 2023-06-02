import { readFile, set_fs, utils } from "xlsx";
import fs from "fs";
set_fs(fs);

import { AMOUNT_OF_INFO_EMPLOYEE } from "../constant/constant.js";

/**
 * Handler import file excel
 * @param {string} filepath
 * @param {string} sheetName
 */
export const importExcel = (filename, sheetName, opt = {}) => {
  try {
    const workbook = readFile(filename, opt);
    const data = utils.sheet_to_json(workbook.Sheets[sheetName]);
    // console.log(utils.sheet_to_json(workbook.Sheets[sheetName]));
    return data;
  } catch (error) {
    console.log(error);
  }
};

/**
 * Proccess data when import file excel
 * @param {any[]} data
 */
export const proccessData = (data) => {
  try {
    let amountOfNameTheShift = 0;
    let amountOfInfoEmployee = 0;
    let rangeOfCellForDays = [];

    // Lược bỏ phần thông tin của nhân viên
    for (let item in data[1]) {
      amountOfInfoEmployee++;
      if (amountOfInfoEmployee <= AMOUNT_OF_INFO_EMPLOYEE) continue;
      else if (data[1][item] === "Tổng lương") break;

      amountOfNameTheShift++;
    }

    let infoDayOfMonth = {};
    let count = 0;
    for (let item in data[1]) {
      count++;
      if (count <= AMOUNT_OF_INFO_EMPLOYEE + amountOfNameTheShift + 1) continue;
      infoDayOfMonth[data[1][item]] = +item.split("_").pop();
    }

    let infoTheShift = [];
    let countOfTheShift = 0;
    let countDetailOfTheShift = 0;
    let storeTheShiftInDayOfMonth = [];

    for (let item in data[3]) {
      /* 
            Đếm các ô định nghĩa chi tiết về ca 
            VD: Ở Tổng GC sẽ có 2 ô mô tả chi tiết là GC và $ (tức là sẽ đếm 2 ô này)
            biến countDetailOfTheShift sử dụng cho nhiệm vụ này
          */
      if (countOfTheShift < amountOfNameTheShift) countDetailOfTheShift++;

      /*
            countOfTheShift là đếm sô ổ Tổng của ca
            VD: Tổng CN, Tổng GC, ... Tức là sẽ đếm các ô này (trừ ô "Tổng lương")
            Biến này giúp kiểm tra và loại trừ các ô được định nghĩa
          */
      if (data[3][item] === "$") countOfTheShift++;
      else if (countOfTheShift < amountOfNameTheShift)
        infoTheShift.push(data[3][item].trim());
      else {
        // Kiểm tra các tên ca định nghĩa của các ngày trong tháng có hợp lệ hay không
        // Hợp lệ khi các ô được định nghĩa trước như ([CN, $], [GC, $] ....)
        if (!infoTheShift.includes(data[3][item].trim()))
          throw new Error(`Ca ${data[3][item].trim()} không được định nghĩa!`);

        // Lưu lại các ca làm trong ngày
        storeTheShiftInDayOfMonth.push(data[3][item].trim());
      }
    }

    const detailWorkForEmployee = handlerDetailWorkOfMonth(
      data,
      storeTheShiftInDayOfMonth,
      countDetailOfTheShift
    );
    const workingDayOfMonthEmployee = handlerDetailWorkOfDay(
      data,
      infoDayOfMonth,
      storeTheShiftInDayOfMonth,
      countDetailOfTheShift
    );

    return { workingDayOfMonthEmployee, detailWorkForEmployee };
  } catch (error) {
    console.log(error);
  }
};

/**
 *
 * @param {object[]} data
 * @param {object} infoDayOfMonth
 * @param {string[]} storeTheShiftInDayOfMonth
 * @param {number} countDetailOfTheShift
 * @returns {object}
 */
const handlerDetailWorkOfDay = (
  data,
  infoDayOfMonth,
  storeTheShiftInDayOfMonth,
  countDetailOfTheShift
) => {
  let result = [];
  for (let i = 4; i < data.length; ++i) {
    let c = 0;
    let dayOfEmployee = {};
    const splitFirstContentCol =
      AMOUNT_OF_INFO_EMPLOYEE + countDetailOfTheShift + 1;
    let j = splitFirstContentCol;

    for (let day = 0; day < Object.keys(infoDayOfMonth).length - 1; ++day) {
      const rangesDay = Object.values(infoDayOfMonth);

      const sumOfWorkingHour = {};
      for (let item in data[i]) {
        const pos = +item.toString().split("_").pop() || 0;
        if (pos < splitFirstContentCol) continue;
        if (pos <= j) continue;

        if (pos >= +rangesDay[day + 1]) break;

        while (j < pos) j++;
        const theShift = storeTheShiftInDayOfMonth[j - splitFirstContentCol];
        if (!sumOfWorkingHour[theShift])
          sumOfWorkingHour[theShift] = data[i][item];
        else sumOfWorkingHour[theShift] += data[i][item];
      }
      dayOfEmployee[Object.keys(infoDayOfMonth)[day]] = { ...sumOfWorkingHour };
    }
    result.push(dayOfEmployee);
  }
  return result;
};

/**
 *
 * @param {object[]} data
 * @param {string[]} storeTheShiftInDayOfMonth
 * @param {number} countDetailOfTheShift
 * @returns {object[]}
 */
const handlerDetailWorkOfMonth = (
  data,
  storeTheShiftInDayOfMonth,
  countDetailOfTheShift
) => {
  const detailWorkForEmployee = [];
  for (let i = 4; i < data.length; ++i) {
    let dayOfWork = 0;
    const sumOfWorkingHour = {};
    const splitFirstContentCol =
      AMOUNT_OF_INFO_EMPLOYEE + countDetailOfTheShift + 1;
    const detailWorkOfDay = {};
    let j = splitFirstContentCol - 1;
    let employeeCode;

    for (let item in data[i]) {
      const pos = +item.toString().split("_").pop() || 0;
      if (pos === 1) employeeCode = data[i][item];
      if (pos < splitFirstContentCol) continue;

      j++;

      while (j < pos) j++;

      const theShift = storeTheShiftInDayOfMonth[j - splitFirstContentCol];
      if (!sumOfWorkingHour[theShift])
        sumOfWorkingHour[theShift] = data[i][item];
      else sumOfWorkingHour[theShift] += data[i][item];
    }

    detailWorkForEmployee.push({ employeeCode, sumOfWorkingHour });
  }

  return detailWorkForEmployee;
};
