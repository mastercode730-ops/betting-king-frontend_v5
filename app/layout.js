import './globals.css';

export const metadata = {
  title: 'Satta King Max — Live Superfast Results 2026 | Gali Desawar Chart',
  description: 'Superfast Live Satta King Max Result 2026. Realtime Gali, Desawar, Ghaziabad, Faridabad draws with full monthly chart archive.',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/favicon.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  verification: {
    google: 'UWGoCOQevDKHS0Ewjkq89qUJmomGJafn1Svs7VDk16g',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
