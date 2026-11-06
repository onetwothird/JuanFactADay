/* First-visit splash: Juan peeks in while the page finishes loading.
   - Shown once per browser session, only on a full page load (client-side navigation never shows it).
   - Hidden by toggling <html data-preload>, so React never sees this markup change (no hydration mismatch).
   - Fails safe: hard cap of 2.5s, and <noscript> hides it outright. */
import Juan from "./Juan";

// Runs in <head> before paint: skip the splash entirely if it was already seen this session.
export const preloadHeadScript = `try{if(sessionStorage.getItem('jfad-preload'))document.documentElement.dataset.preload='skip';else sessionStorage.setItem('jfad-preload','1')}catch(e){}`;

// Runs right after the splash markup: dismiss on window load (min 600ms so it doesn't flicker, max 2.5s).
const dismissScript = `(function(){var d=document.documentElement;if(d.dataset.preload==='skip')return;var t0=Date.now(),gone=false;function hide(){if(gone)return;gone=true;setTimeout(function(){d.dataset.preload='done'},Math.max(0,600-(Date.now()-t0)))}if(document.readyState==='complete')hide();else{addEventListener('load',hide,{once:true});setTimeout(hide,2500)}})()`;

export default function Preloader({ tag = "Alam mo ba?" }: { tag?: string }) {
  return (
    <>
      <div className="preloader" aria-hidden="true">
        <div className="preloader-inner">
          <Juan pose="peek" size={150} title="" className="preloader-juan" />
          <div className="preloader-logo">
            Juan Fact <span className="y">a Day</span>
          </div>
          <div className="preloader-bar">
            <i />
          </div>
          <div className="preloader-tag">{tag}</div>
        </div>
      </div>
      <noscript>
        <style>{`.preloader{display:none!important}`}</style>
      </noscript>
      <script dangerouslySetInnerHTML={{ __html: dismissScript }} />
    </>
  );
}
