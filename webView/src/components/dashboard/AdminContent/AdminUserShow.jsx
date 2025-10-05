import React, { useEffect, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import notifInfo from "../../../assets/notifInfo.png";
import serachIcon from "../../../assets/serachIcon.png";
import userImg from "../../../assets/userImg.png";

const AdminUserShow = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => {
        setUsers(data); // assuming API returns an array of users
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching users:", err);
        setLoading(false);
      });
  }, []);
  const formatDate = (isoDate) => {
    if (!isoDate) return "-";
    const date = new Date(isoDate);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };
  return (
    <>
      <div className="dashboard__header_block mb-4">
        <h3>Users</h3>

        <div className="dashboard__header_search_notification_wrap">
          <div className="dashboard__search_field_wrap">
            <input type="text" placeholder="Search" />
            <img src={serachIcon} alt="" />
          </div>
          <div className="dashboard__notification_wrap">
            <button>
              <img src={notifInfo} alt="" />
            </button>
          </div>
          <div className="dashboard__user_wrap">
            <button>
              <img src={userImg} alt="" />
            </button>
          </div>
        </div>
      </div>

      <div className="card mt-2">
        <DataTable
          value={users}
          paginator
          rows={10}
          loading={loading}
          responsiveLayout="scroll"
        >
          <Column field="first_name" header="First Name" />
          <Column field="last_name" header="Last Name" />
          <Column field="email" header="Email" />
          <Column field="phone_number" header="Phone Number" />
          <Column field="user_type" header="User Type" />
          <Column field="email_verified" header="Verified" />
          <Column
            field="createdAt"
            header="Created At"
            body={(row) => formatDate(row.createdAt)}
          />
        </DataTable>
      </div>
    </>
  );
};

export default AdminUserShow;
