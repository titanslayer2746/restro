import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query"
import { login } from "../../https/index"
import { enqueueSnackbar } from "notistack"
import { Spinner } from "../shared/ui";
import { useDispatch } from "react-redux"
import { setUser } from "../../redux/slices/userSlice";
import { useNavigate } from "react-router-dom"


const Login = () => {

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    loginMutation.mutate(formData);
  };

  const loginMutation = useMutation({
    mutationFn: (reqData) => login(reqData),
    onSuccess: (res) => {
      const { data } = res;
      console.log(data);
      const { _id, name, email, phone, role } = data.data;
      dispatch(setUser({ _id, name, email, phone, role }));
      navigate("/home");
    },
    onError: (error) => {
      const { response } = error;
      enqueueSnackbar(response?.data?.message || "Couldn't reach the server", {variant: "error"})
    }
  })

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          <label className="field-label">Employee Email</label>
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
        <button
          type="submit"
          disabled={loginMutation.isPending}
          aria-busy={loginMutation.isPending}
          className="btn-primary mt-6 w-full"
        >
          {loginMutation.isPending ? <><Spinner /> Signing in…</> : "Sign In"}
        </button>
      </form>
    </div>
  );
};

export default Login;
