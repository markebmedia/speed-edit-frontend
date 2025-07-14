// app/layout.tsx

export const metadata = {
  title: 'Speed Edit',
  description: 'AI-powered bulk property photo enhancement',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
