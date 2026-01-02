import React, { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { useRecoilValue } from "recoil";
import { Toast } from "primereact/toast";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { FileUpload } from "primereact/fileupload";

import DashboardHeader from "./DashboardHeaderBlock";
import { apiBaseUrlState, authState } from "../../../recoil/ctaState";

const CreateCIM = () => {
  const { id } = useParams();
  const API_BASE = useRecoilValue(apiBaseUrlState);
  const { access_token } = useRecoilValue(authState) ?? {};
  const toast = useRef(null);

  const [cimFiles, setCimFiles] = useState([]);
  const [supportingFiles, setSupportingFiles] = useState([]);

  /* =======================
     FETCH FILES
  ======================= */
  const fetchFiles = async () => {
    try {
      const res = await axios.get(`${API_BASE}/files/${id}`, {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      const files = res.data || [];

      setCimFiles(files.filter((f) => f.typeName === "cim_file"));
      setSupportingFiles(
        files.filter((f) => f.typeName === "cim_supporting_file")
      );
    } catch (err) {
      console.error("Fetch files error:", err);
    }
  };

  useEffect(() => {
    if (access_token) fetchFiles();
  }, [access_token, id]);

  /* =======================
     UPLOAD HANDLER
  ======================= */
  const handleFileUpload = async (file, label, typeName) => {
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.current.show({
        severity: "warn",
        summary: "Invalid File",
        detail: "Only PDF files are allowed",
        life: 3000,
      });
      return;
    }

    // Prevent multiple CIM uploads
    if (typeName === "cim_file" && cimFiles.length > 0) {
      toast.current.show({
        severity: "info",
        summary: "CIM Exists",
        detail: "Please delete the existing CIM before uploading a new one.",
        life: 3000,
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("displayName", label);
    formData.append("typeName", typeName);

    try {
      await axios.post(`${API_BASE}/files/${id}/upload`, formData, {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      toast.current.show({
        severity: "success",
        summary: "Upload Successful",
        detail: `${label} uploaded successfully`,
        life: 3000,
      });

      fetchFiles();
    } catch (err) {
      console.error("Upload error:", err);
      toast.current.show({
        severity: "error",
        summary: "Upload Failed",
        detail: "Could not upload the file",
        life: 3000,
      });
    }
  };

  /* =======================
     DELETE FILE
  ======================= */
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

      fetchFiles();
    } catch (err) {
      console.error("Delete error:", err);
      toast.current.show({
        severity: "error",
        summary: "Delete Failed",
        detail: "Could not delete the file",
        life: 3000,
      });
    }
  };
const isDocumentUploaded = (label) => {
  return supportingFiles.some(
    (file) => file.displayName === label
  );
};
  return (
    <>
      <Toast ref={toast} />

      <DashboardHeader headingData="Confidential Information Memorandum" />

      <div className="brief__infor_content">
        <p>
          Upload your CIM and supporting financial documents. These files will be securely stored and shared with qualified buyers.

        </p>
      </div>

      <div className="form__for_cim_wrap">
        {/* <div className="form__for_cim_intro_content">
          Upload your CIM and supporting financial documents. These files will
          be securely stored and shared with qualified buyers.
        </div> */}

        {/* =======================
            MAIN CIM UPLOAD
        ======================= */}
        {cimFiles.length === 0 && (
          <div className="cim__file_exchange_wrap">
            <div className="cim__file_exchange_download_wrap">
              <Link to="/" className="cim__file_exchange_ins_btn">
                Download Instructions
              </Link>
              <span>|</span>
              <Link to="/" className="cim__file_exchange_temp_btn">
                Download Template
              </Link>
            </div>

            <label className="p-button p-component cursor-pointer cim__file_exchange_upload_btn">
              <i className="pi pi-file mr-2"></i> Upload CIM (PDF only)
              <input
                type="file"
                hidden
                accept=".pdf"
                onChange={(e) =>
                  handleFileUpload(
                    e.target.files[0],
                    "Confidential Information Memorandum",
                    "cim_file"
                  )
                }
              />
            </label>
          </div>
        )}

        {/* =======================
            SUPPORTING DOCUMENTS
        ======================= */}
        <div className="supporting__docs_wrap mt-4">
          <h3>Supporting Documents</h3>

          <div className="document__financials_files">
            {[
            "Profit & Loss Statement",
            "Balance Sheet",
            "Three Year Tax Return",
            "Ownership or Cap Table",
          ].map((label) =>
            !isDocumentUploaded(label) ? (
              <div key={label} className="listing__upload_files_uplosdFile">
                <label>{label}</label>
                <FileUpload
                  mode="basic"
                  auto
                  accept=".pdf"
                  maxFileSize={10000000}
                  customUpload
                  chooseLabel="File Upload"
                  uploadHandler={(e) =>
                    handleFileUpload(
                      e.files[0],
                      label,
                      "cim_supporting_file"
                    )
                  }
                />
              </div>
            ) : null
          )}
          </div>

        </div>

        {/* =======================
            FILES TABLE
        ======================= */}
        {(cimFiles.length > 0 || supportingFiles.length > 0) && (
          <div className="cim__data_table_wrap mt-4">
            <DataTable
              value={[...cimFiles, ...supportingFiles]}
              stripedRows
              tableStyle={{ minWidth: "45rem" }}
            >
              <Column field="displayName" header="File Name" />
              <Column field="typeName" header="Document Type" />
              <Column
                field="createdAt"
                header="Uploaded On"
                body={(row) =>
                  new Date(row.createdAt).toLocaleString()
                }
              />
              <Column
                header="Action"
                body={(row) => (
                  <div className="action__btn_file">
                    <a
                      href={`${API_BASE}${row.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-button p-button-sm"
                    >
                      View
                    </a>
                    <button
                      onClick={() => handleDelete(row._id)}
                      className="p-button p-button-sm p-button-danger"
                    >
                      Delete
                    </button>
                  </div>
                )}
              />
            </DataTable>
          </div>
        )}
      </div>
    </>
  );
};

export default CreateCIM;
