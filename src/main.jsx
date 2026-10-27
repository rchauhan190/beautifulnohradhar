import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowDown, ArrowRight, ArrowUpRight, Compass, Menu, Mountain, X } from 'lucide-react';
import './styles.css';

const galleryPhotos = [
  'img_0596.jpg', 'img_0612.jpg', 'img_0634.jpg', 'img_0783.jpg', 'img_0928.jpg',
  'img_0936.jpg', 'img_0940.jpg', 'nohradhar-portrait.jpg', 'img_1345.jpg',
  'img_1361.jpg', 'img_1363.jpg', 'img_1365.jpg', 'img_1366.jpg'
];

const initialPlaces = [
  { id: 'nohradhar', name: 'Nohradhar', subtitle: 'A village at the edge of the wild', image: '/images/churdhar-temple.jpg', tag: 'THE BASECAMP' },
  { id: 'churdhar', name: 'Churdhar Peak', subtitle: 'A trail to the highest shrine in the Shivaliks', image: '/images/nohradhar-portrait.jpg', tag: 'THE SUMMIT' },
  { id: 'the-journey', name: 'The way up', subtitle: 'Mountain roads, slow journeys, open skies', image: '/images/mountain-bus.jpg', tag: 'THE JOURNEY' }
];

function AdminInbox() {
  const [password, setPassword] = useState('');
  const [inquiries, setInquiries] = useState(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  async function loadInquiries(event) {
    event.preventDefault();
    setLoading(true);
    setStatus('');
    try {
      const bytes = new TextEncoder().encode(`admin:${password}`);
      const encoded = btoa(Array.from(bytes, byte => String.fromCharCode(byte)).join(''));
      const response = await fetch('/api/admin/inquiries', { headers: { Authorization: `Basic ${encoded}` } });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to open the enquiry inbox.');
      setInquiries(result.inquiries);
    } catch (error) {
      setInquiries(null);
      setStatus(error.message || 'Could not reach the enquiry inbox.');
    } finally {
      setLoading(false);
    }
  }

  return <main className="admin-inbox"><header className="admin-header"><a className="brand" href="/"><span className="brand-mark"><Mountain size={20}/></span><span>Nohradhar &amp; Churdhar <i>Beyond the Clouds</i></span></a><a href="/">← Back to website</a></header><section className="admin-content"><span className="eyebrow">PRIVATE ADMIN AREA</span><h1>Enquiry inbox</h1><p className="admin-intro">Sign in to see messages from people planning a visit to Nohradhar.</p><form className="admin-login" onSubmit={loadInquiries}><label>Admin password<input type="password" autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} required/></label><button className="submit-enquiry" type="submit" disabled={loading}>{loading ? 'Loading…' : inquiries ? 'Refresh enquiries' : 'Open inbox'} <ArrowRight size={15}/></button></form>{status && <p className="admin-status" role="alert">{status}</p>}{inquiries && <><div className="inbox-summary"><strong>{inquiries.length}</strong><span>{inquiries.length === 1 ? 'ENQUIRY' : 'ENQUIRIES'} · MOST RECENT FIRST</span></div>{inquiries.length ? <div className="inquiry-list">{inquiries.map((item, index) => <article className="inquiry-record" key={`${item.receivedAt}-${index}`}><div className="inquiry-record-heading"><h2>{item.name}</h2><time>{new Date(item.receivedAt).toLocaleString()}</time></div><a className="inquiry-phone" href={`tel:${item.phone.replace(/[^+\d]/g, '')}`}>{item.phone}</a><p>{item.message}</p></article>)}</div> : <p className="empty-inbox">No enquiries yet. New submissions will appear here.</p>}</>}</section></main>;
}

