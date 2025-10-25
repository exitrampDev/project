import { useParams, Link } from "react-router-dom";
import notifInfo from "../../../assets/notifInfo.png";
import serachIcon from "../../../assets/serachIcon.png";
import userImg from "../../../assets/userImg.png";
import { useRecoilValue } from "recoil";
import { apiBaseUrlState, authState } from "../../../recoil/ctaState";
import { Toast } from "primereact/toast";
import React, { useRef, useState, useEffect } from "react";
import axios from "axios";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

const CreateCIM = () => {
  const { id } = useParams();
  const API_BASE = useRecoilValue(apiBaseUrlState);
  const { access_token } = useRecoilValue(authState) ?? {};
  const toast = useRef(null);

  const [hasCIM, setHasCIM] = useState(false);
  const [cimFiles, setCimFiles] = useState([]);

  // 🔹 Upload CIM file
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("displayName", file.name);
    formData.append("typeName", "cim_file");

    try {
      const res = await axios.post(`${API_BASE}/files/${id}/upload`, formData, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      toast.current.show({
        severity: "success",
        summary: "Upload Successful",
        detail: res?.data?.message || "File uploaded successfully",
        life: 3000,
      });

      fetchListings(); // refresh file list after upload
    } catch (err) {
      console.error("Error uploading file:", err);
      toast.current.show({
        severity: "error",
        summary: "Upload Failed",
        detail: "Could not upload the file",
        life: 3000,
      });
    }
  };

  // 🔹 Fetch all files for this listing
  const fetchListings = async () => {
    try {
      const res = await axios.get(`${API_BASE}/files/${id}`, {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      const files = res.data || [];
      const cimOnly = files.filter((file) => file.typeName === "cim_file");

      if (cimOnly.length > 0) {
        setHasCIM(true);
        setCimFiles(cimOnly);
      } else {
        setHasCIM(false);
        setCimFiles([]);
      }
    } catch (err) {
      console.error("Error fetching listings:", err);
    }
  };
// 🔹 Delete CIM File
const handleDelete = async (fileId) => {
  if (!window.confirm("Are you sure you want to delete this file?")) return;

  try {
    await axios.delete(`${API_BASE}/files/${fileId}`, {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    toast.current.show({
      severity: "success",
      summary: "Deleted",
      detail: "File deleted successfully",
      life: 3000,
    });

    // Refresh the table after deletion
    fetchListings();
  } catch (err) {
    console.error("Error deleting file:", err);
    toast.current.show({
      severity: "error",
      summary: "Delete Failed",
      detail: "Could not delete the file",
      life: 3000,
    });
  }
};

  useEffect(() => {
    if (access_token) {
      fetchListings();
    }
  }, [access_token, id]);

  return (
    <>
      <Toast ref={toast} />

      <div className="dashboard__header_block">
        <h3 className="heading__Digital_CIM">
          Confidential Information Memorandum
        </h3>

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

      <div className="brief__infor_content">
        <p>
          This information is used to generate your Confidential Information
          Memorandum (CIM) and prepare your business for buyer review.
        </p>
      </div>

      <div className="form__for_cim_wrap">
        <div className="form__for_cim_intro_content">
          Welcome to the Seller Central CIM Creation. As part of our Seller
          Central upgrade, you can now manage your CIM directly in Exit Ramp.
          Our current function allows you to upload a CIM that you've created via
          a PDF file. In the future, you will have the ability to upload your CIM
          via PDF and/or build an electronic CIM using the available fields that
          we've made available to all Seller Central customers.
        </div>

        {/* 🔹 Conditional Rendering */}
        {!hasCIM ? (
          // Show upload section
          <div className="cim__file_exchange_wrap">
            <div className="cim__file_exchange_download_wrap">
              <Link to={`/`} className="cim__file_exchange_ins_btn">
                Download Instructions
              </Link>
              <span>|</span>
              <Link to={`/`} className="cim__file_exchange_temp_btn">
                Download Template
              </Link>
            </div>

            <div className="cim__file_exchange_upload__cimbtn">
              <label className="p-button p-component cursor-pointer cim__file_exchange_upload_btn">
                <i className="pi pi-file mr-2"></i> Upload CIM{" "}
                <span>(PDF only)</span>
                <input
                  type="file"
                  hidden
                  onChange={handleFileUpload}
                  accept=".pdf"
                />
              </label>
              <p>
                <i className="pi pi-exclamation-triangle"></i> Carefully Upload
                the files. Once uploaded, it will be saved to our CIM Module.
              </p>
            </div>
          </div>
        ) : (
          // Show CIM data table
          <div className="cim__data_table_wrap mt-4">
             <div className="my__save_listing_wrap my__listing_table cim__file_data_tablw_view">
            <DataTable
              value={cimFiles}
              tableStyle={{ minWidth: "40rem" }}
              stripedRows
            >

              
              <Column field="displayName" header="File Name" />
              <Column field="typeName" header="CIM Type" />
              <Column
                field="createdAt"
                header="Uploaded On"
                body={(rowData) =>
                  new Date(rowData.createdAt).toLocaleString()
                }
              />
              <Column
                header="Action"
                body={(rowData) => (
                  <div className="action__btn_file">
                    <a
                      href={`${API_BASE}${rowData.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-button p-component p-button-sm"
                    >
                      View
                    </a>

                    <div
                      onClick={() => handleDelete(rowData._id)}
                      className="fiel_dlt_btn p-button p-component p-button-sm"
                    >
                      Delete
                    </div>
                  </div>
                )}
              />

            </DataTable>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CreateCIM;
