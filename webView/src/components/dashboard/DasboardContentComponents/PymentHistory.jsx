// PaymentHistory.jsx
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useRecoilValue } from "recoil";
import { apiBaseUrlState, authState } from "../../../recoil/ctaState";
import DashboardHeader from "./DashboardHeaderBlock";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";
import { Dialog } from "primereact/dialog";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const PaymentHistory = () => {
  const navigate = useNavigate();
  const API_BASE = useRecoilValue(apiBaseUrlState);
  const { access_token } = useRecoilValue(authState) ?? {};

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [limit, setLimit] = useState(10);

  // Invoice modal state
  const [visible, setVisible] = useState(false);
  const [singlePayment, setSinglePayment] = useState(null);

  const invoiceRef = useRef(null);
const [isPdf, setIsPdf] = useState(false);

  /* ===========================
     Fetch Payments List
  ============================ */
  const fetchPayments = async (pageNumber = 1) => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/payment?page=${pageNumber}`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      setPayments(res.data.data || []);
      setTotalRecords(res.data.total || 0);
      setLimit(res.data.limit || 10);
    } catch (error) {
      console.error("Error loading payments:", error);
      alert("Unable to load payment history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments(page);
  }, [page]);

  const onPageChange = (e) => {
    setPage(e.page + 1);
  };

  /* ===========================
     Helpers
  ============================ */
  const formatDate = (row) =>
    row?.createdAt ? new Date(row.createdAt).toLocaleString() : "-";

  const statusTemplate = (row) => {
    const severity =
      row.paymentStatus === "SUCCEEDED"
        ? "success"
        : row.paymentStatus === "pending"
        ? "warning"
        : "danger";

    return <Tag value={row.paymentStatus} severity={severity} />;
  };

  /* ===========================
     Invoice Handlers
  ============================ */
  const openInvoice = (row) => {
    setSinglePayment(row);
    setVisible(true);
  };

  const downloadInvoicePDF = async () => {
    if (!invoiceRef.current) return;
 setIsPdf(true);
    const canvas = await html2canvas(invoiceRef.current, {
      scale: 2,
      useCORS: true,
    });
setIsPdf(false);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 10, pdfWidth, pdfHeight);
   const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

pdf.save(
  `Invoice-${singlePayment._id}-${singlePayment.paymentFor}-${timestamp}.pdf`
);
  };

  /* ===========================
     Table Actions
  ============================ */
  const actionTemplate = (row) => (
    <div className="action__listing_btns inv_poup">
      {row.paymentStatus === "SUCCEEDED" ? (
        <Button
          label="Invoice"
          icon="pi pi-file-pdf"
           className="p-button-text p-button-sm btn-invoice"
          onClick={() => openInvoice(row)}
           tooltip="View Invoice"
      tooltipOptions={{ position: "top" }}
        />
        
      ) : (
        <Button
          label="Pay Now"
          icon="pi pi-credit-card"
          className="p-button-text p-button-sm"
          onClick={() => navigate(`/user/payment-process/${row._id}`)}
        />
      )}
    </div>
  );

  return (
    <>
      <DashboardHeader headingData="Payment History" />

      {/* ===========================
          Payments Table
      ============================ */}
      <div className="my__save_listing_wrap my__payment_history_table">
        <DataTable
          value={payments}
          loading={loading}
          paginator
          rows={limit}
          totalRecords={totalRecords}
          onPage={onPageChange}
          dataKey="_id"
          emptyMessage="No payments found."
        >
          <Column
            header="Business Name"
            body={(row) => row?.referenceId?.businessName || "-"}
          />
          <Column field="_id" header="Payment ID" style={{ width: "260px" }} />
          <Column field="amount" header="Amount ($)" />
          <Column
            header="Status"
            body={statusTemplate}
            style={{ width: "140px" }}
          />
          <Column
            header="Date"
            body={formatDate}
            style={{ width: "200px" }}
          />
          <Column header="Action" body={actionTemplate} />
        </DataTable>
      </div>

      {/* ===========================
          Invoice Dialog
      ============================ */}
      <Dialog
        visible={visible}
        modal
        style={{ width: "992px" }}
        className="invoice__model_wrap"
        onHide={() => setVisible(false)}
      >
        {!singlePayment ? (
          <p>Loading...</p>
        ) : (
          <>
            <div  className="invoice__wrapper">
               <div className="invoice__actions">
     {!isPdf && (
                  <Button
                    label="Download PDF"
                    icon="pi pi-download"
                    className="p-button-sm"
                    onClick={downloadInvoicePDF}
                  />
                )}
 </div>
 <div ref={invoiceRef} className="wrapper_for_print">
              <div className="invoice__header">
                <h2>Invoice</h2>

               
              </div>

              <div className="invoice__row">
                <div>
                  <h4>Business Name</h4>
                  <p>{singlePayment?.referenceId?.businessName}</p>
                </div>

                <div>
                  <h4>Amount</h4>
                  <p>${singlePayment?.amount}</p>
                </div>

                <div>
                  <h4>Payment Status</h4>
                    {singlePayment.paymentStatus === "SUCCEEDED"
                          ? <><div className="payment-status-success">{singlePayment.paymentStatus}</div></>
                          : <><div className="payment-status-other">{singlePayment.paymentStatus}</div></>
                      }
                 
                </div>
              </div>

              <div className="invoice__row">
                <div>
                  <h4>Payment ID</h4>
                  <p>{singlePayment?._id}</p>
                </div>

                <div>
                  <h4>Payment For</h4>
                  <p>{singlePayment?.paymentFor}</p>
                </div>

                <div>
                  <h4>Transaction Date</h4>
                  <p>{formatDate(singlePayment)}</p>
                </div>
              </div>

              <div className="invoice__row">
                <div>
                  <h4>Payer Name</h4>
                  <p>
                    {singlePayment?.userId?.first_name}{" "}
                    {singlePayment?.userId?.last_name}
                  </p>
                </div>

                <div>
                  <h4>Payer Email</h4>
                  <p>{singlePayment?.userId?.email}</p>
                </div>

                <div>
                  <h4>Reference ID</h4>
                  <p>{singlePayment?.referenceId?._id}</p>
                </div>
              </div>
            <div className="inv__footer">
             <div className="copyright__content_footer_inv">© {new Date().getFullYear()} ExitRamp. All rights reserved.</div> 
            </div>

  </div>          
  </div>

          </>
        )}
      </Dialog>
    </>
  );
};

export default PaymentHistory;
