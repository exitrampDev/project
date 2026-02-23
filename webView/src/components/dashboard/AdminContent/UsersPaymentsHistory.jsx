// UserPaymentHistory.jsx
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useRecoilValue } from "recoil";
import { apiBaseUrlState, authState } from "../../../recoil/ctaState";
import { Toast } from "primereact/toast";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import DashboardHeader from "../DasboardContentComponents/DashboardHeaderBlock";
import { Link } from "react-router-dom";

const PaymentHistory = () => {
  const toast = useRef(null);
  const API_BASE = useRecoilValue(apiBaseUrlState);
  const { access_token } = useRecoilValue(authState) ?? {};

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [limit, setLimit] = useState(10);

  // Popup state
  const [visible, setVisible] = useState(false);
  const [singlePayment, setSinglePayment] = useState(null);
  const [loadingSingle, setLoadingSingle] = useState(false);

  const [refundVisible, setRefundVisible] = useState(false);
const [selectedPayment, setSelectedPayment] = useState(null);
const [adminComment, setAdminComment] = useState("");
const [refundLoading, setRefundLoading] = useState(false);



// console.log("singlePayment data:", singlePayment);
  // Fetch payments list
  const fetchPayments = async (pageNumber = 1) => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/payment/all?page=${pageNumber}`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      setPayments(res.data.data || []);
      setTotalRecords(res.data.total);
      setLimit(res.data.limit || 10);
    } catch (err) {
      console.error("Error loading payments:", err);
      alert("Unable to load payment history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments(page);
  }, [page]);

  const onPageChange = (e) => {
    const newPage = e.page + 1;
    setPage(newPage);
  };


const handleRefundAction = async (type) => {
  if (!selectedPayment?._id) return;

  if (!adminComment.trim()) {
    alert("Please enter a comment.");
    return;
  }

  const endpoint =
    type === "approve"
      ? `${API_BASE}/payment/refund-approve`
      : `${API_BASE}/payment/refund-reject`;

  try {
    setRefundLoading(true);

    await axios.post(
      endpoint,
      {
        paymentId: selectedPayment._id,
        commentByAdmin: adminComment,
      },
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    alert(`Refund ${type === "approve" ? "approved" : "rejected"} successfully!`);

    setRefundVisible(false);
    setSelectedPayment(null);

    // Refresh list
    fetchPayments(page);
  } catch (err) {
    console.error("Refund action error:", err);
    alert("Something went wrong. Please try again.");
  } finally {
    setRefundLoading(false);
  }
};


  // Format date
  const dateTemplate = (row) => {
    return new Date(row.updatedAt).toLocaleString();
  };

  // Payment Status Tag
  const statusTemplate = (row) => {
    const severity =
      row.paymentStatus === "succeeded"
        ? "success"
        : row.paymentStatus === "pending"
        ? "warning"
        : "danger";

    return <Tag value={row.paymentStatus} severity={severity} />;
  };

  // Fetch single payment details
  const fetchSinglePayment = async (data) => {
    setSinglePayment(data);
    setVisible(true);
    // try {
    //   setLoadingSingle(true);
    //   const res = await axios.get(`${API_BASE}/payment/${id}`, {
    //     headers: {
    //       Authorization: `Bearer ${access_token}`,
    //     },
    //   });

    //   setVisible(true);
    // } catch (error) {
    //   console.error("Error loading single payment:", error);
    // } finally {
    //   setLoadingSingle(false);
    // }
  };
const handleBlockListing = async (listingId,statusGet) => {
  // console.log("handleBlockListing called with:", listingId, statusGet);
  if (!listingId) return;
  try {
   
    await axios.patch(
      `${API_BASE}/business-listing/${listingId}/update-business-status`,
      { status: statusGet },
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    toast.current.show({
      severity: "success",
      detail: `Listing has been ${statusGet} successfully.`,
      life: 4000,
    });
  } catch (err) {
    console.error("❌ Error blocking listing:", err);
    alert("Failed to block listing. Please try again.");
  }
};
  // Action btn
  const actionTemplate = (row) => (
    <div className="action__listing_btns inv_poup">
      {row.paymentStatus === "SUCCEEDED" ? (<>


      {row?.refundStatus === "NOT_REQUESTED" ? (
        <Button
          label="Request Not Received "
          icon="pi pi-money-bill"
          className="p-button-text p-button-sm btn-invoice"
          tooltip="Request for refund"
          tooltipOptions={{ position: "top" }}
        />
      ) : (
        
      <>
      {row?.refundStatus === "PENDING" ? 
        <Button
        label="Take Action"
        icon="pi pi-money-bill"
        className="p-button-text p-button-sm btn-invoice"
        onClick={() => {
          setSelectedPayment(row);
          setAdminComment("");
          setRefundVisible(true);
        }}
        tooltip="Refund already requested"
        tooltipOptions={{ position: "top" }}
      />
        : <>
        
          <Tag value={row?.refundStatus} severity={row?.refundStatus === "APPROVED" ? "success" : "danger"} />
         <Button
        label="Block Listing"
        className="p-button-text p-button-sm btn-invoice"
        onClick={() => {
          handleBlockListing(row?.referenceId?._id,"block");
        }}
        tooltip="Block Listing"
        tooltipOptions={{ position: "top" }}
      />
        </>}
      </>
      )
    }

      

     <Button
    icon="pi pi-eye "
    className="p-button-text p-button-sm btn-invoice"
    onClick={() => fetchSinglePayment(row)}
    tooltip="View  listings"
    tooltipOptions={{ position: "top" }}
  />
        </>
      ) : (
        <div className="action__listing_btns">
      <i
        className="pi pi-eye cursor-pointer text-blue-500 hover:text-blue-700"
        onClick={() => fetchSinglePayment(row._id)}
      ></i>
    </div>
      )}
    </div>
  );

  // NESTED FIELDS TEMPLATES
  const userNameTemplate = (row) =>
    row?.userId
      ? `${row.userId.first_name} ${row.userId.last_name}`
      : "-";

  const emailTemplate = (row) => row?.userId?.email || "-";

const listingTitleTemplate = (row) => {
  const title = row?.referenceId?.listingTitle || "-";
  if (title === "-") return title;

  const words = title.trim().split(/\s+/);
  return words.length > 6 ? words.slice(0, 6).join(" ") + "..." : title;
};


  const businessNameTemplate = (row) =>
    row?.referenceId?.businessName || "-";


const formatUserType = (value) => {
  if (!value) return "-";

  return value
    .split("_")
    .map(
      word => word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(" ");
};



  return (
    <>
     <Toast ref={toast} />
      <DashboardHeader headingData="Payment History" />

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
          className="userPaymentHistoryTable__wrapper"
        >
          <Column header="Listing Title" body={listingTitleTemplate} />
          <Column
  header="Listing ID / Link"
  body={(row) =>
    row?.referenceId?._id ? (
      <Link
        to={`/user/single-listing/${row.referenceId._id}`}
        className="text-blue-600 underline"
      >
        {row.referenceId._id}
      </Link>
    ) : (
      "-"
    )
  }
/>

{/* <Column header="Stripe Customer ID" body={(row) => row?.userId?.stripe_customer_id || "-"} />
    <Column header="Stripe Customer ID" body={(row) => row?.userId?.stripe_customer_id || "-"} />
<Column header="Stripe Payment ID" body={(row) => row?.paymentIntentId || "-"} /> */}
{/* <Column header="User Refund Reason" body={(row) => row?.refundReason || "-"} />
<Column header="Admin Comment" body={(row) => row?.refundCommentByAdmin || "-"} /> */}

          
  <Column
  header="Amount ($)"
  body={(row) =>
    row?.amount || row?.amount === 0
      ? `$${(row.amount / 100).toLocaleString()}`
      : "-"
  }
/>
<Column
  header="Listing Owner Type"
  body={(row) => formatUserType(row?.userId?.user_type)}
/>

          {/* <Column header="User" body={userNameTemplate} />
          <Column header="Email" body={emailTemplate} /> */}

          {/* <Column
            field="transactionDateTime"
            header="Date"
            body={dateTemplate}
            style={{ width: "200px" }}
          /> */}

          <Column header="Refund Requests" body={actionTemplate} />
        </DataTable>
      </div>

      {/* Invoice Popup */}
      <Dialog
        visible={visible}
        style={{ width: "900px" }}
        className="invoice__box_admin_pop"
        onHide={() => setVisible(false)}
      >
        {loadingSingle ? (
          <p>Loading...</p>
        ) : singlePayment ? (
          <>
          <div className="invoice__box_admin__wrapper">
            <h2 className="invoice__header_haeding">Payment Invoice</h2>
            <div className="invoice__box_admin_preview">

              <div className="listing__data_admin_invoice"><strong>User:</strong> 
                {singlePayment?.userId?.first_name}{" "}
                {singlePayment?.userId?.last_name}
              </div>
              <div className="listing__data_admin_invoice"><strong>Email:</strong> {singlePayment?.userId?.email}</div>
              <div className="listing__data_admin_invoice"><strong>Amount:</strong>               
              {singlePayment?.amount ? `$${(singlePayment.amount / 100).toLocaleString()}` : "-"}
             </div>
              <div className="listing__data_admin_invoice"><strong>Customer Strip ID:</strong> {singlePayment?.userId?.stripe_customer_id}</div>
              <div className="listing__data_admin_invoice"><strong>App Transaction ID:</strong> {singlePayment._id}</div>
              <div className="listing__data_admin_invoice">
                <strong>Stripe Payment ID:</strong>{" "}
                {singlePayment?.paymentIntentId}
              </div>
             <div className="listing__data_admin_invoice">
                <strong>Payment For:</strong>{" "}
                {singlePayment?.paymentFor
                  ?.toLowerCase()
                  .split("_")
                  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ") || "-"}
              </div>


              <div className="listing__data_admin_invoice">
                <strong>Listing Created Data:</strong>{" "}
                {new Date(singlePayment.createdAt).toLocaleString()}
              </div>
              <div className="listing__data_admin_invoice"><strong>Payment Status:</strong> {singlePayment?.paymentStatus}</div>
              <div className="listing__data_admin_invoice"><strong>Refund Status:</strong> {singlePayment?.refundStatus}</div>

              <div className="listing__data_admin_invoice">
                <strong>Refund Requested At:</strong>{" "}
                {new Date(singlePayment.refundRequestedAt).toLocaleString()}
              </div>

              <div className="listing__data_admin_invoice">
                <strong>Refund Resolved At:</strong>{" "}
                {singlePayment?.refundResolvedAt ? new Date(singlePayment.refundResolvedAt).toLocaleString() : "-"}
              </div>
              <div className="listing__data_admin_invoice refund_reason_invoice">
                <strong>Refund Reason User:</strong>{" "}
                {singlePayment?.refundReason ? singlePayment?.refundReason : "-"}
              </div>

              <div className="listing__data_admin_invoice refund_comment_by_admin_invoice">
                <strong>Admin Comment:</strong>{" "}
                {singlePayment?.refundCommentByAdmin ? singlePayment?.refundCommentByAdmin : "-"}
              </div>
            </div>
            <div className="inv__footer"><div className="copyright__content_footer_inv">© {new Date().getFullYear()} ExitRamp. All rights reserved.</div></div>
          </div>
          </>
        ) : (
          <p>No data available</p>
        )}
      </Dialog>
      <Dialog
  header="Refund Action"
  visible={refundVisible}
  style={{ width: "600px" }}
  modal
  onHide={() => setRefundVisible(false)}
>
  <div className="refund__popup_admin">
    <p>
      <strong>Payment ID:</strong> {selectedPayment?._id || "-"}
    </p>

    <p>
      <strong>User:</strong>{" "}
      {selectedPayment?.userId
        ? `${selectedPayment.userId.first_name} ${selectedPayment.userId.last_name}`
        : "-"}
    </p>

    <p>
      <strong>Amount:</strong>{" "}
      {selectedPayment?.amount ? `$${(selectedPayment.amount / 100).toLocaleString()}` : "-"}
    </p>

    <div className="mt-3">
      <label className="block font-semibold mb-2">Admin Comment</label>

      <textarea
        value={adminComment}
        onChange={(e) => setAdminComment(e.target.value)}
        rows={4}
        placeholder="Write comment..."
        className="w-full p-2 border rounded"
      />
    </div>

    <div className="flex gap-2 justify-end mt-4">
      <Button
        label="Reject"
        icon="pi pi-times"
        className="p-button-danger-admin"
        loading={refundLoading}
        onClick={() => handleRefundAction("reject")}
      />

      <Button
        label="Approve"
        icon="pi pi-check"
        className="p-button-success-admin"
        loading={refundLoading}
        onClick={() => handleRefundAction("approve")}
      />
    </div>
  </div>
</Dialog>

    </>
  );
};

export default PaymentHistory;
