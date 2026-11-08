import Script from "next/script";

// Yalnızca bu biçimdeki kimlik kabul edilir; serbest kod asla basılmaz
const GA_ID = /^G-[A-Z0-9]{4,15}$/;

/** Google Analytics 4 (admin → SEO Yönetimi → Google Analytics) */
export function Analytics({ measurementId }: { measurementId: string | null | undefined }) {
  if (!measurementId || !GA_ID.test(measurementId)) return null;
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} strategy="afterInteractive" />
      <Script id="ga-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${measurementId}',{anonymize_ip:true});`}
      </Script>
    </>
  );
}
