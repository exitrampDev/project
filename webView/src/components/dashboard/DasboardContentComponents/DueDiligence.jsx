import React, { useRef, useState, useEffect } from "react";
import axios from "axios";
import { Toast } from "primereact/toast";
import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";
import { Dialog } from "primereact/dialog";
import notifInfo from "../../../assets/notifInfo.png";
import serachIcon from "../../../assets/serachIcon.png";
import userImg from "../../../assets/userImg.png";
import { useParams } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { apiBaseUrlState, authState } from "../../../recoil/ctaState";
import { InputText } from "primereact/inputtext";


const DueDiligence = () => {
  const toast = useRef(null);
  const { id } = useParams(); // NDA ID
  const API_BASE = useRecoilValue(apiBaseUrlState);
  const { user, access_token } = useRecoilValue(authState) ?? {};
   const [visible, setVisible] = useState(false);
   const [selectedSubmission, setSelectedSubmission] = useState(null);
   const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({
    category: null,
    reason: "",
  });

  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(false);
  const [dueDiligenceList, setDueDiligenceList] = useState([]);

  const flagOptions = [
    "Ownership",
    "Operations",
    "Competition",
    "Industry",
    "Financial",
    "Assets",
    "Customers",
    "Sales and Marketing",
    "Growth Opportunities",
    "Legal",
    "Employees and Staff",
    "Technology",
    "Other",
  ].map((item) => ({ label: item, value: item }));

  // =========================
  // Fetch Due Diligence List
  // =========================
  const fetchDueDiligence = async () => {
    if (!access_token) return;
    try {
      setListLoading(true);
      const res = await axios.get(`${API_BASE}/due-diligence/nda/${id}`, {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      setDueDiligenceList(res.data || []);
    } catch (err) {
      console.error("Error fetching due diligence list:", err.response?.data || err.message);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to fetch due diligence items.",
        life: 3000,
      });
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    fetchDueDiligence();
  }, [id, access_token]);

  // =========================
  // Handle Form Submit
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.category || !formData.reason.trim()) {
      toast.current.show({
        severity: "warn",
        summary: "Validation Error",
        detail: "Please select a category and enter a description.",
        life: 3000,
      });
      return;
    }

    if (!access_token) {
      toast.current.show({
        severity: "error",
        summary: "Unauthorized",
        detail: "Please login again to continue.",
        life: 3000,
      });
      return;
    }

    try {
      setLoading(true);

      const payload = {
        ndaId: String(id),
        shortDescription: String(formData.reason),
        category: String(formData.category),
      };

      await axios.post(`${API_BASE}/due-diligence`, payload, {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
      });

      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: "Due diligence item added successfully.",
        life: 3000,
      });

      setFormData({ category: null, reason: "" });
      fetchDueDiligence();
    } catch (err) {
      console.error("Error adding due diligence:", err.response?.data || err.message);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: err.response?.data?.message || "Failed to submit due diligence item.",
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // Table Templates
  // =========================
  const categoryTemplate = (rowData) =>
    rowData.category?.replace(/"/g, "") || "-";

  const descriptionTemplate = (rowData) =>
    rowData.shortDescription?.replace(/"/g, "") || "-";

  const dateTemplate = (rowData) =>
    new Date(rowData.createdAt).toLocaleString();

  const statusTemplate = (rowData) => {
    const status = rowData.status || "no_started";
    const statusMap = {
      no_started: { label: "Not Started", severity: "secondary" },
      in_progress: { label: "In Progress", severity: "warning" },
      completed: { label: "Completed", severity: "success" },
    };
    const s = statusMap[status] || statusMap.no_started;
    return <Tag value={s.label} severity={s.severity} />;
  };
  const openModal = (row) => {
    setSelectedSubmission(row);
    setVisible(true);
  };


const notesCreation = (rowData) => (
  <i
    className="pi pi-list cursor-pointer text-blue-600"
    onClick={() => openModal(rowData)}
  ></i>
);

const dltDiligence = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      await axios.delete(`${API_BASE}/due-diligence/${itemId}`, {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      toast.current.show({
        severity: "success",
        summary: "Deleted",
        detail: "Item deleted successfully.",
        life: 3000,
      });

      fetchDueDiligence();
    } catch (err) {
      console.error("Error deleting item:", err.response?.data || err.message);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to delete the item.",
        life: 3000,
      });
    }
  };
 const deleteTemplate = (rowData) => (
    <>
    
    



     {user?.user_type === "seller_central" ? ( <>
      <i
      class="pi pi-trash"
      onClick={() => dltDiligence(rowData._id)}
    ></i>
    </>) : "-"}
     
    
    
    </>
  );



const updateStatus = async (itemId, newStatus) => {
  if (!access_token) return;

  try {
    await axios.put(
      `${API_BASE}/due-diligence/${itemId}`,
      { status: newStatus }, // Payload
      { headers: { Authorization: `Bearer ${access_token}` } }
    );

    toast.current.show({
      severity: "success",
      summary: "Updated",
      detail: "Status updated successfully.",
      life: 2000,
    });

    fetchDueDiligence();
  } catch (err) {
    console.error("Error updating status:", err.response?.data || err.message);
    toast.current.show({
      severity: "error",
      summary: "Error",
      detail: "Failed to update status.",
      life: 3000,
    });
  }
};


const statusDropdownTemplate = (rowData) => {
  const statusOptions = [
    { label: "Not Started", value: "no_started" },
    { label: "In Progress", value: "in_progress" },
    { label: "Completed", value: "completed" },
  ];

  return (
    <Dropdown
      value={rowData.status || "no_started"}
      options={statusOptions}
      onChange={(e) => updateStatus(rowData._id, e.value)}
      className="w-full"
    />
  );
};

const handleSubmitComment = async (e, diligenceId) => {
  e.preventDefault();
  if (!message.trim()) return;

  setLoading(true);
  try {
    const res = await axios.post(
      `${API_BASE}/due-diligence/${diligenceId}/comments`,
      { message },
      {
        headers: { Authorization: `Bearer ${access_token}` },
      }
    );

    console.log("✅ Comment added:", res.data);
    setMessage(""); // clear input after submit
setVisible(false)
    // Refresh the selected item’s comments
    fetchDueDiligence();
  } catch (error) {
    console.error("❌ Error posting comment:", error);
  } finally {
    setLoading(false);
  }
};


  return (
    <>
      <Toast ref={toast} />

      {/* ---------- Header ---------- */}
      <div className="dashboard__header_block">
        <h3>Seller Central Due Diligence List</h3>
        <div className="dashboard__header_search_notification_wrap">
          <div className="dashboard__search_field_wrap">
            <input type="text" placeholder="Search" />
            <img src={serachIcon} alt="Search" />
          </div>
          <div className="dashboard__notification_wrap">
            <button>
              <img src={notifInfo} alt="Notifications" />
            </button>
          </div>
          <div className="dashboard__user_wrap">
            <button>
              <img src={userImg} alt="User" />
            </button>
          </div>
        </div>
      </div>

      {/* ---------- Info ---------- */}
      <div className="brief__infor_content">
        <p>
          Securely manage and share files with buyers who have been approved to
          access your CIM. All access is logged and controlled by you.
        </p>
      </div>

      {/* ---------- Form ---------- */}
      <div className="flag__form_wrap p-4 max-w-xl mt-6 border rounded-lg shadow-sm bg-white">
        

        <form onSubmit={handleSubmit} className="p-fluid flex flex-col gap-4">
          <div>
            <label className="block mb-2 font-medium">Category</label>
            <Dropdown
              value={formData.category}
              options={flagOptions}
              onChange={(e) => setFormData({ ...formData, category: e.value })}
              placeholder="Select a category"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">Description</label>
            <InputTextarea
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              rows={4}
              placeholder="Describe your concern..."
            />
          </div>

          <Button
          icon={"pi pi-send"}
            label={loading ? "Submitting..." : "Submit"}
            className="p-button-danger desc__create_submit"
            type="submit"
            disabled={loading}
          />
        </form>
      </div>

      {/* ---------- Data Table ---------- */}
      <div className="mt-8 bg-white p-4 border rounded-lg shadow-sm max-w-5xl">
 <div className="my__save_listing_wrap my__listing_table docRoom_data_table">
 <DataTable
          value={dueDiligenceList}
          loading={listLoading}
          paginator
          rows={5}
          stripedRows
          emptyMessage="No due diligence items found."
          sortMode="multiple"
        >
          <Column field="category" header="Category" body={categoryTemplate} sortable />
          <Column field="shortDescription" header="Description" body={descriptionTemplate} sortable />
          <Column field="status" header="Status" body={statusTemplate} sortable />
          <Column field="createdAt" header="Created At" body={dateTemplate} sortable />
            <Column field="status" header="Status" body={statusDropdownTemplate}  />
          <Column field="_id" header="Notes" body={notesCreation} />
          <Column field="createdAt" header="Action" body={deleteTemplate}  />
        </DataTable>

 </div>
       
      </div>
      <Dialog
        header="Seller Central Due Diligence Notes"
        visible={visible}
        style={{ width: "500px" }}
        onHide={() => setVisible(false)}
        className="nda__buyer_submission_details_wrap"
        >
        {selectedSubmission ? (
            <div className="modal__notes_commets_wrap">

            <div className="modal__notes_commets_discussion_block">
                {selectedSubmission.comments && selectedSubmission.comments.length > 0 ? (
                selectedSubmission.comments.map((comment, index) => (
                    <div key={index}
                    
                      className={`modal__notes_commets_discussion_list ${
                            `${user?.first_name} ${user?.last_name}` === comment.author
                            ? "my-comment"
                            : ""
                        }`}>
                        <div className="modal__notes_commets_discussion_date">
                             <strong className="modal__notes_commets_discussion_name_author">{comment.author || "Anonymous"}:</strong>{" "}
                            {new Date(comment.createdAt).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            })}
                        </div>
                       <div className="modal__notes_commets_discussion_block_content">
                        <strong className="modal__notes_commets_discussion_name_author">{(comment.author?.charAt(0)?.toUpperCase() || "A")}</strong>{" "}
                            <div className="modal__notes_commets_discussion_comment"> {comment.message}</div>
                       </div>
                      
                    </div>
                ))
                ) : (
                <p className="text-gray-500 text-sm">No comments yet.</p>
                )}
                 
            </div>
         <form
            onSubmit={(e) => handleSubmitComment(e, selectedSubmission._id)}
            className="commect__submit"
            >
            <span className="p-input-icon-left flex-grow">
                <i className="pi pi-comment" />
                <InputText
                placeholder="Write a comment..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full"
                />
            </span>

            <Button
                type="submit"
                label={loading ? "Posting..." : "Submit"}
                icon={loading ? "pi pi-spin pi-spinner" : "pi pi-send"}
                disabled={loading || !message.trim()}
                className=" p-button-primary"
            />
            </form>


            </div>
        ) : (
            <p className="text-gray-500">No data found.</p>
        )}
        </Dialog>

    </>
  );
};

export default DueDiligence;
