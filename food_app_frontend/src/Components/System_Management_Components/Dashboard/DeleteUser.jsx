import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useAuth } from "../../../AuthContext"; // Ensure this correctly provides authToken

// Create an axios instance for backend API calls
const backendApi = axios.create({
  baseURL: "http://127.0.0.1:8000",
  withCredentials: true, // Ensures cookies are sent with requests
});

const DeleteUser = ({ user_id, onDelete }) => {
  const { authToken } = useAuth(); // Get auth token from context
  const [loading, setLoading] = useState(false);
  const [csrfToken, setCsrfToken] = useState("");

  // Fetch CSRF Token on Component Mount
  useEffect(() => {
    backendApi
      .get("/system_management/csrf/", { withCredentials: true })
      .then((response) => {
        if (response.data && response.data.csrfToken) {
          setCsrfToken(response.data.csrfToken);
        }
      })
      .catch((error) => {
        console.error("CSRF Token Fetch Error:", error);
      });
  }, []);

  const handleDelete = async () => {
    console.log("Auth Token being sent:", authToken); 
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        setLoading(true);

        try {
          const response = await backendApi.post(
            `/system_management/delete_user/${user_id}/`,
            {},
            {
              headers: {
                "X-CSRFToken": csrfToken,
                Authorization: `Token ${authToken}`, // ✅ Include the auth token
                "Content-Type": "application/json",
              },
              withCredentials: true,
            }
          );
          console.log("Response from API:", response.data); // Debug response


          if (response.data.status === "success") {
            Swal.fire("Deleted!", "User has been deleted.", "success");
            onDelete(user_id);
          } else {
            Swal.fire("Error!", response.data.message, "error");
          }
        } catch (error) {
          console.error("Delete error:", error.response?.data || error.message);
          Swal.fire("Error!", "Failed to delete user. Try again!", "error");
        } finally {
          setLoading(false);
        }
      }
    });
  };

  return (
    <button className="btn btn-primary btn-sm mt-2" onClick={handleDelete} disabled={loading}>
      {loading ? (
        <span>
          <i className="fa fa-spinner fa-spin"></i> Deleting...
        </span>
      ) : (
        "Delete"
      )}
    </button>
  );
};

export default DeleteUser;