function App() {
  const [places, setPlaces] = useState(initialPlaces);
  const [guide, setGuide] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [activePhoto, setActivePhoto] = useState(null);
  const [inquiryStatus, setInquiryStatus] = useState('');
  const [submittingInquiry, setSubmittingInquiry] = useState(false);

  useEffect(() => {
    fetch('/api/destinations').then(r => r.ok ? r.json() : initialPlaces).then(setPlaces).catch(() => setPlaces(initialPlaces));
    fetch('/api/guide').then(r => r.ok ? r.json() : null).then(setGuide).catch(() => {});
  }, []);

  async function submitInquiry(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    setSubmittingInquiry(true);
    setInquiryStatus('');
    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.get('name'),
          phone: formData.get('phone'),
          message: formData.get('message')
        })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'We could not send your enquiry. Please try again.');
      form.reset();
      setInquiryStatus(result.message);
    } catch (error) {
      setInquiryStatus(error.message || 'We could not send your enquiry. Please call Rahul instead.');
    } finally {
      setSubmittingInquiry(false);
    }
  }

  if (window.location.pathname === '/admin') return <AdminInbox/>;

  return <>
    <header className="site-header">
      <a className="brand" href="#top" aria-label="Nohradhar and Churdhar, Beyond the Clouds home"><span className="brand-mark"><Mountain size={20} strokeWidth={1.7}/></span><span>Nohradhar &amp; Churdhar <i>Beyond the Clouds</i></span></a>
      <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation">{menuOpen ? <X/> : <Menu/>}</button>
      <nav className={menuOpen ? 'nav open' : 'nav'}>
        <a href="#places" onClick={() => setMenuOpen(false)}>Discover</a><a href="#region-guide" onClick={() => setMenuOpen(false)}>The region</a><a href="#trail" onClick={() => setMenuOpen(false)}>The trail</a><a href="#visit" onClick={() => setMenuOpen(false)}>Plan your visit</a><a href="#contact" onClick={() => setMenuOpen(false)}>Contact</a>
        <a className="nav-cta" href="#visit">Start exploring <ArrowUpRight size={15}/></a>
      </nav>
    </header>

    <main id="top">
      <section className="hero">
        <img className="hero-image" src="/images/snow-trail.jpg" alt="Fresh snow and layered Himalayan ridgelines near Churdhar" />
        <div className="hero-shade" />
        <div className="hero-copy"><div className="eyebrow light"><span/> SIRMAUR · HIMACHAL PRADESH</div>
          <h1>Find your way<br/>above the <em>clouds.</em></h1>
          <p>A quieter corner of the Himalaya. Begin in Nohradhar, follow the forest trail, and let Churdhar reveal itself one step at a time.</p>
          <a className="hero-button" href="#places">Explore the region <ArrowDown size={16}/></a>
        </div>
        <div className="hero-note"><span className="note-line"/> <span>30°52′N&nbsp;&nbsp; 77°28′E</span><span className="note-sep">/</span><span>THE SHIVALIKS, INDIA</span></div>
        <div className="hero-index">01 <span>—</span> 03</div>
      </section>

      <section className="intro section-wrap" id="places">
        <div className="intro-label"><span className="eyebrow">A PLACE TO SLOW DOWN</span><span className="small-rule"/></div>
        <div className="intro-text"><h2>Somewhere between<br/>the <em>village</em> and the sky.</h2><p>In Sirmaur district, the road winds toward Nohradhar—a small mountain village and the starting point for the revered Churdhar trek. Here, cedar forests give way to wide ridgelines, and the journey is as memorable as the summit.</p><a className="text-link" href="#trail">Get to know the trail <ArrowRight size={16}/></a></div>
        <div className="intro-stamp"><span>HIMACHAL</span><Compass size={35} strokeWidth={1}/><span>30° NORTH</span></div>
      </section>

      <section className="destinations section-wrap">
        <div className="section-heading"><div><span className="eyebrow">THREE WAYS INTO THE MOUNTAINS</span><h2>Make the journey <em>yours.</em></h2></div><span className="heading-count">01 — 03</span></div>
        <div className="place-grid">{places.map((place, index) => <a className={`place-card card-${index + 1}`} href={index === 1 ? '#trail' : '#visit'} key={place.id}>
          <img src={place.image} alt={place.name} loading="lazy"/><div className="card-overlay"/><span className="card-tag">{place.tag}</span><span className="card-arrow"><ArrowUpRight size={18}/></span><div className="card-copy"><h3>{place.name}</h3><p>{place.subtitle}</p></div>
        </a>)}</div>
      </section>

      <section className="region-guide" id="region-guide"><div className="region-heading"><span className="eyebrow">GET TO KNOW THIS CORNER OF SIRMAUR</span><h2>Two places, one <em>mountain story.</em></h2><p>Begin in Nohradhar’s valley, then follow the high country toward Churdhar’s forested slopes and sacred summit.</p></div><div className="region-grid">
        <article className="region-card"><div className="region-image"><img src="/images/mountain-bus.jpg" alt="A mountain road winding through the hills toward Nohradhar" loading="lazy"/><span>01 / THE GATEWAY</span></div><div className="region-body"><span className="eyebrow">THE VALLEY &amp; TRAILHEAD</span><h3>Nohradhar</h3><p>Nohradhar is a mountain settlement in Sirmaur and a well-known starting point for the Churdhar walk. The Sirmaur district guide describes the approach as a scenic drive into the Nohradhar valley, where the trek begins. From Shimla, its listed road route runs via Solan and Rajgarh.</p><div className="region-facts"><div><strong>18 km</strong><span>APPROX. TREK TO THE SUMMIT</span></div><div><strong>Sirmaur</strong><span>HIMACHAL PRADESH</span></div></div><a className="text-link region-source" href="https://hpsirmaur.nic.in/churdhar-trek/" target="_blank" rel="noreferrer">Sirmaur district trek guide <ArrowUpRight size={14}/></a></div></article>
        <article className="region-card"><div className="region-image"><img src="/images/nohradhar-portrait.jpg" alt="A rocky Churdhar summit rising into the clouds" loading="lazy"/><span>02 / THE HIGH COUNTRY</span></div><div className="region-body"><span className="eyebrow">SUMMIT, SANCTUARY &amp; SHRINE</span><h3>Churdhar</h3><p>At 3,647 metres, Churdhar is Sirmaur’s highest peak. The surrounding 55.52 km² wildlife sanctuary protects mountain forests and high-altitude habitats. Below the summit, the Shirgul Devta shrine—also revered as Chooreshwar Mahadev—gives the mountain deep spiritual significance for local communities.</p><div className="region-facts"><div><strong>3,647 m</strong><span>SUMMIT ELEVATION</span></div><div><strong>55.52 km²</strong><span>WILDLIFE SANCTUARY</span></div></div><a className="text-link region-source" href="https://himachaltourism.gov.in/destination/sirmaur/" target="_blank" rel="noreferrer">Himachal Tourism · Sirmaur <ArrowUpRight size={14}/></a><a className="text-link region-source" href="https://hpforest.gov.in/protected-area-detail-4" target="_blank" rel="noreferrer">Himachal Forest Department <ArrowUpRight size={14}/></a></div></article>
      </div></section>

      <section className="gallery section-wrap" id="gallery">
        <div className="section-heading"><div><span className="eyebrow">SEEN ALONG THE WAY</span><h2>Postcards from <em>the trail.</em></h2></div><span className="heading-count">13 PHOTOS</span></div>
        <div className="gallery-grid">{galleryPhotos.map((photo, index) => <button className={`gallery-photo photo-${index + 1}`} key={photo} onClick={() => setActivePhoto(photo)} aria-label={`Enlarge mountain photo ${index + 1}`}><img src={`/images/${photo}`} alt={`Nohradhar and Churdhar mountain scenery, photo ${index + 1}`} loading="lazy"/><span>{String(index + 1).padStart(2, '0')}</span></button>)}</div>
      </section>

      <section className="trail" id="trail"><div className="trail-image"><img src="/images/mountain-view.jpg" alt="Snow-dusted hills seen from a mountain balcony" loading="lazy"/><span className="image-caption">A VIEW ALONG THE WAY · SIRMAUR</span></div>
        <div className="trail-copy"><span className="eyebrow">THE CHURDHAR WALK</span><h2>A trail worth<br/>taking <em>slowly.</em></h2><p>The route from Nohradhar climbs through forest, meadow and open mountain air toward Churdhar’s sacred summit. Give yourself time to walk gently, notice the changing landscape and turn back if conditions call for it.</p>
          <div className="trail-facts"><div><strong>~18 km</strong><span>ONE WAY · APPROX.</span></div><div><strong>3,647 m</strong><span>SUMMIT ELEVATION</span></div><div><strong>1–2 days</strong><span>ALLOW FOR THE WALK</span></div></div><a className="text-link light-link" href="https://hpsirmaur.nic.in/churdhar-trek/" target="_blank" rel="noreferrer">Official trek details & advisory <ArrowUpRight size={15}/></a>
        </div></section>

      <section className="quote-band"><div className="quote-mark">“</div><blockquote>The mountains are not a place to conquer.<br/>They are a place to <em>listen.</em></blockquote><span>— A NOTE FOR THE ROAD</span></section>

      <section className="visit section-wrap" id="visit"><div className="visit-intro"><span className="eyebrow">BEFORE YOU GO</span><h2>Arrive with<br/><em>care.</em></h2><p>Conditions in the high hills change quickly. A little preparation makes for a safer, kinder visit.</p><button className="text-link guide-button" onClick={() => setShowGuide(!showGuide)}>{showGuide ? 'Close visitor notes' : 'Open visitor notes'} <ArrowRight size={16}/></button></div>
        <div className="visit-photo"><img src="/images/churdhar-temple.jpg" alt="Traditional temple architecture in the mountains" loading="lazy"/><span>CHURDHAR · LOCAL SHRINE</span></div>
        <div className="visit-list"><div className="visit-item"><span>01</span><div><h3>Reach Nohradhar</h3><p>From Shimla, the district administration lists a road route via Solan and Rajgarh. Check current bus and taxi options before you set out.</p><p className="address">Nohradhar, District Sirmaur, Himachal Pradesh</p><a className="contact-link map-link" href="https://www.google.com/maps/search/?api=1&query=Nohradhar%2C%20District%20Sirmaur%2C%20Himachal%20Pradesh" target="_blank" rel="noreferrer">Find Nohradhar on Google Maps <ArrowUpRight size={13}/></a></div></div><div className="visit-item"><span>02</span><div><h3>Contact for tourism</h3><p>Rahul Chauhan</p><p><a className="contact-link" href="tel:+918894064616">+91 88940 64616 <ArrowUpRight size={13}/></a></p></div></div><div className="visit-item"><span>03</span><div><h3>Check the conditions</h3><p>Spring through autumn is generally the most accessible. Snow and weather can change trail access—check local conditions before travel.</p></div></div><div className="visit-item"><span>04</span><div><h3>Pack for the mountain</h3><p>Bring sturdy footwear, warm layers, water, snacks and a charged phone. Keep a flexible plan and let someone know your route.</p></div></div>
          {showGuide && <div className="api-guide">{(guide?.notes || []).map((note, i) => <p key={i}>✓ &nbsp;{note}</p>)}</div>}
        </div>
      </section>

      <section className="contact-section" id="contact"><div className="contact-inner"><div className="contact-copy"><span className="eyebrow light">A LOCAL POINT OF CONTACT</span><h2>Planning a visit<br/>to <em>Nohradhar?</em></h2><p>For tourism enquiries and help planning your visit, get in touch with Rahul Chauhan or leave your details below.</p></div><div className="contact-card"><span>TOURISM CONTACT</span><h3>Rahul Chauhan</h3><a className="contact-phone" href="tel:+918894064616">+91 88940 64616 <ArrowUpRight size={16}/></a><div className="contact-actions"><a href="tel:+918894064616">Call Rahul <ArrowRight size={14}/></a><a href="https://wa.me/918894064616?text=Hello%20Rahul%2C%20I%27m%20planning%20a%20visit%20to%20Nohradhar." target="_blank" rel="noreferrer">WhatsApp <ArrowUpRight size={14}/></a></div></div><form className="inquiry-form" onSubmit={submitInquiry}><div className="form-heading"><span>PLAN YOUR VISIT</span><h3>Send an enquiry</h3><p>Leave your contact details and a message, and we’ll follow up about your visit.</p></div><div className="form-fields"><label>Your name<input name="name" type="text" autoComplete="name" placeholder="e.g. Aditi Sharma" minLength="2" maxLength="100" required/></label><label>Contact number<input name="phone" type="tel" autoComplete="tel" placeholder="e.g. +91 98765 43210" maxLength="24" required/></label><label className="message-field">Your message<textarea name="message" rows="4" minLength="5" maxLength="2000" placeholder="Tell us when you’re planning to visit or what you’d like to know…" required/></label><div className="form-submit-row"><button className="submit-enquiry" type="submit" disabled={submittingInquiry}>{submittingInquiry ? 'Sending…' : 'Send enquiry'} <ArrowRight size={15}/></button><span className="privacy-note">Your enquiry is saved on this website’s server for follow-up.</span></div>{inquiryStatus && <p className="form-status" role="status">{inquiryStatus}</p>}</div></form></div><span className="contact-location">NOHRADHAR · DISTRICT SIRMAUR · HIMACHAL PRADESH</span></section>

      <section className="closing"><div className="closing-bg"/><div className="closing-content"><span className="eyebrow light">THE ROAD IS PART OF IT</span><h2>Take the long<br/><em>way home.</em></h2><p>Start with an open mind. Leave with a little more sky.</p><a href="#top" className="hero-button">Back to the beginning <ArrowUpRight size={16}/></a></div><span className="closing-coord">NOHRADHAR · SIRMAUR · HIMACHAL PRADESH</span></section>
    </main>
    <footer><a className="brand footer-brand" href="#top"><span className="brand-mark"><Mountain size={18}/></span><span>Nohradhar &amp; Churdhar <i>Beyond the Clouds</i></span></a><a href="/admin">ENQUIRY INBOX</a><span className="footer-address">NOHRADHAR, DISTRICT SIRMAUR, HIMACHAL PRADESH</span><a href="#top">BACK TO TOP ↑</a></footer>
    {activePhoto && <div className="lightbox" role="dialog" aria-modal="true" aria-label="Photo viewer" onClick={() => setActivePhoto(null)}><button className="lightbox-close" onClick={() => setActivePhoto(null)} aria-label="Close photo">×</button><img src={`/images/${activePhoto}`} alt="Nohradhar and Churdhar mountain scenery" onClick={event => event.stopPropagation()}/></div>}
  </>;
}

createRoot(document.getElementById('root')).render(<App/>);
