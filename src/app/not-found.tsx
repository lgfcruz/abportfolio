/**
 * 404 global, fora de qualquer locale. Devolve status 404, nao 200.
 * Serve tambem de rede de seguranca: se o proxy de negociacao de idioma falhar,
 * esta pagina da sempre um caminho visivel para /pt e /en.
 * Por isso usa <a> e estilos inline de proposito — nao depende de nada.
 */
/* eslint-disable @next/next/no-html-link-for-pages */
export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body
        style={{
          background: '#0A0A0B',
          color: '#F5F7FA',
          fontFamily: 'system-ui, sans-serif',
          display: 'grid',
          placeItems: 'center',
          minHeight: '100dvh',
          margin: 0,
        }}
      >
        <main style={{ textAlign: 'center', padding: '2rem' }}>
          <h1 style={{ fontSize: '2rem', margin: 0 }}>Page not found</h1>
          <p style={{ color: '#A6ACB8' }}>That page does not exist, or has moved.</p>
          <p style={{ marginTop: '2rem' }}>
            <a href="/en" style={{ color: '#FF6A3D' }}>
              English
            </a>
            {'  ·  '}
            <a href="/pt" style={{ color: '#FF6A3D' }}>
              Português
            </a>
          </p>
        </main>
      </body>
    </html>
  );
}
