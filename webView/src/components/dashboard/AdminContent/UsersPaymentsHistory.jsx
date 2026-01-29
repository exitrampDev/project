// UserPaymentHistory.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRecoilValue } from "recoil";
import { apiBaseUrlState, authState } from "../../../recoil/ctaState";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import DashboardHeader from "../DasboardContentComponents/DashboardHeaderBlock";
import { Link } from "react-router-dom";

const PaymentHistory = () => {
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
  const fetchSinglePayment = async (id) => {
    try {
      setLoadingSingle(true);
      const res = await axios.get(`${API_BASE}/payment/${id}`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      setSinglePayment(res.data);
      setVisible(true);
    } catch (error) {
      console.error("Error loading single payment:", error);
    } finally {
      setLoadingSingle(false);
    }
  };

  // Action btn
  const actionTemplate = (row) => (
    <div className="action__listing_btns">
      <i
        className="pi pi-eye cursor-pointer text-blue-500 hover:text-blue-700"
        onClick={() => fetchSinglePayment(row._id)}
      ></i>
    </div>
  );

  // NESTED FIELDS TEMPLATES
  const userNameTemplate = (row) =>
    row?.userId
      ? `${row.userId.first_name} ${row.userId.last_name}`
      : "-";

  const emailTemplate = (row) => row?.userId?.email || "-";

  const listingTitleTemplate = (row) =>
    row?.referenceId?.listingTitle || "-";

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
          className="p-datatable-gridlines"
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

          
  <Column
  header="Amount ($)"
  body={(row) =>
    row?.amount || row?.amount === 0
      ? `$${(row.amount / 100).toLocaleString()}`
      : "-"
  }
/>

          <Column header="User" body={userNameTemplate} />
          <Column header="Email" body={emailTemplate} />
          <Column header="Stripe Customer ID" body={(row) => row?.userId?.stripe_customer_id || "-"} />
<Column
  header="Listing Owner Type"
  body={(row) => formatUserType(row?.userId?.user_type)}
/>


        

        

          <Column
            field="transactionDateTime"
            header="Date"
            body={dateTemplate}
            style={{ width: "200px" }}
          />

          {/* <Column header="Action" body={actionTemplate} /> */}
        </DataTable>
      </div>

      {/* Invoice Popup */}
      <Dialog
        header="Payment Invoice"
        visible={visible}
        style={{ width: "600px" }}
        modal
        onHide={() => setVisible(false)}
      >
        {loadingSingle ? (
          <p>Loading...</p>
        ) : singlePayment ? (
          <div className="invoice__wrapper">
            <div className="invoice__box">
              <p><strong>Transaction ID:</strong> {singlePayment._id}</p>

              <p><strong>User:</strong> 
                {singlePayment?.userId?.first_name}{" "}
                {singlePayment?.userId?.last_name}
              </p>

              <p><strong>Email:</strong> {singlePayment?.userId?.email}</p>

              <p>
                <strong>Listing:</strong>{" "}
                {singlePayment?.objectId?.listingTitle}
              </p>

              <p>
                <strong>Business:</strong>{" "}
                {singlePayment?.objectId?.businessName}
              </p>

              <p><strong>Amount:</strong> ${singlePayment.amount}</p>

              {/* <p><strong>Payment For:</strong> {singlePayment.paymentFor}</p> */}


              <p>
                <strong>Date:</strong>{" "}
                {new Date(singlePayment.transactionDateTime).toLocaleString()}
              </p>
            </div>
          </div>
        ) : (
          <p>No data available</p>
        )}
      </Dialog>
    </>
  );
};

export default PaymentHistory;
