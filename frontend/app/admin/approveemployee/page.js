"use client";

import { useState, useEffect } from "react";
import axiosClient from "../../utils/apis"; 
import AdminSidebar from "../../components/AdminSidebarTemp";

export default function ApproveEmployeePage() {
  const [email, setEmail] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [errors, setErrors] = useState({}); // separate errors for email/id
  const [employees, setEmployees] = useState([]);
  const [message, setMessage] = useState("");
  const fetchEmployees = async () => {
    try {
      const res = await axiosClient.get("/approved-employees/");
      setEmployees(res.data);
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => {
  const loadData = async () => {
    await fetchEmployees(); // fetch + setState inside function
  };

  loadData();
}, []);
  // Fetch existing employees
  const validateForm = () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  let errors = {};

  if (!email) {
    errors.email = "Email is required";
  } else if (!emailRegex.test(email)) {
    errors.email = "Please enter a valid email address";
  }

  if (!employeeId) {
    errors.employeeId = "Employee ID is required";
  }

  return errors;
};
const submitEmployee = async () => {
  await axiosClient.post("/approved-employees/", {
    email,
    employee_id: employeeId,
  });

  setMessage("Employee approved successfully");
  setEmail("");
  setEmployeeId("");
  fetchEmployees();
};
const handleSubmitError = (err) => {
  if (err.response?.data) {
    const data = err.response.data;

    setErrors({
      email: data.email ? data.email[0] : "",
      employeeId: data.employee_id ? data.employee_id[0] : "",
      nonField: data.non_field_errors ? data.non_field_errors[0] : "",
    });
  } else {
    setMessage("Something went wrong");
  }
};

  const handleSubmit = async () => {
  setErrors({});
  setMessage("");

  const validationErrors = validateForm();

  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors);
    return;
  }

  try {
    await submitEmployee();
  } catch (err) {
    handleSubmitError(err);
  }
};

  return (
    <div className="flex bg-[#020617] min-h-screen text-white">
      <AdminSidebar />
      
      <div className="flex-1 ml-56 p-6">
        <h1 className="text-2xl font-bold mb-6">Approve Employees</h1>
        
        <div className="bg-gray-900 p-5 rounded-xl shadow-md mb-8">
          <div className="flex flex-col lg:flex-row lg:items-end gap-4">
           
            <div className="flex flex-col flex-1">
              <label htmlFor="employee_email" className="mb-1 text-gray-400">Employee Email</label>
              <input
                type="email"
                id="employee_email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <p className="text-red-400 text-sm mt-1 min-h-[1.25rem]">
                {errors.email || "\u00A0"}
              </p>
            </div>

           
            <div className="flex flex-col flex-1">
              <label htmlFor="employee_id" className="mb-1 text-gray-400">Employee ID</label>
              <input
                type="text"
                id="employee_id"
                placeholder="Enter employee ID"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="w-full p-2 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <p className="text-red-400 text-sm mt-1 min-h-[1.25rem]">
                {errors.employeeId || "\u00A0"}
              </p>
            </div>

            
            <div className="flex items-end ">
              <button
                onClick={handleSubmit}
                className="mb-7 bg-green-600 hover:bg-green-700 px-6 py-2 rounded-md font-medium transition"
              >
                Approve Employee
              </button>
            </div>
          </div>

          {message && (
            <p className="mt-3 text-sm text-yellow-400">{message}</p>
          )}
        </div>

        
        <div className="bg-gray-900 p-5 rounded-xl shadow-md">
          <h2 className="text-lg font-semibold mb-4">
            Approved Employees ({employees.length})
          </h2>

          {employees.length === 0 ? (
            <p className="text-gray-400">No approved employees yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-gray-400 border-b border-gray-700">
                  <tr>
                    <th className="py-2 text-left">Email</th>
                    <th className="py-2 text-left">Employee ID</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => (
                    <tr
                      key={emp.employee_id}
                      className="border-b border-gray-800 hover:bg-gray-800 transition"
                    >
                      <td className="py-2">{emp.email || "N/A"}</td>
                      <td className="py-2">{emp.employee_id || "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}