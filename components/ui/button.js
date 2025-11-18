"use client";

import React from "react";

export function Button({ children, className = "", ...rest }) {
  return (
    <button
      {...rest}
      className={`bg-blue-600 text-white px-3 py-1 rounded ${className}`}
    >
      {children}
    </button>
  );
}
