import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy", alternates: { canonical: "/privacy" } };

export default function Privacy() {
  return (
    <div className="wrap prose" style={{ paddingTop: 32 }}>
      <span className="route">Privacy</span>
      <h1 style={{ marginTop: ".4em" }}>Privacy policy</h1>
      <p className="muted">Maikli lang, kasi kaunti lang ang kinokolekta namin.</p>
      <h2>Analytics</h2>
      <p>
        Gumagamit kami ng Vercel Web Analytics para malaman kung ilan ang bumibisita at aling facts ang binabasa. Walang cookies, at walang personal na impormasyon na kinokolekta.
      </p>
      <h2>Suggest form</h2>
      <p>
        Kapag nag-suggest ka, natatanggap namin ang topic at ang anumang optional na detalye na inilagay mo (pangalan, email). Ginagamit lang ito para sumagot o i-credit ka. Hindi namin ito ibinebenta o ibinibigay kaninuman. Dumaan ito sa Formspree.
      </p>
      <h2>Sa browser mo</h2>
      <p>Ang best score mo sa quiz at ang napili mong light/dark mode ay naka-save lang sa browser mo (localStorage), hindi sa server namin.</p>
      <h2>Mga link</h2>
      <p>May mga link kami papunta sa Facebook at iba pang site. Sila na ang bahala sa sarili nilang privacy policy.</p>
      <h2>Copyright</h2>
      <p>
        Ang code ng site ay MIT. Ang pangalang Juan Fact a Day, si Juan (mascot), ang artwork at ang mga script ay sa amin, lahat ng karapatan ay nakalaan.
      </p>
    </div>
  );
}
