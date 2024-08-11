import { Link } from "react-router-dom";
import AnimationWrapper from "../common/page-animation";
import { useContext } from "react";
import { UserContext } from "../App";
import { removeFromSession } from "../common/session";

const UserNavigationPannel = () => {
  const {
    userAuth: { username },
    setUserAuth,
  } = useContext(UserContext);

  const signOutUser = () => {
    console.log('signout button clicked');
    removeFromSession("user");
    setUserAuth({ access_token: null });
  };
  return (
    <AnimationWrapper
      transition={{ duration: 0.2 }}
      className="absolute right-0 z-50"
    >
      <div className="bg-white absolute right-0 border border-grey w-60 overflow-hidden duration-200">
        <Link to="/editor" className="flex gap-2 link md:hidden pl-8 py-4">
          <i className="fi fi-rr-file-edit text-black"></i>
          <p className="text-black">Write</p>
        </Link>

        <Link to={`/user/${username}`} className="link pl-8 py-4 text-black">
          Profile
        </Link>

        <Link to={`/user/blogs`} className="link pl-8 py-4 text-black">
          Dashboard
        </Link>

        <Link to={`/user/edit-profile`} className="link pl-8 py-4 text-black">
          Settings
        </Link>

        {/* <span className="absolute border-t border-grey w-[100%]"></span> */}

        <button
          className="text-left p-4 hover:bg-grey w-full pl-8 py-4"
          onClick={signOutUser}
        >
          <h1 className="font-medium text-xl mb-1">Sign out</h1>
          <p className="text-dark-grey">@{username}</p>
        </button>
      </div>
    </AnimationWrapper>
  );
};

export default UserNavigationPannel;
