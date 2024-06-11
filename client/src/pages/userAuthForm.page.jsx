import React, { useContext, useEffect, useRef } from "react";
import InputBox from "../components/input.component";
import googleIcon from "../images/google.png";
import { Link, Navigate } from "react-router-dom";
import AnimationWrapper from "../common/page-animation";
import { Toaster, toast } from "react-hot-toast";
import axios from "axios";
import { storeInSession } from "../common/session";
import { UserContext } from "../App";
import { authWithGoogle } from "../common/firebase";

const UserAuthForm = ({ type }) => {
  let {
    userAuth,
    userAuth: { access_token },
    setUserAuth,
  } = useContext(UserContext);

  console.log(access_token);

  const userAuthThroughServer = (serverRoute, formData) => {
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + serverRoute, formData)
      .then(({ data }) => {
        storeInSession("user", JSON.stringify(data));
        // console.log(sessionStorage);
        setUserAuth(data);
      })
      .catch(({ response }) => {
        toast.error(response.data.error);
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let form = new FormData(formAuth);
    let serverRoute = type === "sign-up" ? "/signup" : "/signin";
    let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
    let passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/; // regex for password

    let formData = {};

    for (let [key, value] of form.entries()) {
      formData[key] = value;
    }
    const { fullname, email, password } = formData;

    //auth

    if (fullname) {
      if (fullname.length < 3 && fullname.length > 0) {
        return toast.error("Fullname must be more than 3 character");
      }
      if (!fullname.length) {
        return toast.error("Enter your full name");
      }
    }
    if (!email.length) {
      return toast.error("Enter Email");
    }
    if (!emailRegex.test(email)) {
      return toast.error("Email is invalid");
    }
    if (!passwordRegex.test(password)) {
      return toast.error("Password is not valid");
    }

    userAuthThroughServer(serverRoute, formData);
  };

  const handleGoogleAuth = async (e) => {
    e.preventDefault();

    try {
      let user = await authWithGoogle();
      console.log(user);
    } catch (error) {
      toast.error("Trouble logging with google");
      return console.log(error);
    }

    // authWithGoogle()
    //   .then((user) => console.log(user))
    //   .catch((err) => {
    //     toast.error("Trouble logging with google");
    //     console.log(err);
    //   });
  };

  return access_token ? (
    <Navigate to="/" />
  ) : (
    <AnimationWrapper keyValue={type}>
      <section className="h-cover flex items-center justify-center">
        <Toaster />
        <form id="formAuth" className="w-[80%] max-w-[400px]">
          <h1 className="text-4xl tracking-[3px] capitalize text-center mb-10 font-medium">
            {type === "sign-in" ? "Welcome Back" : "Join Us Today"}
          </h1>
          {type !== "sign-in" && (
            <InputBox
              name="fullname"
              type="text"
              placeholder="Full Name"
              icon="fi-rr-user"
            />
          )}
          <InputBox
            name="email"
            type="text"
            placeholder="Email"
            icon="fi-rr-at"
          />
          <InputBox
            name="password"
            type="password"
            placeholder="Password"
            icon="fi-rr-lock"
          />

          <button
            className="btn-dark w-[90%] tracking-[2px] center text- mt-10"
            type="submit"
            onClick={handleSubmit}
          >
            {type.replace("-", " ")}
          </button>

          <div className="relative w-full flex items-center gap-2 my-10 opacity-30 uppercase text-black font-bold">
            <hr className="w-1/2 " />
            <p>or</p>
            <hr className="w-1/2" />
          </div>

          <button
            className="btn-dark flex items-center justify-center gap-4 w-[90%] center"
            onClick={handleGoogleAuth}
          >
            <img src={googleIcon} className="w-5" />
            Continue with Google
          </button>

          {type === "sign-in" ? (
            <p className="mt-6 text-dark-grey text-xl text-center">
              Don't have an account?
              <Link to="/signup" className="underline text-black text-xl ml-1">
                Join us today
              </Link>
            </p>
          ) : (
            <p className="mt-6 text-dark-grey text-xl text-center">
              Already a member?
              <Link to="/signin" className="underline text-black text-xl ml-1">
                Sign in here
              </Link>
            </p>
          )}
        </form>
      </section>
    </AnimationWrapper>
  );
};

export default UserAuthForm;
