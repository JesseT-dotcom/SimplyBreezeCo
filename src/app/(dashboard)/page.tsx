export default function DashboardPage() {
  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '28px' }}>
        Welcome to SimplyBreeze
      </h1>
      <p style={{ color: '#888', marginTop: '8px' }}>
        Your content dashboard is ready.
      </p>
      <a
        href="/generate"
        style={{
          display: 'inline-block',
          marginTop: '24px',
          padding: '12px 24px',
          background: '#B5C9B7',
          color: '#1a2e1b',
          borderRadius: '8px',
          fontWeight: '500',
          textDecoration: 'none'
        }}
      >
        Generate ideas →
      </a>
    </div>
  )
}
