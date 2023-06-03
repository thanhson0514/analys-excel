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
    return data;
  } catch (error) {
    console.log(error);
  }
};

/**
 * Proccess data when import file excel
 * @param {object[]} data
 * @returns {object}
 */
export const proccessData = (data) => {
  const INFO_EMPLOYEE = ["STT", "Mã NV", "Họ tên"];
  const resultData = [];
  const maxColumn = Math.max(...data.map((item) => Object.keys(item).length));
  const positionColumn = new Array(maxColumn);

  let posTheEndForInfoSalaryTheShift = -1;
  for (let col in data[1]) {
    if (data[1][col] === "Tổng lương") {
      // Vị trí cuối cùng của cột thông tin về tiền lương của các ca định nghĩa
      posTheEndForInfoSalaryTheShift = +col.toString().split("_").pop();
      break;
    }
  }

  let recordPositionTheShift = {};
  const tempSaveTheNameShift = [];
  let listTheShiftFollowDay = new Array(maxColumn);

  for (let col in data[3]) {
    const pos = +col.toString().split("_").pop() || 0;
    if (pos > posTheEndForInfoSalaryTheShift) {
      listTheShiftFollowDay[pos] = data[3][col];
    } else if (data[3][col] === "$") {
      while (tempSaveTheNameShift.length) {
        const theNameShift = tempSaveTheNameShift.pop();
        recordPositionTheShift = {
          ...recordPositionTheShift,
          [theNameShift]: pos,
        };
      }
    } else tempSaveTheNameShift.push(data[3][col]);
  }

  let recordTheDayOfShift = new Array(32).fill(-1);
  for (let col in data[1]) {
    const pos = +col.toString().split("_").pop() || 0;
    if (pos <= posTheEndForInfoSalaryTheShift) continue;
    recordTheDayOfShift[+data[1][col]] = pos;
  }

  for (let row = 4; row < data.length; ++row) {
    const keyOfRecordData = Object.keys(data[row]);
    const valueOfRecordData = Object.values(data[row]);
    let countCellContent = 2;

    let saveSalaryTheShift = {};
    const saveInfoEmployee = {};
    let total = 0;

    for (let index = 0; index < keyOfRecordData.length; ++index) {
      const pos = +keyOfRecordData[index].toString().split("_").pop() || 0;
      if (pos < AMOUNT_OF_INFO_EMPLOYEE) {
        saveInfoEmployee[INFO_EMPLOYEE[pos]] = valueOfRecordData[index];
        continue;
      } else if (pos <= posTheEndForInfoSalaryTheShift) {
        for (let theNameShift in recordPositionTheShift) {
          if (+recordPositionTheShift[theNameShift] === pos) {
            saveSalaryTheShift = {
              ...saveSalaryTheShift,
              [theNameShift]: valueOfRecordData[index],
            };
          }
        }
        continue;
      }

      while (pos >= recordTheDayOfShift[countCellContent]) {
        countCellContent++;
        total = 0;
      }
      total +=
        saveSalaryTheShift[listTheShiftFollowDay[pos]] *
        valueOfRecordData[index];

      saveInfoEmployee[countCellContent - 1] = {
        ...saveInfoEmployee[countCellContent - 1],
        [listTheShiftFollowDay[pos]]: valueOfRecordData[index],
        total: total,
      };

      if (!valueOfRecordData[index])
        delete saveInfoEmployee[countCellContent - 1][
          listTheShiftFollowDay[pos]
        ];
    }

    let salaryOfMonth = 0;
    for (let day in saveInfoEmployee) {
      if (typeof saveInfoEmployee[day] === "object") {
        salaryOfMonth += saveInfoEmployee[day].total;
      }
    }

    saveInfoEmployee.salaryOfMonth = Math.round(salaryOfMonth);
    resultData.push(saveInfoEmployee);
  }

  return resultData;
};
