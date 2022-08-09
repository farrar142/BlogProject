import {
  alpha,
  AppBar,
  Badge,
  Box,
  Container,
  IconButton,
  InputBase,
  Menu,
  MenuItem,
  styled,
  Toolbar,
  Typography,
} from "@mui/material";
import AccountCircle from "@mui/icons-material/AccountCircle";
import HomeIcon from "@mui/icons-material/Home";
import MoreIcon from "@mui/icons-material/MoreVert";
import SearchIcon from "@mui/icons-material/Search";
import Link from "next/link";
import React, { ReactNode, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { BlogInfoType } from "../../types/blog/blogTags";
import { getCookie } from "../../src/functions/cookies";
import { UserInfo } from "../../types/accounts";

const StyledMenuItem = styled(MenuItem)`
  cursor: default;
`;

type TitleNav = {
  name: string;
  path: string;
};
const defaultNav: TitleNav = { name: "Blog", path: "/" };
type BlogLayoutProps = {
  auth: UserInfo;
  children?: ReactNode;
};
const Layout = ({ auth, children }: BlogLayoutProps) => {
  const router = useRouter();
  const [title, setTitle] = useState<TitleNav>(defaultNav);
  const [height, setHeight] = useState<number>(0);
  const searchRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const af = async (id: string) => {
      const res = await axios.get(`/api/blog/${id}`);
      const data: BlogInfoType = res.data[0];
      setTitle({ name: data.name, path: `/blog/${data.id}` });
    };
    if (router.query.id) {
      af(router.query.id as string);
    } else {
      setTitle(defaultNav);
    }
  }, [router.query.id]);
  useEffect(() => {
    const el = window.document.getElementById("NavBar");
    const elHeight = el?.clientHeight;
    if (elHeight) {
      setHeight(elHeight);
    }
  }, []);
  useEffect(() => {
    if (searchRef.current) {
      searchRef.current.value = "";
    }
  }, [searchRef.current]);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] =
    useState<null | HTMLElement>(null);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMoreAnchorEl(event.currentTarget);
  };

  const menuId = "primary-search-account-menu";

  const mobileMenuId = "primary-search-account-menu-mobile";
  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "center",
      }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      open={isMobileMenuOpen}
      onClose={handleMobileMenuClose}
    >
      {auth.user_id == 0 ? (
        <MenuItem
          onClick={() => {
            handleMobileMenuClose();
            router.push("/accounts/signin");
          }}
        >
          <Typography>로그인</Typography>
        </MenuItem>
      ) : (
        <StyledMenuItem
          onClick={() => {
            handleMobileMenuClose();
            // router.push('/accounts/signout');
          }}
        >
          <Link href="/accounts/signout">
            <Typography>로그아웃</Typography>
          </Link>
        </StyledMenuItem>
      )}
    </Menu>
  );
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="fixed">
        <Toolbar id="NavBar">
          <Link href="/">
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="open drawer"
              sx={{ mr: 2 }}
            >
              <HomeIcon />
            </IconButton>
          </Link>
          <Link href={title.path}>
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{ display: { cursor: "pointer" } }}
            >
              {title.name}
            </Typography>
          </Link>
          <Search
            sx={{ display: { width: "150px" } }}
            onSubmit={(e) => {
              e.preventDefault();
              if (searchRef.current) {
                router.push({
                  pathname: router.pathname,
                  query: {
                    id: router.query.id,
                    tag: searchRef.current.value,
                  },
                });
              }
            }}
          >
            <IconButton sx={{ cursor: "pointer" }} type="submit">
              <SearchIcon />
            </IconButton>
            <StyledInputBase
              placeholder="Search…"
              inputProps={{ "aria-label": "search" }}
              ref={searchRef}
              defaultValue=""
              onChange={(e) => {
                if (searchRef.current) {
                  searchRef.current.value = e.target.value;
                }
              }}
            />
          </Search>
          <Box sx={{ flexGrow: 1 }} />
          <Typography>{auth.username}</Typography>
          <Box sx={{ display: { xs: "flex" } }}>
            <IconButton
              size="large"
              aria-label="show more"
              aria-controls={mobileMenuId}
              aria-haspopup="true"
              onClick={handleMobileMenuOpen}
              color="inherit"
            >
              <MoreIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      <AppBar sx={styles.fakeAppBar(height)} position="relative" />
      {renderMobileMenu}
    </Box>
  );
};

export default Layout;
const Search = styled("form")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  "&:hover": {
    backgroundColor: alpha(theme.palette.secondary.main, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(3),
    width: "auto",
  },
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 1),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(${theme.spacing(0)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      width: "20ch",
    },
  },
}));

const styles = {
  fakeAppBar: (height: number) => ({ mb: 2, height: height }),
};
