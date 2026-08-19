import { Parser } from "json2csv";


// ==========================================
// CONVERT DATA TO CSV
// ==========================================

const convertToCSV = (
  data,
  fields
) => {

  const parser = new Parser({
    fields,
  });

  return parser.parse(data);
};


export {
  convertToCSV,
};