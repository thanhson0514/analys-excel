import path, { dirname } from "path";
import { fileURLToPath } from "url";

export const SHEET_NAME = "Chấm công";
export const FILENAME_INPUT_EXCEL = "BangCong.xlsx";
export const __dirname = dirname(fileURLToPath(import.meta.url));
export const PATH_INPUT_FILE_EXCEL = path.resolve(
  __dirname,
  "..",
  "input",
  FILENAME_INPUT_EXCEL
);
export const PATH_OUTPUT_FILE_EXCEL = path.resolve(
  __dirname,
  "..",
  "output",
  FILENAME_INPUT_EXCEL
);

export const AMOUNT_OF_INFO_EMPLOYEE = 3;
