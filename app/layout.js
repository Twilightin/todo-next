// import "./globals.css"

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column', margin: 0, fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial' }}>
        <header style={{ padding: '1rem', background: '#f7f7f8', borderBottom: '1px solid #e6e6e6' }}>
          <div style={{ maxWidth: 960, margin: '0 auto' }}>
            <h1 style={{ margin: 0, fontSize: '1.25rem' }}>My App</h1>
          </div>
        </header>

        <main style={{ flex: 1, maxWidth: 960, margin: '1rem auto', width: '100%', padding: '0 1rem' }}>
          {children}
        </main>

        <footer style={{ padding: '1rem', background: '#f7f7f8', borderTop: '1px solid #e6e6e6' }}>
          <div style={{ maxWidth: 960, margin: '0 auto', textAlign: 'center', fontSize: '0.9rem' }}>
            © {new Date().getFullYear()} My App
          </div>
        </footer>
      </body>
    </html>
  )
}
