"use client";

import React from "react";

export function Input(props) {
  const { className = "", ...rest } = props;
  return (
    <input
      {...rest}
      className={`border rounded px-2 py-1 bg-white text-sm ${className}`}
    />
  );
}
