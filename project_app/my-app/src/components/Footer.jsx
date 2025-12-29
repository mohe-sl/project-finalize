import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-blue-900 via-gray-900 to-blue-950 text-white py-4 mt-6">
      <div className="container mx-auto text-center text-sm">
        &copy; {new Date().getFullYear()} Project Monitoring System. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
