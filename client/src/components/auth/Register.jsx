import React, { useState } from "react";
import { register } from "../../https";
import { useMutation } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { Spinner } from "../shared/ui";


const Register = ({setIsRegister}) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    registerMutation.mutate(formData);
  };

  const registerMutation = useMutation({
    mutationFn: (reqData) => register(reqData),
    onSuccess: (res) => {
      const { data } = res;
      enqueueSnackbar(data.message, { variant: "success" });
      setFormData({
        name: "",
        email: "",
        phone: "",
        password: "",
      });

      setTimeout(() => {
        setIsRegister(false);
      }, 1500);
    },
    onError: (error) => {
      const { response } = error;
      const message = response?.data?.message || "Couldn't reach the server";
      enqueueSnackbar(message, { variant: "error" });
    },
  });

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          <label className="field-label">Employee Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter employee name"
            className="field"
            required
          />
        </div>
        <div>
          <label className="field-label mt-4">Employee Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@restaurant.com"
            className="field"
            required
          />
        </div>
        <div>
          <label className="field-label mt-4">Employee Phone</label>
          <input
            type="number"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Enter employee phone"
            className="field"
            required
          />
        </div>
        <div>
          <label className="field-label mt-4">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter password"
            className="field"
            required
          />
        </div>
        <p className="mt-4 rounded-lg border border-dashed border-ink/25 px-3.5 py-2.5 font-mono text-[11px] leading-relaxed text-muted">
          new accounts start as <span className="text-ink">waiter</span>. an admin can change your role from the dashboard.
        </p>

        <button
          type="submit"
          disabled={registerMutation.isPending}
          aria-busy={registerMutation.isPending}
          className="btn-primary mt-6 w-full"
        >
          {registerMutation.isPending ? <><Spinner /> Creating account…</> : "Sign up"}
        </button>
      </form>
    </div>
  );
};

export default Register;
