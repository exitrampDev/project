// PaymentHistory.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRecoilValue } from "recoil";
import { apiBaseUrlState, authState } from "../../../recoil/ctaState";
import DashboardHeader from "./DashboardHeaderBlock";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";

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
      const res = await axios.get(`${API_BASE}/payment?page=${pageNumber}`, {
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
    return new Date(row.transactionDateTime).toLocaleString();
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
        >
            
          <Column field="_id" header="ID" style={{ width: "250px" }} />
          <Column field="amount" header="Amount ($)" />
          <Column field="paymentFor" header="Payment For" />
          <Column
            field="paymentStatus"
            header="Status"
            body={statusTemplate}
            style={{ width: "140px" }}
          />
          
          <Column
            field="transactionDateTime"
            header="Date"
            body={dateTemplate}
            style={{ width: "200px" }}
          />
          
          <Column header="Action" body={actionTemplate} />
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
              <p><strong>User ID:</strong> {singlePayment.userId}</p>
              <p><strong>Amount:</strong> ${singlePayment.amount}</p>
              <p><strong>Payment For:</strong> {singlePayment.paymentFor}</p>
              <p>
                <strong>Status:</strong>{" "}
                <Tag value={singlePayment.paymentStatus} />
              </p>
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
