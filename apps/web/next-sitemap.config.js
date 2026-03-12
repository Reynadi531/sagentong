module.exports = {
  siteUrl: "https://sagentong.com",
  generateRobotsTxt: true,
  exclude: ["/404", "/500", "/_app", "/_document", "/_error"],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        disallow: ["/404", "/500", "/_app", "/_document", "/_error", "/cgi-bin", "/cgi-bin/"],
        allow: "/",
      },
    ],
  },
};
