/** @type {import('next').NextConfig} */
const path = require("path");
module.exports = {
  sassOptions: {
    includePaths: [path.join(__dirname, "components/video")],
  },
  reactStrictMode: true,
  images: {
    loader: "imgix",
    path: "https://media.honeycombpizza.link",
    domains: [
      "media.honeycombpizza.link",
      "https://media.honeycombpizza.link",
      "https://farrar142-mediaserverbucket.s3.ap-northeast-2.amazonaws.com",
    ],
  },
  // https://farrar142-mediaserverbucket.s3.ap-northeast-2.amazonaws.com
  async redirects() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_BASE_PATH}/api/:path*`,
        permanent: false,
      },
      {
        source: "/auth/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_BASE_PATH}/auth/:path*`,
        permanent: false,
      },
      {
        source: "/mediaserver/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_MEDIASERVER}/mediaserver/:path*`,
        permanent: false,
      },
      {
        source: "/media/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_MEDIA}/:path*`,
        permanent: false,
      },
      {
        source: "/download/:path*",
        destination: "https://media.honeycombpizza.link/download/:path*",
        permanent: false,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/cliserver/:path*",
        destination: "https://blog.honeycombpizza.link/cliserver/:path*",
      },
    ];
  },
};
