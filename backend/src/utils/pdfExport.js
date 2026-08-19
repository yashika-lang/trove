import PDFDocument from "pdfkit";


// ==========================================
// CONVERT DATA TO PDF
// ==========================================

const convertToPDF = (
  data = [],
  fields = [],
  title = "Report"
) => {

  return new Promise((resolve, reject) => {

    try {

      const doc = new PDFDocument({
        margin: 40,
        size: "A4",
        layout: "landscape",
      });

      const chunks = [];


      // ========================================
      // COLLECT PDF BUFFER
      // ========================================

      doc.on(
        "data",
        (chunk) => {
          chunks.push(chunk);
        }
      );


      doc.on(
        "end",
        () => {

          resolve(
            Buffer.concat(chunks)
          );

        }
      );


      doc.on(
        "error",
        (error) => {
          reject(error);
        }
      );


      // ========================================
      // TITLE
      // ========================================

      doc
        .fontSize(18)
        .font("Helvetica-Bold")
        .text(title, {
          align: "center",
        });


      doc.moveDown(0.5);


      // ========================================
      // GENERATED DATE
      // ========================================

      doc
        .fontSize(9)
        .font("Helvetica")
        .text(
          `Generated on: ${new Date().toLocaleString(
            "en-IN"
          )}`,
          {
            align: "center",
          }
        );


      doc.moveDown(1);


      // ========================================
      // TABLE SETTINGS
      // ========================================

      const pageWidth =
        doc.page.width -
        doc.page.margins.left -
        doc.page.margins.right;

      const columnCount =
        fields.length || 1;

      const columnWidth =
        pageWidth / columnCount;

      const rowHeight = 24;


      let y =
        doc.y;


      // ========================================
      // HEADER
      // ========================================

      doc
        .fontSize(9)
        .font("Helvetica-Bold");


      fields.forEach(
        (field, index) => {

          const label =
            field.label ||
            field.value ||
            field;

          const x =
            doc.page.margins.left +
            index * columnWidth;

          doc.text(
            String(label),
            x,
            y,
            {
              width:
                columnWidth - 4,
              height:
                rowHeight,
              ellipsis: true,
            }
          );

        }
      );


      y += rowHeight;


      // ========================================
      // HEADER LINE
      // ========================================

      doc
        .moveTo(
          doc.page.margins.left,
          y - 4
        )
        .lineTo(
          doc.page.width -
            doc.page.margins.right,
          y - 4
        )
        .stroke();


      // ========================================
      // DATA ROWS
      // ========================================

      doc
        .fontSize(8)
        .font("Helvetica");


      for (
        const item of data
      ) {

        // --------------------------------------
        // NEW PAGE
        // --------------------------------------

        if (
          y + rowHeight >
          doc.page.height -
            doc.page.margins.bottom
        ) {

          doc.addPage();

          y =
            doc.page.margins.top;

          doc
            .fontSize(9)
            .font("Helvetica-Bold");


          fields.forEach(
            (field, index) => {

              const label =
                field.label ||
                field.value ||
                field;

              const x =
                doc.page.margins.left +
                index *
                  columnWidth;

              doc.text(
                String(label),
                x,
                y,
                {
                  width:
                    columnWidth - 4,
                  height:
                    rowHeight,
                  ellipsis: true,
                }
              );

            }
          );


          y += rowHeight;


          doc
            .moveTo(
              doc.page.margins.left,
              y - 4
            )
            .lineTo(
              doc.page.width -
                doc.page.margins.right,
              y - 4
            )
            .stroke();


          doc
            .fontSize(8)
            .font("Helvetica");
        }


        // --------------------------------------
        // ROW
        // --------------------------------------

        fields.forEach(
          (field, index) => {

            const key =
              field.value ||
              field;

            const value =
              item?.[key] ??
              "";

            const x =
              doc.page.margins.left +
              index * columnWidth;

            doc.text(
              String(value),
              x,
              y,
              {
                width:
                  columnWidth - 4,
                height:
                  rowHeight,
                ellipsis: true,
              }
            );

          }
        );


        y += rowHeight;


        // --------------------------------------
        // ROW LINE
        // --------------------------------------

        doc
          .moveTo(
            doc.page.margins.left,
            y - 4
          )
          .lineTo(
            doc.page.width -
              doc.page.margins.right,
            y - 4
          )
          .stroke();
      }


      // ========================================
      // EMPTY DATA
      // ========================================

      if (!data.length) {

        doc
          .fontSize(10)
          .font("Helvetica")
          .text(
            "No records found.",
            doc.page.margins.left,
            y + 10,
            {
              align: "center",
              width: pageWidth,
            }
          );
      }


      // ========================================
      // FOOTER
      // ========================================

      const pages =
        doc.bufferedPageRange();

      for (
        let i = 0;
        i < pages.count;
        i++
      ) {

        doc.switchToPage(i);

        doc
          .fontSize(8)
          .font("Helvetica")
          .text(
            `Page ${i + 1} of ${pages.count}`,
            doc.page.margins.left,
            doc.page.height -
              25,
            {
              width: pageWidth,
              align: "center",
            }
          );
      }


      // ========================================
      // FINALIZE
      // ========================================

      doc.end();

    } catch (error) {

      reject(error);

    }

  });
};


export {
  convertToPDF,
};