"use client";
import { useTheme } from "@/context/ThemeContext";
import React from "react";


const ThemeButton = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <div>
      <div className="p-1 px-2 cursor-pointer rounded-full border border-gray-300" onClick={toggleTheme}>{theme === "light" ? "🌙" : "☀️"}</div>
      {/* <button
        
        className="ml-auto p-1 px-2 rounded border border-gray-300 dark:border-gray-600"
      >
        
      </button> */}
    </div>
  );
};

export default ThemeButton;
