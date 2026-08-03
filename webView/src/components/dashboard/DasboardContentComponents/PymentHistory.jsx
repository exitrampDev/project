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
import { InputTextarea } from "primereact/inputtextarea";
import ResponsiveDataTable from "../../customcomponent/ResponsiveDataTable";
const PaymentHistory = () => {
  const navigate = useNavigate();
  const API_BASE = useRecoilValue(apiBaseUrlState);
  const { access_token } = useRecoilValue(authState) ?? {};
// Refund dialog state
const [refundVisible, setRefundVisible] = useState(false);
const [refundPayment, setRefundPayment] = useState(null);
const [refundReason, setRefundReason] = useState("");
const [refundLoading, setRefundLoading] = useState(false);

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



const openRefundDialog = (row) => {
  setRefundPayment(row);
  setRefundReason("");
  setRefundVisible(true);
};
const submitRefundRequest = async () => {
  if (!refundPayment?._id) return;

  if (!refundReason.trim()) {
    alert("Please enter refund reason.");
    return;
  }

  try {
    setRefundLoading(true);

    await axios.post(
      `${API_BASE}/payment/refund-request`,
      {
        paymentId: refundPayment._id,
        reason: refundReason.trim(),
      },
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
      }
    );

    setRefundVisible(false);

    alert("Refund request submitted successfully.");
  } catch (error) {
    console.error("Refund request error:", error);
    alert("Failed to submit refund request.");
  } finally {
    setRefundLoading(false);
  }
};


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
      {row.paymentStatus === "SUCCEEDED" ? (<>


      {row?.refundStatus === "NOT_REQUESTED" ? (
  <Button
    label="Refund"
    icon="pi pi-money-bill"
    className="p-button-text p-button-sm btn-invoice"
    onClick={() => openRefundDialog(row)}
    tooltip="Request for refund"
    tooltipOptions={{ position: "top" }}
  />
) : (
  <>
  {row?.refundStatus === "PENDING" ? 
   <Button
    label="Requested"
    icon="pi pi-money-bill"
    className="p-button-text p-button-sm btn-invoice"
    
    tooltip="Refund already requested"
    tooltipOptions={{ position: "top" }}
  />
    : <><Tag value={row?.refundStatus} severity={row?.refundStatus === "APPROVED" ? "success" : "danger"} /></>}
  </>
  
)}

        <Button

          icon="pi pi-file-pdf"
           className="p-button-text p-button-sm btn-invoice"
          onClick={() => openInvoice(row)}
           tooltip="View Invoice"
      tooltipOptions={{ position: "top" }}
        />


      

        </>
      ) : (
        <Button
          label="Pay Now"
          icon="pi pi-credit-card"
          className="p-button-text p-button-sm"
          onClick={() => navigate(`/user/payment-process/payment/${row._id}`)}
        />
      )}
    </div>
  );
const paymentColumns = [
  {
    field: "referenceId.listingTitle",
    header: "Listing Name",
    primary: true,
    sortable: true,
    body: (rowData) => {
      const text = rowData?.referenceId?.listingTitle || "-";
      const words = text.split(" ");

      return words.length > 6
        ? `${words.slice(0, 6).join(" ")}...`
        : text;
    },
  },
  {
    field: "_id",
    header: "Payment ID",
  },
  {
    field: "referenceId._id",
    header: "Listing ID",
  },
  {
    field: "amount",
    header: "Amount ($)",
    body: (row) => `$${row?.amount ?? 0}`,
  },
  {
    field: "refundReason",
    header: "Refund Reason",
    body: (row) =>
      row?.refundStatus !== "NOT_REQUESTED"
        ? row?.refundReason || "-"
        : "-",
  },
  {
    field: "refundCommentByAdmin",
    header: "Admin Comment",
    body: (row) => row?.refundCommentByAdmin || "-",
  },
  {
    field: "status",
    header: "Status",
    body: statusTemplate,
    style: { width: "140px" },
  },
  {
    field: "date",
    header: "Date",
    body: formatDate,
    style: { width: "200px" },
  },
  {
    field: "refundRequests",
    header: "Refund Requests",
    body: actionTemplate,
  },
];
  return (
    <>
      <DashboardHeader headingData="Payment History" />

      {/* ===========================
          Payments Table
      ============================ */}
      <div className="my__save_listing_wrap my__payment_history_table">
        <ResponsiveDataTable
  value={payments}
  columns={paymentColumns}
  loading={loading}
  paginator
  rows={limit}
  totalRecords={totalRecords}
  onPage={onPageChange}
  dataKey="_id"
  emptyMessage="No payments found."
  cardBreakpoint="768px"
/>
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
                  <p>{singlePayment?.referenceId?.listingTitle}</p>
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
      <Dialog
  visible={refundVisible}
  modal
  style={{ width: "600px" }}
  header="Request Refund"
  onHide={() => setRefundVisible(false)}
>
  <div className="refund__popup_content_user">
    <div className="refund__popup_user_field" >
      <strong>Payment ID:</strong>
      <div>{refundPayment?._id}</div>
    </div>

    <div className="refund__popup_user_field" >
      <strong>Amount:</strong>
      <div>${refundPayment?.amount || 0}</div>
    </div>

    <div className="refund__popup_user_field">
      <label>Reason</label>
      <InputTextarea
        value={refundReason}
        onChange={(e) => setRefundReason(e.target.value)}
        rows={5}
        placeholder="Write your reason..."
      />
    </div>

    <div className="refund__popup_user_actions">
      <Button
        label="Cancel"
        className="p-button-text"
        onClick={() => setRefundVisible(false)}
        disabled={refundLoading}
      />

      <Button
        label={refundLoading ? "Submitting..." : "Submit Request"}
        icon="pi pi-send"
        onClick={submitRefundRequest}
        disabled={refundLoading}
      />
    </div>
  </div>
</Dialog>

    </>
  );
};

export default PaymentHistory;
