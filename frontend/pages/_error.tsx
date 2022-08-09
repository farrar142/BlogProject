import React from "react";
import { NextPage } from "next";
import { Link } from "@mui/material";

interface ErrorProps {
  statusCode: number;
}

const Error: NextPage<ErrorProps> = ({ statusCode }) => {
  return (
    <div
      style={{
        marginTop: 100,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <h1>{statusCode}</h1>
      <h2>
        <Link href="/">Go To Home Page</Link>
      </h2>
      <p>Sorry, the content you are looking for could not be found.</p>
    </div>
  );
};

Error.getInitialProps = ({ res }) => {
  const statusCode = res?.statusCode || 500;

  return { statusCode };
};

export default Error;
