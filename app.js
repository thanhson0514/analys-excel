import { importExcel } from "./services/analys.js";
import { printInfo } from "./services/render.js";
import { PATH_INPUT_FILE_EXCEL, SHEET_NAME } from "./constant/constant.js";

const data = importExcel(PATH_INPUT_FILE_EXCEL, SHEET_NAME);
printInfo(data);
