"use client";

import React from "react";
import Sidebar from "./Sidebar";

const SuperadminDashboard: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
    </div>
  );
};

export default SuperadminDashboard;
