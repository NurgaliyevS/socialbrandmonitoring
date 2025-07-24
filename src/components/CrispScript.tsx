import Script from 'next/script';

export default function CrispScript() {
  return (
    <Script
      id="crisp-chat"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          window.$crisp=[];
          window.CRISP_WEBSITE_ID="2e449c39-9bcb-4cd5-bb7c-a6315cd85dc4";
          (function(){
            d=document;
            s=d.createElement("script");
            s.src="https://client.crisp.chat/l.js";
            s.async=1;
            d.getElementsByTagName("head")[0].appendChild(s);
          })();
        `,
      }}
    />
  );
} 