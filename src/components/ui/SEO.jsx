import { Helmet } from 'react-helmet-async'

const SITE_NAME = 'StarVyk'
const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://starvyk.vercel.app'
const DEFAULT_DESC = 'Explore beautiful data visualizations and insightful articles. Open data, beautifully presented.'

export default function SEO({ title, description, image, url, type = 'website' }) {
  const fullTitle = title ? `${title} — ${SITE_NAME}` : SITE_NAME
  const desc = description || DEFAULT_DESC
  const canonical = url ? `${SITE_URL}${url}` : SITE_URL
  const ogImage = image || `${SITE_URL}/og-image.png`

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={canonical} />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={canonical} />
      <meta property="og:site_name" content={SITE_NAME} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  )
}
