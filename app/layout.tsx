import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

// !!! 核心修改：定义 metadata !!!
export const metadata: Metadata = {
  // 1. 基础信息
  title: "ZenFlow | 极简心流电台",
  description: "沉浸式白噪音与背景音乐电台。提供 Lo-Fi、阿尔法波、环境音，助你专注、放松与助眠。",

  // 2. 你的域名基准 (必须改！否则图片找不到)
  // 请替换成你 Vercel 的真实域名，不要带最后的斜杠
  metadataBase: new URL("https://www.zenflows.cloud"),

  // 3. 图标 (Favicon)
  icons: {
    icon: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🎧</text></svg>",
  },

  // 4. Open Graph (适用于 微信, iMessage, Discord, Facebook 等)
  openGraph: {
    title: "ZenFlow | 极简心流电台",
    description: "让大脑回归平静。专注、放松、睡眠，即开即用的听觉空间。",
    url: "/", // 首页
    siteName: "ZenFlow",
    locale: "zh_CN",
    type: "website",
    images: [
      {
        url: "/og-image.png", // 这里对应你 public 目录下的文件名
        width: 2828,
        height: 1647,
        alt: "ZenFlow Preview",
      },
    ],
  },

  // 5. Twitter Card (适用于 Twitter/X)
  twitter: {
    card: "summary_large_image",
    title: "ZenFlow | 极简心流电台",
    description: "专注、放松、睡眠。你的极简背景音伴侣。",
    images: ["/og-image.png"], // 同样对应 public 目录下的文件
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}