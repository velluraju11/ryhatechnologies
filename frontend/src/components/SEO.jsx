import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, keywords, image, url, type = 'website', schemas = [] }) => {
    const siteTitle = "Ryha Technologies";
    const defaultDescription = "AI-driven cybersecurity and intelligent system protection. Securing the future with advanced threat detection.";
    const siteUrl = "https://ryha.in";

    // Prevent duplicate branding if the title already contains the site name
    const metaTitle = title
        ? (title.includes(siteTitle) ? title : `${title} | ${siteTitle}`)
        : siteTitle;

    const metaDescription = description || defaultDescription;
    const metaUrl = url ? `${siteUrl}${url}` : siteUrl;
    const metaImage = image ? `${siteUrl}${image}` : `${siteUrl}/og-image.jpg`;

    return (
        <Helmet>
            {/* Standard Metadata */}
            <title>{metaTitle}</title>
            <meta name="description" content={metaDescription} />
            {keywords && <meta name="keywords" content={keywords} />}
            <link rel="canonical" href={metaUrl} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={metaUrl} />
            <meta property="og:title" content={metaTitle} />
            <meta property="og:description" content={metaDescription} />
            <meta property="og:image" content={metaImage} />

            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={metaUrl} />
            <meta property="twitter:title" content={metaTitle} />
            <meta property="twitter:description" content={metaDescription} />
            <meta property="twitter:image" content={metaImage} />

            {/* Additional specific tags for high quality indexing */}
            <meta name="robots" content="index, follow" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />

            {/* JSON-LD Structured Data */}
            <script type="application/ld+json">
                {JSON.stringify([
                    {
                        "@context": "https://schema.org",
                        "@type": "Organization",
                        "name": "Ryha Technologies",
                        "url": siteUrl,
                        "logo": `${siteUrl}/logo.png`,
                        "description": defaultDescription,
                        "contactPoint": {
                            "@type": "ContactPoint",
                            "telephone": "",
                            "contactType": "customer service",
                            "email": "contact@ryha.in"
                        },
                        "sameAs": [
                            "https://www.linkedin.com/company/ryha-technologies/",
                            "https://www.instagram.com/ryha_technologies/",
                            "https://x.com/Ryha_Tech"
                        ]
                    },
                    {
                        "@context": "https://schema.org",
                        "@type": "WebPage",
                        "name": metaTitle,
                        "url": metaUrl,
                        "description": metaDescription
                    },
                    ...(schemas || [])
                ])}
            </script>
        </Helmet>
    );
};

export default SEO;
