import { Pagination } from "@mui/material";
import React from "react";
type MyPaginationProps = {
  page: number;
  onPageChange: (e: React.ChangeEvent<unknown>, nv: number) => void;
  articleLength: number;
};
const MyPagination = ({
  page,
  onPageChange,
  articleLength,
}: MyPaginationProps) => {
  const pageCounter = (number: number) => {
    if (number > 0 && number % 10 == 0) {
      return parseInt((number / 10).toString());
    } else {
      return parseInt((number / 10 + 1).toString());
    }
  };
  return (
    <Pagination
      page={page}
      sx={styles.pagination}
      count={articleLength}
      onChange={onPageChange}
      color="secondary"
      variant="outlined"
      showFirstButton
      showLastButton
    />
  );
};

export default MyPagination;

const styles = {
  pagination: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    position: "fixed",
    bottom: "60px",
    margin: "0 auto",
    left: 0,
    right: 0,
  },
};
