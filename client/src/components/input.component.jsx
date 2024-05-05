import React, { useState } from "react";

const InputBox = ({ id, type, name, value, placeholder, icon  }) => {
  const [passwordVisible, setPasswordVisible] = useState(false);


  return (
    <div className="relative w-[100%] mb-4">
      <input
        id={id}
        name={name}
        type={type === "password" ? (passwordVisible ? "text" : type) : type}
        defaultValue={value}
        placeholder={placeholder}
        className="input-box"
      />
      <i className={`fi ${icon} input-icon`}></i>

      {type === "password" && (
        <i
          className={`fi fi-rr-eye${
            passwordVisible ? "-crossed":""
          } input-icon left-auto right-4 cursor-pointer`}
          onClick={() => setPasswordVisible((currValue) => !currValue)}
        ></i>
      )}
    </div>
  );
};

export default InputBox;
