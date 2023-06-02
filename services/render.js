import { proccessData } from "./analys.js";

export const printInfo = (data) => {
  const { workingDayOfMonthEmployee, detailWorkForEmployee } =
    proccessData(data);
  const resultPrint = {};
  for (let i = 0; i < detailWorkForEmployee.length; ++i) {
    resultPrint[detailWorkForEmployee[i].employeeCode] = {
      ...detailWorkForEmployee[i],
      dayOfWorks: { ...workingDayOfMonthEmployee[i] },
    };
  }

  console.log(resultPrint);
};
