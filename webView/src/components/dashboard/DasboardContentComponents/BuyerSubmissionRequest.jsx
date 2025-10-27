import React, { useEffect, useState } from "react";
import notifInfo from "../../../assets/notifInfo.png";
import serachIcon from "../../../assets/serachIcon.png";
import userImg from "../../../assets/userImg.png";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import axios from "axios";
import { useRecoilValue } from "recoil";
import { authState, apiBaseUrlState } from "../../../recoil/ctaState";
import { Tag } from "primereact/tag";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Link } from "react-router-dom";

const BuyerSubmissionRequest = () => {
  const [buyerSubmissions, setBuyerSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { access_token } = useRecoilValue(authState) ?? {};
  const apiBaseUrl = useRecoilValue(apiBaseUrlState);
  const [search, setSearch] = useState("");
  const [visible, setVisible] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const toast = React.useRef(null);

  // Fetch Buyer NDA submissions
  useEffect(() => {
    fetchBuyerSubmissions();
  }, []);

  const fetchBuyerSubmissions = async () => {
    try {
      const { data } = await axios.get(`${apiBaseUrl}/nda/owner-submissions`, {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      setBuyerSubmissions(data.data);
    } catch (error) {
      console.error("Error fetching Buyer NDA submissions:", error);
    } finally {
      setLoading(false);
    }
  };

  // Search filter
  const filteredData = buyerSubmissions.filter((item) =>
    item.businessName?.toLowerCase().includes(search.toLowerCase())
  );

  const listingBuyerName = (businessId, name) => (
    <>
     <span>{name}</span>
    </>
  );

  const formatDate = (dateStr) =>
    dateStr
      ? new Date(dateStr).toLocaleString("en-US", {
          year: "numeric",
          month: "short",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "—";

  const ndaStatusTemplate = (row) => {
    const status = row.ndaStatus?.toLowerCase();
    const severity =
      status === "approved"
        ? "success"
        : status === "pending"
        ? "warning"
        : "danger";
    return <Tag value={row.ndaStatus} severity={severity} />;
  };

  // Open Modal
  const openModal = (row) => {
    setSelectedSubmission(row);
    setVisible(true);
  };

  // Approve / Reject handlers
  const handleNDAAction = async (actionType) => {
    if (!selectedSubmission?._id) return;

    const url =
      actionType === "approve"
        ? `${apiBaseUrl}/nda/approve`
        : `${apiBaseUrl}/nda/reject`;

    setSubmitting(true);
    try {
      await axios.patch(
        url,
        { ndaId: selectedSubmission._id },
        {
          headers: { Authorization: `Bearer ${access_token}` },
        }
      );

      toast.current.show({
        severity: "success",
        summary: `NDA ${actionType === "approve" ? "Approved" : "Rejected"}`,
        life: 3000,
      });

      setVisible(false);
      fetchBuyerSubmissions();
    } catch (err) {
      toast.current.show({
        severity: "error",
        summary: "Action Failed",
        detail: err?.response?.data?.message || "Please try again",
        life: 3000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const ndaViewActionTemplate = (row) => (
    <Button
      label="View Buyer Submission"
      link
      onClick={() => openModal(row)}
      className="viewBuyer__button"
    />
  );


const DueDiligenceAction = (statusNDA, Id) => { 
  return (
    <>
 {statusNDA === "approved" ? (<><Link to={`/user/due-diligence/${Id}`}> view</Link></>) : statusNDA === "pending" ? (<><Tag value={statusNDA} severity="warning" /></>) : (<><Tag value={statusNDA} severity="danger" /></>)}
    </>
  );
}


  return (
    <>
      <Toast ref={toast} />

      <div className="dashboard__header_block">
        <h3 className="heading__Digital_CIM">Buyer Submissions</h3>

        <div className="dashboard__header_search_notification_wrap">
          <div className="dashboard__search_field_wrap">
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <img src={serachIcon} alt="search" />
          </div>
          <div className="dashboard__notification_wrap">
            <button>
              <img src={notifInfo} alt="notification" />
            </button>
          </div>
          <div className="dashboard__user_wrap">
            <button>
              <img src={userImg} alt="user" />
            </button>
          </div>
        </div>
      </div>

      <div className="brief__infor_content">
        <p>
          These buyers have shown interest in your listing by submitting a
          completed buyer profile and NDA. Review their information and
          determine if they’re a potential fit.
        </p>
      </div>

      <div className="my__save_listing_wrap my__listing_table nda__request_block">
        <DataTable
          value={filteredData}
          loading={loading}
          paginator
          rows={10}
          stripedRows
          emptyMessage="No Buyer Submission"
          responsiveLayout="scroll"
        >
          <Column
            body={(rowData) =>
              listingBuyerName(rowData.businessId, rowData.businessName)
            }
            header="Name"
            sortable
          />
          <Column field="buyerName" header="Business Name" sortable />
          <Column field="submittedByEmail" header="Email" />
          <Column
            field="submittedOn"
            header="Submitted On"
            body={(row) => formatDate(row.submittedOn)}
          />
          <Column
            field="sellerResponseOn"
            header="Seller Responded On"
            body={(row) => formatDate(row.sellerResponseOn)}
          />
          <Column
            field="ndaStatus"
            header="NDA Status"
            body={ndaStatusTemplate}
            sortable
          />
          <Column body={(row) => DueDiligenceAction(row.ndaStatus, row.businessId)} header="Due Diligence" />
          <Column header="Action" body={ndaViewActionTemplate} />
        </DataTable>
      </div>

      {/* NDA Modal */}
      <Dialog
        header="Buyer Submission Details"
        visible={visible}
        style={{ width: "500px" }}
        onHide={() => setVisible(false)}
        className="nda__buyer_submission_details_wrap"
      >
        {selectedSubmission && (
          <div className="nda__modal_content">
            <div className="nda__content_modal_element">
              <strong>Buyer Name:</strong> {selectedSubmission?.buyerName ? selectedSubmission.buyerName : "-"}
            </div>
            <div className="nda__content_modal_element">
              <strong>Email:</strong> {selectedSubmission?.submittedByEmail ? selectedSubmission.submittedByEmail : "-"}
            </div>
            <div className="nda__content_modal_element">
              <strong>Organization:</strong> {selectedSubmission?.organization ? selectedSubmission.organization : "-"}
            </div>
            <div className={selectedSubmission?.ndaStatus ? `nda__content_modal_element ${selectedSubmission.ndaStatus}` : "nda__content_modal_element" }>
              <strong>Status:</strong> <span>{selectedSubmission?.ndaStatus ? selectedSubmission.ndaStatus : "-"}</span>
            </div>

            <div className="nda__modal_actions" >
              <Button
                label="Share CIM"
                onClick={() => handleNDAAction("approve")}
                loading={submitting}
                className="btn__NDARequest_shareCIM"
              />
              <Button
                label="Decline Access"
                onClick={() => handleNDAAction("reject")}
                loading={submitting}
                className="btn__NDARequest_decline"
              />
            </div>
          </div>
        )}
      </Dialog>
    </>
  );
};

export default BuyerSubmissionRequest;
