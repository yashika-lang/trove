import ExcelJS from "exceljs";

// ==========================================
// CONVERT DATA TO EXCEL
// ==========================================

const convertToExcel = async (
  data = [],
  fields = [],
  sheetName = "Report"
) => {

  const workbook =
    new ExcelJS.Workbook();

  const safeSheetName =
    String(sheetName || "Report")
      .substring(0, 31);

  const worksheet =
    workbook.addWorksheet(
      safeSheetName
    );


  // ========================================
  // COLUMNS
  // ========================================

  worksheet.columns =
    fields.map((field) => ({

      header:
        field.label ||
        field.value ||
        String(field),

      key:
        field.value ||
        String(field),

      width: 20,

    }));


  // ========================================
  // HEADER STYLE
  // ========================================

  const headerRow =
    worksheet.getRow(1);

  headerRow.font = {
    bold: true,
  };

  headerRow.alignment = {
    vertical: "middle",
    horizontal: "left",
  };


  // ========================================
  // DATA
  // ========================================

  for (const item of data) {

    const row = {};

    for (const field of fields) {

      const key =
        field.value ||
        String(field);

      row[key] =
        item?.[key] ?? "";
    }

    worksheet.addRow(row);
  }


  // ========================================
  // FREEZE HEADER
  // ========================================

  worksheet.views = [
    {
      state: "frozen",
      ySplit: 1,
    },
  ];


  // ========================================
  // AUTO FILTER
  // ========================================

  if (fields.length > 0) {

    const lastColumn =
      getExcelColumnName(
        fields.length
      );

    worksheet.autoFilter = {
      from: `A1`,
      to: `${lastColumn}1`,
    };
  }


  // ========================================
  // AUTO WIDTH
  // ========================================

  worksheet.columns.forEach(
    (column) => {

      let maxLength = 12;

      column.eachCell(
        {
          includeEmpty: true,
        },
        (cell) => {

          const value =
            cell.value === null ||
            cell.value === undefined
              ? ""
              : String(cell.value);

          maxLength =
            Math.max(
              maxLength,
              value.length + 2
            );
        }
      );

      column.width =
        Math.min(
          Math.max(
            maxLength,
            12
          ),
          40
        );
    }
  );


  // ========================================
  // RETURN BUFFER
  // ========================================

  return await workbook.xlsx.writeBuffer();
};


// ==========================================
// EXCEL COLUMN NAME
// ==========================================

const getExcelColumnName = (
  number
) => {

  let result = "";

  let n = number;

  while (n > 0) {

    const remainder =
      (n - 1) % 26;

    result =
      String.fromCharCode(
        65 + remainder
      ) + result;

    n =
      Math.floor(
        (n - 1) / 26
      );
  }

  return result;
};


export {
  convertToExcel,
};