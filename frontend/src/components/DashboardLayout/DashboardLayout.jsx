import React, { useState } from "react";


import Navbar from "./Navbar";

const DashboardLayout = ({ children }) => {


  return (

    
    <div className="flex flex-col h-screen" style={{background:'linear-gradient(to righ,#c2ecf3, #e5e7f8)'}}>
      <Navbar />
      <div className="flex-1 p-8 min-h-[90%]">{children}</div>
    </div>
  );
};

export default DashboardLayout;
