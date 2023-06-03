import { proccessData } from "./analys.js";
import fs from "fs";
import { PATH_OUTPUT_FILE_JSON } from "../constant/constant.js";

/**
 *
 * @param {object[]} data
 * @returns {void}
 */
export const printInfo = (data) => {
  const resultPrint = proccessData(data);
  fs.writeFileSync(PATH_OUTPUT_FILE_JSON, JSON.stringify(resultPrint));
  console.log(resultPrint);
};
