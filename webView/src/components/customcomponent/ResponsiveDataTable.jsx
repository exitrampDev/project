import React from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

const ResponsiveDataTable = ({
  columns = [],
  className = "",
  cardBreakpoint = "768px",
  ...dataTableProps
}) => {
  const renderCardCell = (rowData, column, options) => {
    const content = column.body
      ? column.body(rowData, options)
      : rowData?.[column.field] ?? "-";

    const label =
      column.cardLabel ||
      (typeof column.header === "string"
        ? column.header
        : column.field);

    const cellClasses = [
      "responsive-card-cell",
      column.primary ? "responsive-card-cell--primary" : "",
      column.cardClassName || "",
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div className={cellClasses} data-label={label}>
        <div className="responsive-card-cell__value">
          {content}
        </div>
      </div>
    );
  };

  return (
    <>
      <style>
        {`
          .responsive-card-table {
            width: 100%;
          }

          .responsive-card-table .p-datatable-wrapper {
            width: 100%;
          }

          @media screen and (max-width: ${cardBreakpoint}) {
            .responsive-card-table .p-datatable-wrapper {
              overflow: visible;
            }

            .responsive-card-table .p-datatable-table,
            .responsive-card-table .p-datatable-tbody {
              display: block;
              width: 100%;
            }

            .responsive-card-table .p-datatable-thead {
              display: none;
            }

            .responsive-card-table .p-datatable-tbody {
              display: grid;
              grid-template-columns: 1fr;
              gap: 16px;
            }

            /* Each table row becomes a card */
            .responsive-card-table .p-datatable-tbody > tr {
              display: block;
              width: 100%;
              margin: 0;
              padding: 16px;
              background: #ffffff !important;
              border: 1px solid #e5e7eb;
              border-radius: 12px;
              box-shadow: 0 4px 14px rgba(0, 0, 0, 0.06);
              overflow: hidden;
            }

            .responsive-card-table .p-datatable-tbody > tr > td {
              display: block;
              width: 100%;
              padding: 0;
              border: 0;
              background: transparent;
            }

            .responsive-card-cell {
              display: grid;
              grid-template-columns: minmax(100px, 35%) minmax(0, 1fr);
              align-items: start;
              gap: 16px;
              width: 100%;
              padding: 11px 0;
              border-bottom: 1px solid #edf0f3;
            }

            /* Dynamic label taken from the column header */
            .responsive-card-cell::before {
              content: attr(data-label);
              color: #6b7280;
              font-size: 12px;
              font-weight: 700;
              line-height: 1.5;
              text-align: left;
              text-transform: uppercase;
              letter-spacing: 0.4px;
            }

            .responsive-card-cell__value {
              min-width: 0;
              color: #111827;
              font-size: 14px;
              line-height: 1.5;
              text-align: left;
              overflow-wrap: anywhere;
            }

            /* Use primary: true for important fields */
            .responsive-card-cell--primary
              .responsive-card-cell__value {
              font-size: 16px;
              font-weight: 700;
            }

            /* Remove divider from the final field */
            .responsive-card-table
              .p-datatable-tbody
              > tr
              > td:last-child
              .responsive-card-cell {
              padding-bottom: 0;
              border-bottom: 0;
            }

            /* Override PrimeReact striped-row background */
            .responsive-card-table.p-datatable-striped
              .p-datatable-tbody
              > tr:nth-child(even) {
              background: #ffffff !important;
            }

            /* Keep action buttons aligned */
            .responsive-card-table
              .p-datatable-tbody
              > tr
              > td:last-child
              .responsive-card-cell__value {
              display: flex;
              align-items: center;
              gap: 10px;
            }

            /* Pagination spacing */
            .responsive-card-table .p-paginator {
              margin-top: 16px;
              border-radius: 10px;
            }
              .img_my_save_lisiting{flex-wrap:wrap}
          }

          @media screen and (max-width: 480px) {
            .responsive-card-table .p-datatable-tbody > tr {
              padding: 14px;
            }

            .responsive-card-cell {
              grid-template-columns: 95px minmax(0, 1fr);
              gap: 12px;
                      align-items: center;
            }
.responsive-card-cell__value img {
    max-width: 80px;
}
    .responsive-card-cell__value .img_my_save_lisiting span{
    display:block; font-weight:400; width:100%}
            .responsive-card-cell::before {
              font-size: 11px;
            }

            .responsive-card-cell__value {
              font-size: 13px;
            }
          }
        `}
      </style>

      <DataTable
        {...dataTableProps}
        className={`responsive-card-table ${className}`.trim()}
      >
        {columns.map((column, index) => {
          const {
            body,
            primary,
            cardLabel,
            cardClassName,
            ...primeColumnProps
          } = column;

          return (
            <Column
              {...primeColumnProps}
              key={column.field || column.columnKey || index}
              body={(rowData, options) =>
                renderCardCell(
                  rowData,
                  {
                    ...column,
                    body,
                    primary,
                    cardLabel,
                    cardClassName,
                  },
                  options
                )
              }
            />
          );
        })}
      </DataTable>
    </>
  );
};

export default ResponsiveDataTable;