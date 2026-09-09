
(() => {
  "use strict";

  // ---- Ikoner ------------------------------------------------------------
  const ico = {
    hjem:'<path d="M4 10l7-6 7 6v7a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 17z"/>',
    moduler:'<rect x="3.5" y="4" width="6" height="6" rx="2"/><rect x="12.5" y="4" width="6" height="6" rx="2"/><rect x="3.5" y="13" width="6" height="6" rx="2"/><rect x="12.5" y="13" width="6" height="6" rx="2"/>',
    mat:'<path d="M3.5 9.5h15a7.5 7.5 0 0 1-15 0z"/><path d="M8 6V3.5M11 6V3"/>',
    meg:'<circle cx="11" cy="8" r="3.5"/><path d="M4.5 18c1.5-3 4-4.5 6.5-4.5S16 15 17.5 18"/>'
  };
  const navSvg = (k, on) =>
    `<svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="${on?'var(--primary)':'var(--icon-muted)'}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ico[k]}</svg>`;

  /**
   * Bunnmenyen tegnes ett sted, ikke per skjerm. Med fire faner og åtte
   * fanebærende skjermer var drift garantert — én skjerm ville fått feil
   * aktiv fane, og ingen ville oppdaget det før i demo.
   *
   * Fanen heter «Mat», ikke «Oppskrifter»: ved 200 % tekst blir den siste
   * ca. 143px bred på en 393px skjerm, og fire faner har 98px hver.
   */
  const NAV = [
    ['hjem',    'Hjem'],
    ['moduler', 'Moduler'],
    ['mat',     'Mat'],
    ['meg',     'Meg'],
  ];

  function tegnNav(aktiv) {
    document.querySelectorAll('[data-nav]').forEach(n => {
      // Bygg én gang. Å skrive innerHTML på hver navigasjon river ut knappen
      // brukeren nettopp trykket på, og fokus faller til body.
      if (!n.firstElementChild) {
        n.innerHTML = NAV.map(([k, l]) =>
          `<button data-fane="${k}">${navSvg(k, false)}<span>${l}</span></button>`).join('');
      }
      n.querySelectorAll('[data-fane]').forEach(b => {
        const on = b.dataset.fane === aktiv;
        b.classList.toggle('on', on);
        if (on) b.setAttribute('aria-current', 'page');
        else    b.removeAttribute('aria-current');
        b.querySelector('svg').setAttribute('stroke', on ? 'var(--primary)' : 'var(--icon-muted)');
      });
    });
  }

  // ---- Tilstand ----------------------------------------------------------
  /**
   * Syntetiske eksempelnotater, slik at Notater og Tilbakeblikk kan vurderes
   * som skjermer i stedet for å stå tomme i en demo.
   *
   * `dagerSiden` i stedet for dato: rendereren regner om ved visning og får
   * dermed aldri et tidsintervall å enumerere.
   *
   * En funksjon, ikke en konstant, slik at «Start på nytt» får ferske
   * objekter og ikke de samme som brukeren nettopp kan ha slettet.
   */
  function startNotater() {
    return [
      { id:'n-01', type:'refleksjon', dagerSiden:1,
        tittel:'Om regelen jeg ikke visste jeg hadde',
        sporsmal:'Er det noe du gjør rundt mat som du ikke helt vet hvor kom fra?',
        tekst:'Jeg spiser ikke etter åtte. Aner ikke hvor det kom fra.\nDet var ikke en beslutning, det var bare noe som ble sånn.' },
      { id:'n-02', type:'notat', dagerSiden:4,
        tittel:'Middag hos Kari',
        tekst:'Gikk fint. Tenkte mye på forhånd, ganske lite underveis.' },
      { id:'n-03', type:'refleksjon', dagerSiden:12,
        tittel:'Etter første modul',
        sporsmal:'Hva satt du igjen med?',
        tekst:'At det ikke handlet om å slutte med noe.' },
    ];
  }

  /**
   * Syntetiske kommentarer, slik at flaten kan vurderes som flate.
   *
   * Én av dem har status 'skjult' MED VILJE. Den skal ikke vises noe sted, og
   * det er nettopp poenget: moderasjonstilstanden virker før noen trenger
   * den, i stedet for å være en kolonne noen skal fylle senere.
   */
  function startKommentarer() {
    return {
      'r-01': [
        { id:'k-01', dagerSiden:2, status:'publisert', rating:5, upvotes:14,
          authorMode:'firstName',
          forfatter:{ navn:'Maria', rolle:'grunnlegger' },
          tekst:'Kaffen er valgfri. Uten den smaker den som en sjokolademilkshake.' },
        { id:'k-02', dagerSiden:5, status:'publisert', rating:4, upvotes:9,
          authorMode:'anonymous',
          forfatter:{ navn:'Anonym', rolle:'bruker' },
          tekst:'Brukte vanlig yoghurt i stedet for melk. Ble tykkere og helt fint.' },
        { id:'k-03', dagerSiden:6, status:'skjult', rating:null, upvotes:0,
          authorMode:'firstName',
          forfatter:{ navn:'Skjult eksempel', rolle:'bruker' },
          tekst:'Denne skal ikke vises. Ligger her for å bevise at status virker.' },
      ],
      'r-10': [
        { id:'k-04', dagerSiden:1, status:'publisert', rating:5, upvotes:6,
          authorMode:'firstName',
          forfatter:{ navn:'Sara', rolle:'grunnlegger' },
          tekst:'Lag to glass samtidig. Det andre står klart dagen etter.' },
      ],
    };
  }

  // I minnet, ikke localStorage. En grunnlegger som viser appen to ganger
  // skal ikke se sine egne testvalg andre gang — og «Slett kontoen min»
  // ville vært en usann påstand i en demo som handler om tillit.
  function startTilstand() {
    return {
      profil:  { navn:'Ingrid', epost:'ingrid@epost.no', interesser:new Set() },
      lagret:  new Set(),
      /**
       * En LISTE brukeren fyller. Aldri slots[dag][måltid].
       * Tomme dager kan ikke rendres fordi de ikke finnes, og ingenting kan
       * hakes av fordi det ikke finnes noe felt å hake av i.
       */
      plan:    [],
      notater: startNotater(),
      valg:    { varsler:true, undertekst:false, lyd:true },
      /**
       * Kommentarer per oppskrift. Hver bærer forfatter.rolle og status fra
       * første linje — se tegnKommentarer for hvorfor det ikke kan utsettes.
       */
      kommentarer: startKommentarer(),
      kommentarSortering: {},
      kommentarUpvotes: new Set(),
      /**
       * «Dette har jeg» i handlelisten.
       *
       * ═══ DETTE ER DEN ENE AVHUKINGEN SOM ER TRYGG ═══
       * Den gjelder VARER I KJØLESKAPET, ikke MÅLTIDER DU HAR SPIST. Skillet er
       * hele forskjellen: å hake av at man har salt hjemme er arbeidsminnehjelp
       * i én handletur. Å hake av at man har spist frokost er et
       * etterlevelsesregister, og det er nøyaktig det appen ikke skal være.
       *
       * Derfor finnes det ingen `spist`-felt noe sted i modellen, og
       * måltidsplanen har ingen avhukingsboks. Ser du en slik dukke opp i en
       * senere runde, er dette kommentaren som skulle stoppet den.
       *
       * Et Set, ikke et lager: det finnes ingen antall, ingen datoer og ingen
       * beholdning. Se FASTE_VARER for hvorfor pilen peker inn og aldri ut.
       */
      harHjemme: new Set(),
    };
  }

  /**
   * ÉN kilde til starttilstand, og «Start på nytt» bygger fra den samme.
   *
   * Var en håndskrevet liste med nullstillinger, og den gikk ut av sync:
   * kommentarer og avhukede varer overlevde restart og møtte neste person i
   * en founder-gjennomgang. Nå er det umulig — legger du et felt i
   * startTilstand(), nullstilles det.
   */
  const state = startTilstand();

  // ---- Moduler -----------------------------------------------------------
  const MODULES = [
    {n:'Matstøy', d:'Hvorfor tankene om mat tar så mye plass.', free:true,
     svg:'<circle cx="44" cy="38" r="30" fill="none" stroke="var(--illo-light)" stroke-width="6"/><circle cx="44" cy="38" r="21" fill="none" stroke="var(--illo-mid)" stroke-width="6"/><circle cx="44" cy="38" r="11" fill="var(--illo-deep)"/><circle cx="70" cy="14" r="6" fill="var(--illo-warm)"/>'},
    {n:'Balanse', d:'Alt eller ingenting, og veien ut av det.',
     svg:'<path d="M14 46h60" stroke="var(--illo-mid)" stroke-width="9" stroke-linecap="round"/><path d="M44 46l-8 14h16z" fill="var(--illo-deep)"/><rect x="20" y="30" width="20" height="11" rx="5.5" fill="var(--illo-light)"/><rect x="52" y="26" width="20" height="15" rx="7.5" fill="var(--illo-warm)"/>'},
    {n:'Regler', d:'Hvor kommer de egentlig fra?',
     svg:'<rect x="20" y="10" width="34" height="54" rx="8" fill="var(--illo-light)"/><path d="M54 12l16 8v44l-16-6z" fill="var(--illo-deep)"/><circle cx="60" cy="40" r="4" fill="var(--illo-warm)"/>'},
    {n:'Kroppssignaler', d:'Sult og metthet som informasjon.',
     svg:'<circle cx="44" cy="38" r="27" fill="var(--illo-light)"/><circle cx="44" cy="38" r="18" fill="none" stroke="var(--illo-mid)" stroke-width="5"/><path d="M52 28l-6 16-10 4 6-16z" fill="var(--illo-deep)"/><circle cx="44" cy="9" r="5" fill="var(--illo-warm)"/>'},
    {n:'Sammen med andre', d:'Mat i sosiale situasjoner.',
     svg:'<circle cx="34" cy="38" r="22" fill="var(--illo-mid)"/><circle cx="56" cy="38" r="22" fill="var(--illo-deep)" opacity=".85"/><circle cx="45" cy="12" r="5" fill="var(--illo-warm)"/>'},
    {n:'Språket om mat', d:'Ordene som strammer til.',
     svg:'<path d="M26 52C12 42 20 20 38 20c16 0 18 20 6 26" fill="none" stroke="var(--illo-light)" stroke-width="13" stroke-linecap="round"/><path d="M64 22c14 10 6 32-12 32-16 0-18-20-6-26" fill="none" stroke="var(--illo-deep)" stroke-width="13" stroke-linecap="round"/><circle cx="44" cy="62" r="6" fill="var(--illo-warm)"/>'}
  ];
  const lock = '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="var(--icon-muted)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="8" width="10" height="7" rx="2.5"/><path d="M6.5 8V6a2.5 2.5 0 0 1 5 0v2"/></svg>';

  /**
   * Den aktive modulen har sin egen hovedflate over listen. Her tegnes bare
   * det som kommer etterpå, slik at Matstøy ikke konkurrerer med en mindre
   * kopi av seg selv i samme skjerm.
   */
  function tegnModuler(node) {
    node.querySelector('[data-slot="moduler"]').innerHTML = MODULES.slice(1).map(m => {
      // fill="none" på rot-SVG-en. Formene i MODULES setter sin egen fill og
      // overstyrer den; de som IKKE gjør det — strekformer med kun stroke —
      // arvet ellers fill:black, en farge som ikke finnes i paletten. I dag har
      // de null areal, så ingenting males svart. Det er en felle, ikke en feil:
      // første fylte form noen tegner uten fill blir ren svart.
      const art = `<span class="illo"><svg width="76" height="62" viewBox="0 0 88 72" fill="none" aria-hidden="true">${m.svg}</svg></span>`;
      const copy = `<span class="mod-copy">
        <span class="name">${m.n}</span>
        <span class="desc">${m.d}</span>
      </span>`;
      const fot = `<div class="mod-fot"><div class="locked-row">${lock}<span>Kommer</span></div></div>`;
      return `<div class="mod locked">${art}${copy}${fot}</div>`;
    }).join('');
  }

  // ---- Meg-seksjoner -----------------------------------------------------
  const ROW_ICONS = {
    varsler:   '<path d="M10 3v1"/><path d="M5.5 8.5a4.5 4.5 0 0 1 9 0c0 3 1 4 1.5 4.5h-12C4.5 12.5 5.5 11.5 5.5 8.5z"/><path d="M8.5 15.5a1.8 1.8 0 0 0 3 0"/>',
    lesing:    '<rect x="3" y="4.5" width="14" height="11" rx="3"/><path d="M8 8.5l4 1.5-4 1.5z"/>',
    sprak:     '<circle cx="10" cy="10" r="7"/><path d="M3.4 8h13.2M3.4 12h13.2"/><path d="M10 3c-2.2 2.2-2.2 11.8 0 14 2.2-2.2 2.2-11.8 0-14z"/>',
    data:      '<path d="M10 3l6 2.5v5c0 3.3-2.5 5.6-6 6.5-3.5-.9-6-3.2-6-6.5v-5z"/>',
    refleksjon:'<path d="M4 5h12v8.5a2 2 0 0 1-2 2H8l-4 2.5z"/><path d="M7.5 9h5"/>',
    slett:     '<path d="M4.5 6.5h11"/><path d="M6.5 6.5V5a1.5 1.5 0 0 1 1.5-1.5h4A1.5 1.5 0 0 1 13.5 5v1.5"/><path d="M6 6.5l.8 9A1.5 1.5 0 0 0 8.3 17h3.4a1.5 1.5 0 0 0 1.5-1.5l.8-9"/>',
    hjelp:     '<circle cx="10" cy="10" r="7"/><path d="M10 13.5v.01"/><path d="M8.2 8a1.9 1.9 0 0 1 3.6.8c0 1.2-1.8 1.4-1.8 2.6"/>',
    om:        '<circle cx="10" cy="10" r="7"/><path d="M10 9v5"/><path d="M10 6.5v.01"/>',
    feedback:  '<path d="M4 5h12v8H9l-4 3.5V13H4z"/>'
  };
  const rowSvg = (key, danger) =>
    `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="${danger?'var(--error)':'var(--accent)'}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ROW_ICONS[key]}</svg>`;

  /** [etikett, ikon, underlinje, farlig, vend, ark] — vend gjør raden til en bryter. */
  const SECTIONS = [
    ['Generelt', [
      ['Varsler', 'varsler', 'Påminnelse om påbegynt modul', null, 'varsler'],
      ['Undertekster', 'lesing', 'Vises på video og lyd', null, 'undertekst'],
      ['Språk', 'sprak', 'Norsk (bokmål)', null, null, 'sprak']
    ]],
    ['Personvern', [
      ['Slik behandler vi data', 'data', null, null, null, 'personvern'],
      ['Refleksjonene dine', 'refleksjon', 'Lagret kun på denne telefonen', null, null, 'lokal-lagring'],
      ['Slett kontoen min', 'slett', null, true]
    ]],
    // «Hjelp og ressurser» lå her og pekte på et «kommer senere»-ark. Fjernet:
    // hjelp er ikke en innstilling, og en av de to veiene den skal tilby er en
    // hjelpetelefon. Den skal ikke ligge tre nivåer ned bak et tannhjul.
    // Den bor nå fast nederst på Meg.
    ['Støtte', [
      ['Om appen og fagansvar', 'om', null, null, null, 'om-florir'],
      ['Gi tilbakemelding', 'feedback', null, null, null, 'review-feedback']
    ]]
  ];
  /**
   * Escaper tekst som skal inn i innerHTML.
   *
   * ═══ DETTE ER EN SIKKERHETSRETTING, IKKE OPPRYDDING ═══
   * Kommentarfeltet og søkefeltet skrev brukertekst rett inn i en
   * template-literal som ble satt med innerHTML. En kommentar med
   * <img src=x onerror=...> KJØRTE — verifisert. Søkefeltet var verre: det
   * krevde ikke engang at noe ble lagret, koden kjørte mens man skrev.
   *
   * Alt brukerskrevet som ikke går via textContent skal gjennom denne.
   * Det gjelder kommentarer, søketekst, notattitler, notattekst,
   * refleksjonsspørsmål og profilnavn — alt brukeren selv har fylt inn.
   *
   * Ampersand FØRST, ellers dobbeltescapes de andre.
   */
  const esc = t => String(t ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  /** Haken i handlelisten. Egen konstant så den ikke drifter mellom steder. */
  const HAKE = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--on-primary)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7"/></svg>';

  const chev = '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="var(--icon-muted)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 4l5 5-5 5"/></svg>';

  // ---- Oppskrifter -------------------------------------------------------
  // ─── OPPSKRIFTER:START — generert av design/build-innhold.mjs. Ikke rediger. ───
  const OPPSKRIFTER = [
    {id:'r-01',
     navn:'Mochagrøt',
     kategori:'Grøt',
     maltid:'frokost',
     kreditering:'Livsstilsdagboken MariaClausen',
     beskrivelse:'Havregrøt med kakao og et streif av kaffe. Toppes med bær og peanøttsmør.',
     porsjoner:1,
     rekkefolge:1,
     publisertDato:'2026-07-28',
     snitt:4.1,
     vurderinger:28,
     tags:['varmt'],
     ingredienser:['1 dl. havregryn','2 dl. vann','1 dl. melk (evt. 2 ss. vaniljeyoghurt)','2 ss. kakaopulver','1/2 ts. pulverkaffe','en klype salt','1 ss. sirup'],
     topping:['1 neve frosne eller ferske bringebær','1/2 banan','1/2 ss. peanøttsmør','1 neve valnøttkjerner'],
     steg:['Kok opp havregryn med vann, og tilsett resten av ingrediensene til du får en tykk grøt.']},
    {id:'r-02',
     navn:'Hjemmelaget grovbrød',
     kategori:'Brød',
     maltid:'snacks',
     kreditering:'Livsstilsdagboken MariaClausen',
     beskrivelse:'Grovbrød uten gjær og uten heving. Røres sammen og settes rett i ovnen.',
     porsjoner:1,
     rekkefolge:2,
     publisertDato:'2026-07-25',
     snitt:4.2,
     vurderinger:28,
     tags:['baking','matpakke'],
     ingredienser:['3.5 dl (350 g.) naturell yoghurt','1,5 ss. eplecidereddik','1,5 ss. bakepulver','4,5 dl (250 g.) fullkornsmel (her: fibra)','1,5 dl (100 g.) siktet hvetemel','0,8 dl vann','1 ts. salt','en håndfull: linfrø, sesamfrø, solsikkekjerner'],
     topping:[],
     steg:['1. Sett ovnen på 185 grader.','2. Bland sammen yoghurt, eddik, bakepulver, vann og salt.','3. Deretter blander du inn mel og frø/kjerner etter ønske.','4. Fordel i en brødform (her: 10x23 cm) og stek i ovnen i +/- 60 min.','Tips til brødelskere: når du først er i gang så kan det være en idé å lage dobbel porsjon slik at du kan fryse ned et brød til senere, da har du brød for en god stund fremover']},
    {id:'r-03',
     navn:'Grønn proteinbowl',
     kategori:'Yoghurt',
     maltid:'frokost',
     kreditering:'Livsstilsdagboken, MariaClausen',
     beskrivelse:'Kremet bowl av cottage cheese, avokado og spinat. Banan og blåbær på toppen.',
     porsjoner:1,
     rekkefolge:3,
     publisertDato:'2026-07-22',
     snitt:4.3,
     vurderinger:28,
     tags:['raskt'],
     ingredienser:['1/2 boks cottage cheese','50 g. frossen avokado (eller 1/4 fersk avokado)','1 håndfull spinat','1/2 ss peanøttsmør','1 ts vaniljesukker','1/2 ss søtning'],
     topping:['1/4 banan','1 håndfull blåbær'],
     steg:['Stavmiks eller bruk en foodprosessor eller blender til å mikse cottage cheese, avokado, peanøttsmør, vaniljesukker, søtning og spinat til en klumpfri røre.','Ha over i en skål og topp med banan og blåbær.']},
    {id:'r-04',
     navn:'Gulrotwrap',
     kategori:'Chia',
     maltid:'lunsj',
     kreditering:'Livsstilsdagboken, MariaClausen',
     beskrivelse:'Wrap bakt av raspet gulrot og egg. Rulles med det du har av pålegg.',
     porsjoner:1,
     rekkefolge:4,
     publisertDato:'2026-07-19',
     snitt:4.4,
     vurderinger:28,
     tags:['matpakke','raskt'],
     ingredienser:['1 egg','2 gulrøtter','3 ss. cottage cheese','1 dl. revet ost','Fyll:','Valgfritt pålegg','Grønt tilbehør'],
     topping:[],
     steg:['Sett ovnen på 220 grader over- og undervarme.','Stavmiks egg og cottage cheese (eller bland godt med en gaffel). Rasp 2 gulrøtter og ost dersom den ikke er ferdig revet.','Bland alle ingrediensene i en bolle før du har røren på et bakepapir og presser flatt til en sirkel.','Stek i ovnen i ca. 15-20 minutter eller til du ser at den får en gyllen skorpe.','Server med valgfritt pålegg og grønt tilbehør.']},
    {id:'r-05',
     navn:'Omelett',
     kategori:'Egg',
     maltid:'lunsj',
     kreditering:'Livsstilsdagboken MariaClausen',
     beskrivelse:'Tre egg stekt sakte på svak varme. Serveres med en grov skive ved siden av.',
     porsjoner:1,
     rekkefolge:5,
     publisertDato:'2026-07-16',
     snitt:4.5,
     vurderinger:29,
     tags:['varmt','raskt'],
     ingredienser:['3 Egg','1 grov brødskive','Pålegg (eks. kokt skinke/kalkunpålegg/spekeskinke/kyllingpålegg)','Grønt tilbehør'],
     topping:[],
     steg:['Visp sammen, sleng på en panne med flytende margarin/olje (på svak til middels varme). Etter 5-10 min vil oversiden ha størknet helt, og du kan ha den på en tallerken med det pålegget du liker best.']},
    {id:'r-06',
     navn:'Arme riddere x Kanelbolle',
     kategori:'Brødskive',
     maltid:'snacks',
     kreditering:'Livsstilsdagboken MariaClausen',
     beskrivelse:'Kanelbolle og arme riddere i samme rett. Deigen røres sammen og stekes i panne.',
     porsjoner:1,
     rekkefolge:6,
     publisertDato:'2026-07-13',
     snitt:4.6,
     vurderinger:29,
     tags:['baking','sott','matpakke','raskt'],
     ingredienser:['1 egg','100 g vaniljekesam','3 dl mel (her: siktet og sammalt hvetemel)','1 ts. vaniljesukker','1 ts. bakepulver','1/2 ts. salt','Dyppes i:','1. En blanding av 1 egg og 1 dl melk.','2. En blanding av 2 ss kanel og 2 ss sukker (evt sukrin eller sukrin gold)'],
     topping:[],
     steg:['1. Bland sammen 1 egg, vaniljekesam, mel, vaniljesukker, bakepulver og salt til du får en deig.','2. Kjevle til et rektangel og bruk en kniv eller pizzaskjærer til å dele inn i like 18-20 store emner.','3. Pisk sammen egg og melk før du dypper bitene i det, og deretter kanel og sukker.','4. Stekes på svak/middels varme til du får en brun skorpe på begge sider.','5. Smaker ekstra godt i kombinasjon med sirup, bær, syltetøy, krem eller vaniljekesam','hvis du har rester fra egg- og melkeblandingen så kan du f.eks bruke det til å lage pannekaker eller arme riddere med brød']},
    {id:'r-07',
     navn:'Grønn glede',
     kategori:'Smoothie',
     maltid:'snacks',
     kreditering:'Livsstilsdagboken, MariaClausen',
     beskrivelse:'Smoothie med banan, kiwi og avokado. Ingefæren gir den et lite spark.',
     porsjoner:1,
     rekkefolge:7,
     publisertDato:'2026-07-10',
     snitt:4.7,
     vurderinger:29,
     tags:['raskt'],
     ingredienser:['2 frosne bananer','1 kiwi','1/2 avokado','2 stenger stangselleri','2 cm revet ingefær','0,5 dl. lett kokosmelk (evt. annen melk eller yoghurt)','Valgfri topping'],
     topping:[],
     steg:['Kjør alt i en blender til en creamy konsistens']},
    {id:'r-08',
     navn:'Fluffy pannekaker',
     kategori:'Annet',
     maltid:'snacks',
     kreditering:'Livsstilsdagboken, MariaClausen',
     beskrivelse:'Tykke, luftige pannekaker. Eggehvitene vendes inn til slutt, og det er hele trikset.',
     porsjoner:1,
     rekkefolge:8,
     publisertDato:'2026-07-07',
     snitt:4.8,
     vurderinger:29,
     tags:['varmt','baking','sott'],
     ingredienser:['1 egg','2 eggehvite','2 ss kesam eller gresk yoghurt','3 ss melk','1/2 ts bakepulver','1/2 ts natron','1 ss sukker','en klype salt','8 ss hvetemel','2 ss smør til steking'],
     topping:[],
     steg:['Bland sammen alle ingredienser utenom eggehvite.','Stivpisk eggehvite.','Rør inn forsiktig i røren til alt er godt blandet.','Stek på middels varme til gyllenbrun på begge sider.']},
    {id:'r-09',
     navn:'Bakt havregrøt cookie dough',
     kategori:'Grøt',
     maltid:'frokost',
     kreditering:'Livsstilsdagboken, MariaClausen',
     beskrivelse:'Havregrøt som bakes i ovnen til den setter seg. Smaker som kakedeig, spises med skje.',
     porsjoner:1,
     rekkefolge:9,
     publisertDato:'2026-07-04',
     snitt:4.9,
     vurderinger:29,
     tags:['varmt','baking','sott'],
     ingredienser:['1 dl. havremel (eller malt havregryn)','1 ts. kardemomme (eller kanel)','0,6 dl. melk','1 ss. vaniljeyoghurt (evt naturell yoghurt/vaniljekesam/kesam)','1/2 ts. bakepulver','1/4 ts. salt','1 ss. sukker (eller annen søtning)','1-2 ruter mørk sjokolade'],
     topping:[],
     steg:['1. Sett ovnen på 220 grader.','2. Bland alle ingrediensene i en bolle. (Hvis du bruker havregryn så anbefaler jeg å stavmikse eller ha de i en blender)','3. Hell over i en liten ildfast form (her: 10 cm i diameter og 4 cm dyp) og topp med opphakket mørk sjokolade.','4. Stek i ovnen i +/- 15 min.']},
    {id:'r-10',
     navn:'Overnight oats blåbær',
     kategori:'Grøt',
     maltid:'frokost',
     kreditering:'Livsstilsdagboken, MariaClausen',
     beskrivelse:'Havregryn som sveller i melk over natten. Står ferdig i kjøleskapet til morgenen.',
     porsjoner:1,
     rekkefolge:10,
     publisertDato:'2026-07-01',
     snitt:4.9,
     vurderinger:30,
     tags:['varmt','raskt'],
     ingredienser:['1,5 dl havregryn','1,5 dl melk','2 ss. yoghurt eller kesam (naturell eller vanilje)','1 ss blåbærsyltetøy','2 håndfuller blåbær'],
     topping:[],
     steg:['Bland alle ingrediensene i et glass eller en skål og la svelle i 15-20 minutt eller over natten']},
    {id:'r-11',
     navn:'Eltefritt grytebrød',
     kategori:'Brød',
     maltid:'snacks',
     kreditering:'Livsstilsdagboken, MariaClausen, Matprat',
     beskrivelse:'Brød uten elting, hevet over natten. Stekes i gryte med lokk og får sprø skorpe.',
     porsjoner:1,
     rekkefolge:11,
     publisertDato:'2026-06-28',
     snitt:3.9,
     vurderinger:30,
     tags:['baking','matpakke','sosialt'],
     ingredienser:['250 g. siktet hvetemel','250 g. sammalt hvetemel','2 ts salt','0,25 ts tørrgjær','4 dl vann'],
     topping:[],
     steg:['Bruk en sleiv og bland det tørre sammen i en bolle. Hell i vann og rør deigen raskt sammen. Deigen skal være fast, men fortsatt litt klissete. Dekk bakebollen med lokk eller plastfolie, og hev deigen i romtemperatur i 12-18 timer.','Dryss godt med mel på et ark bakepapir, og hvelv deigen over på arket. Deigen er litt klissete. Bruk en slikkepott eller litt mel på fingrene og brett sammen deigen fra kanten og inn mot midten. Gjenta bretteprosessen et par ganger og strø eventuelt på litt mer mel dersom deigen klistrer seg fast til papiret.','Snu deigen og legg den med brettesiden ned på bakepapirarket. Sørg for å ha godt med mel på arket slik at brødet ikke setter seg fast under etterhevingen. Snu bakebollen over deigen, og la brødet etterheve i 1 1/2 time.','Når brødet har stått på kjøkkenbenken i 1 1/2 time, sett inn en støpejernsgryte med lokk i stekeovnen og skru ovnen på 250 grader. La gryten stå i stekeovnen en 1/2 time slik at den blir god og varm.','Ta den varme formen ut av stekeovnen når deigen er ferdig hevet. Strø litt mel i bunnen av gryten. Løft opp deigen ved hjelp av bakepapiret og hvelv den over i gryta. Ha på lokk og sett gryten tilbake i stekeovnen. Stek brødet i 30 minutter på nederste rille.','Ta av lokket på gryten, skru stekeovnen på 200 grader, og stek videre i 10-15 minutter til brødet har fått en fin gyllen farge og en sprø stekeskorpe. Vend brødet ut av gryten og avkjøl på rist.','Tips: oppskriften passer fint til en gryte på 24 cm i diameter. Gryten du bruker bør tåle 250 grader og ha lokk.']},
    {id:'r-12',
     navn:'Enkelt havrebrød',
     kategori:'Brød',
     maltid:'snacks',
     kreditering:'Livsstilsdagboken, MariaClausen',
     beskrivelse:'Havrebrød som røres sammen i én bolle. Ingen elting og ingen heving.',
     porsjoner:1,
     rekkefolge:12,
     publisertDato:'2026-06-25',
     snitt:4,
     vurderinger:30,
     tags:['baking','matpakke'],
     ingredienser:['270 g. havremel + 30 g. havregryn','1,5 dl. vann','1 ts. salt','1 ts. natron','3,5 dl. naturell yoghurt','1 håndfull solsikkefrø','1 håndfull gresskarkjerner'],
     topping:[],
     steg:['Bland alle ingrediensene i en bolle, la røren svelle i 5-10 min før du fyller opp en brødform (her: 10x23 cm) og stek i ovnen på 185 grader i ca. 50-60 min.']},
    {id:'r-13',
     navn:'Ostekake bowl',
     kategori:'Yoghurt',
     maltid:'frokost',
     kreditering:'Livsstilsdagboken, MariaClausen',
     beskrivelse:'Vaniljekesam, havregryn og syltetøy lagvis i et glass. Tar et par minutter.',
     porsjoner:1,
     rekkefolge:13,
     publisertDato:'2026-06-22',
     snitt:4.1,
     vurderinger:30,
     tags:['baking','sott','raskt'],
     ingredienser:['8 ss vaniljekesam (evt gresk vaniljeyoghurt eller vanlig vaniljeyoghurt)','4 ss havregryn eller Weetabix','2 ss bringebærsyltetøy eller jordbærsyltetøy'],
     topping:[],
     steg:['Fordel lagvis syltetøy, havregryn og vaniljekesam eller bland sammen i en skål.']},
    {id:'r-14',
     navn:'Kanelbolle bowl',
     kategori:'Yoghurt',
     maltid:'frokost',
     kreditering:'Livsstilsdagboken, MariaClausen',
     beskrivelse:'Yoghurt rørt med kanel og honning. Knekkebrødet knuses over og gir knas.',
     porsjoner:1,
     rekkefolge:14,
     publisertDato:'2026-06-19',
     snitt:4.2,
     vurderinger:30,
     tags:['baking','sott','raskt'],
     ingredienser:['8 ss. gresk yoghurt eller kesam (naturell eller vanilje)','1 ts kanel','1 ts honning, sirup eller sukker','2 knekkebrød (gjerne med kanelsmak)'],
     topping:['2 håndfuller bær eller frukt'],
     steg:['Bland kesam/gresk yoghurt med kanel og honning (eller annen søtning). Knus kanelknekkebrød i små biter og topp med bær eller annen frukt.']},
    {id:'r-15',
     navn:'Chiapudding snickers',
     kategori:'Chia',
     maltid:'frokost',
     kreditering:'Livsstilsdagboken, MariaClausen',
     beskrivelse:'Chiapudding med peanøttsmør og kakao. Røres om kvelden, står klar om morgenen.',
     porsjoner:1,
     rekkefolge:15,
     publisertDato:'2026-06-16',
     snitt:4.3,
     vurderinger:30,
     tags:['sott','raskt'],
     ingredienser:['3 ss. chiafrø','1 dl. melk','3 ss. vaniljekesam/vaniljeyoghurt/cottage cheese/gresk vaniljeyoghurt','1 ss. peanøttsmør','2 ss. kakaopulver','1/2 ss. lønnesirup (evt annen søtning)'],
     topping:['1/2 frukt eller 1 håndfull bær til servering'],
     steg:['Bland alle ingrediensene i en bolle og la røren svelle i minst 20 min eller over natten']},
    {id:'r-16',
     navn:'Chiapudding med mango og kokos',
     kategori:'Chia',
     maltid:'frokost',
     kreditering:'Livsstilsdagboken, MariaClausen',
     beskrivelse:'Chiapudding rørt med kokosmelk og mango. Sveller i minst tjue minutter.',
     porsjoner:1,
     rekkefolge:16,
     publisertDato:'2026-06-13',
     snitt:4.4,
     vurderinger:31,
     tags:['raskt'],
     ingredienser:['3 ss. chiafrø','1 dl. hermetisk kokosmelk, lett','4 ss. kesam eller gresk yoghurt','2 håndfuller mango'],
     topping:[],
     steg:['Bland alle ingrediensene i en bolle og la røren svelle i minst 20 min eller over natten. Topp gjerne med mango og kokos.']},
    {id:'r-17',
     navn:'Pizzaomelett',
     kategori:'Egg',
     maltid:'lunsj',
     kreditering:'Livsstilsdagboken, MariaClausen',
     beskrivelse:'Omelett stekt med en tortilla i bunnen. Toppes som en pizza.',
     porsjoner:1,
     rekkefolge:17,
     publisertDato:'2026-06-10',
     snitt:4.5,
     vurderinger:31,
     tags:['varmt','sosialt'],
     ingredienser:['1 medium fullkornstortilla (kan også bruke lomper)','2 egg','Pålegg (eks skinke, spekeskinke)'],
     topping:[],
     steg:['1. Ha pålegg i en stekepanne på middels varme.','2. Visp sammen egg og hell over.','3. Legg på en tortillalefse.','4. Snu lefsen når du ser at egget begynner å stivne og stek videre i 2-3 minutter på middels/lav varme.','5. Server med grønt tilbehør','Tips til grønt tilbehør: Sjampinjong, paprika, babyleaf og avokado. Dette kan også varieres']},
    {id:'r-18',
     navn:'Osteomelett',
     kategori:'Egg',
     maltid:'lunsj',
     kreditering:'Livsstilsdagboken, MariaClausen',
     beskrivelse:'Omelett med ost og stekt kylling. Bruk de grønnsakene du har.',
     porsjoner:1,
     rekkefolge:18,
     publisertDato:'2026-06-07',
     snitt:4.6,
     vurderinger:31,
     tags:['varmt'],
     ingredienser:['1/2 dl revet ost','2 egg','1 kyllingfilet','valgfrie grønnsaker'],
     topping:[],
     steg:['Stek kyllingen til gjennomstekt.','Visp sammen egg.','Fordel revet ost utover en stekepanne til den begynner å smelte og hell over eggene.','Når omeletten begynner å stivne kan du ha kyllingen og fyllet inn i omeletten og rulle sammen.']},
    {id:'r-19',
     navn:'Bagels (hjemmelaget)',
     kategori:'Brødskive',
     maltid:'snacks',
     kreditering:'Livsstilsdagboken, MariaClausen',
     beskrivelse:'Bagels av gresk yoghurt og mel, uten gjær. Seks stykker, og de fryser godt.',
     porsjoner:6,
     rekkefolge:19,
     publisertDato:'2026-06-04',
     snitt:4.7,
     vurderinger:31,
     tags:['matpakke','raskt','sosialt'],
     ingredienser:['400 g. gresk yoghurt eller kesam','250 g. mel (her: siktet og sammalt hvetemel) + ekstra til kjevling','1 ts. bakepulver','1/2 ts. salt','egg til pensling (kan sløyfes)','sesamfrø (kan sløyfes)'],
     topping:[],
     steg:['1. Sett ovnen på 200 grader.','2. Bland sammen alle ingrediensene i en bolle.','3. Del inn i 6 like store emner og form til bagels med et hull i midten.','4. Pensle med egg og strø over sesamfrø (dette punktet kan droppes).','5. Stek i ovnen i +/- 20 min eller til du får en gyllenbrun farge. Topp med det du liker best']},
    {id:'r-20',
     navn:'Arme riddere',
     kategori:'Brødskive',
     maltid:'snacks',
     kreditering:'Livsstilsdagboken, MariaClausen',
     beskrivelse:'Klassiske arme riddere med kanel og kardemomme. Fin måte å bruke opp brød på.',
     porsjoner:1,
     rekkefolge:20,
     publisertDato:'2026-06-01',
     snitt:4.7,
     vurderinger:32,
     tags:['matpakke','raskt'],
     ingredienser:['2 brødskiver','1 stk egg','1 dl melk','1/2 ss sukker','1/4 ts kanel','1/4 ts kardemomme','1/2 ss smør til steking'],
     topping:[],
     steg:['Start med å finne frem en bolle og tilsett egg, melk og krydder. Bland godt sammen.','Legg brødet i eggeblandingen og la væsken trekke seg inn i brødet. Snu brødet rundt. Dette gjør du med alle skivene.','Finn frem en stekepanne og sett på litt over medium varme. Tilsett smør og vent til smøret begynner å bli brunt før du legger de væte brødskivene i panna. Stek 3-4 minutter på hver side til brødet har fått en gylden og fin farge på begge sider.']},
    {id:'r-21',
     navn:'Bringebærsmoothie',
     kategori:'Smoothie',
     maltid:'snacks',
     kreditering:'Livsstilsdagboken, MariaClausen',
     beskrivelse:'Smoothie av frosne bringebær og banan. Havregrynene gjør den tykkere.',
     porsjoner:1,
     rekkefolge:21,
     publisertDato:'2026-05-29',
     snitt:4.8,
     vurderinger:32,
     tags:['raskt'],
     ingredienser:['1 banan','6 dl. frosne bringebær','3 ss. vaniljekesam','1 dl melk (evt. et par spiseskjeer naturell yoghurt)','3 ss. havregryn (evt. chiafrø)'],
     topping:[],
     steg:['Kjør i blender til passelig konsistens og topp med litt bringebær, kokos og frøene fra et granateple']},
    {id:'r-22',
     navn:'Fersken- og mangosmoothie',
     kategori:'Smoothie',
     maltid:'snacks',
     kreditering:'Livsstilsdagboken, MariaClausen',
     beskrivelse:'Smoothie med fersken og mango. Blir tykk og kald av den frosne mangoen.',
     porsjoner:1,
     rekkefolge:22,
     publisertDato:'2026-05-26',
     snitt:4.9,
     vurderinger:32,
     tags:['raskt'],
     ingredienser:['3 fersken','2 never frossen eller fersk mango','3 ss. vaniljekesam','1 banan'],
     topping:[],
     steg:['Kutt opp fersken fri for steiner og ha de oppi en blender sammen med resten av ingrediensene']},
    {id:'r-23',
     navn:'Gulrotkakevafler',
     kategori:'Annet',
     maltid:'snacks',
     kreditering:'Livsstilsdagboken, MariaClausen',
     beskrivelse:'Vafler med raspet gulrot, kanel og kardemomme. Røren kjøres i blender.',
     porsjoner:6,
     rekkefolge:23,
     publisertDato:'2026-05-23',
     snitt:3.9,
     vurderinger:32,
     tags:['baking','sott','sosialt'],
     ingredienser:['3 egg','5 ss gresk yoghurt eller kesam (vanilje el naturell)','1/2 ts salt','1 dl havregryn','2 dl hvetemel/speltmel (siktet eller sammalt)','1 dl vann','1/2 ts bakepulver','1 ss søtning','1 stor gulrot','1 ts kanel','1/2 ts kardemomme','1/2 ts malt muskat'],
     topping:[],
     steg:['Skyll og rasp gulroten. Ha alle ingrediensene i en blender eller foodprosessor og blend til en glatt røre. Stek i vaffeljern.']},
    {id:'r-24',
     navn:'Minipannekaker',
     kategori:'Annet',
     maltid:'snacks',
     kreditering:'Livsstilsdagboken, MariaClausen',
     beskrivelse:'Små pannekaker stekt noen få om gangen. Toppes med eple, jordbær eller banan.',
     porsjoner:2,
     rekkefolge:24,
     publisertDato:'2026-05-20',
     snitt:4,
     vurderinger:32,
     tags:['varmt','baking','sott','sosialt'],
     ingredienser:['1 egg','3 dl mel (her: havremel/siktet hvetemel)','1,5 dl melk','1/2 ts. bakepulver','1/2 ts. vaniljesukker','en klype salt'],
     topping:['eple','jordbær','banan'],
     steg:['1. Bland sammen alle ingrediensene til pannekakerøren.','2. Kutt opp frukt og bær i skiver.','3. Dypp de i pannekakerøren og stek på middels varme i en stekepanne.']},
  ];
  // ─── OPPSKRIFTER:SLUTT ───

  // ---- Innhold -----------------------------------------------------------
  /**
   * Alt innhold i ÉN konstant. Grunnen er ikke ryddighet. Den er at
   * «finnes det næringstall noe sted i modellen» skal være ett grep, og at
   * Maria og Sara skal kunne lese alt syntetisk innhold uten å lete.
   *
   *   grep -niE 'kcal|kalori|makro|karbo|næring|fiber' <denne fila>
   *
   * Eneste tillatte treff er ordet «protein» inne i et oppskriftsnavn.
   */
  const DATA = {
    kategorier: ['Grøt','Brød','Yoghurt','Chia','Egg','Brødskive','Smoothie','Annet'],

    /** Ett vokabular for moduler og oppskriftsrelevans. */
    interesser: [
      { id:'matstoy',   label:'Matstøy' },
      { id:'regler',    label:'Matregler' },
      { id:'altellerintet', label:'Alt eller ingenting' },
      { id:'sosialt',   label:'Mat sammen med andre' },
      { id:'sprak',     label:'Språket om mat' },
      { id:'raskt',     label:'Raskt på morgenen' },
      { id:'varmt',     label:'Varm frokost' },
      { id:'baking',    label:'Baking' },
      { id:'sott',      label:'Noe søtt' },
      { id:'matpakke',  label:'Matpakke og medbragt' },
    ],

    oppskrifter: OPPSKRIFTER,

    moduler: MODULES,
  };

  /** Etikettene bak oppskriftsrekkefølge, til «Hvorfor ser du dette?». */
  const valgteEtiketter = () => [...state.profil.interesser]
    .map(t => DATA.interesser.find(i => i.id === t)?.label).filter(Boolean);

  // ---- Liste og tom tilstand ---------------------------------------------
  /**
   * Tom tilstand er alltid innhold, aldri en skjult beholder. En skjult
   * beholder ser ut som en lastefeil for brukeren og som en ferdig skjerm
   * for den som leser koden.
   */
  function tomt({ tittel = 'Ingenting her ennå', tekst = '', knapp = null, ikon = true } = {}) {
    return `<div class="empty">
      ${ikon ? `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--illo-mid)"
           stroke-width="1.5" stroke-linecap="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9"/><path d="M8.5 12.5h7"/></svg>` : ''}
      <h2 class="t-card">${tittel}</h2>
      ${tekst ? `<p>${tekst}</p>` : ''}
      ${knapp ? `<button class="btn btn-secondary" ${knapp.attr}>${knapp.tekst}</button>` : ''}
    </div>`;
  }

  /**
   * Deler ikke raden — deler kravet rundt raden: skillelinje mellom rader,
   * aldri før første eller etter siste, og en tom tilstand som ikke kan
   * glemmes. Returnerer streng, ikke DOM, slik at en renderer kan sette hele
   * skjermen med én innerHTML-skriving. Det er «tegn før du viser» i praksis.
   */
  function tegnListe(items, radFn, opts = {}) {
    if (!items.length) return tomt(opts.tom);
    return `<div class="list${opts.klasse ? ` ${opts.klasse}` : ''}"${opts.merke ? ` aria-label="${opts.merke}"` : ''}>`
         + items.map((it, i) => (i ? '<div class="rule"></div>' : '') + radFn(it, i)).join('')
         + `</div>`;
  }

  /**
   * Oppskriftsrad. Navigasjon og lagring er søsken, ikke nøstede knapper:
   * hele tekst-/bildeflaten åpner oppskriften, mens bokmerket har sin egen
   * 48px trykkflate.
   */
  const radOppskrift = o => `
    <div class="recipe-row">
      <button class="recipe-row__main" data-go="oppskrift" data-id="${o.id}">
        <span class="medie${BILDER[o.id] ? ' har-bilde' : ''}">${bildeTag(o, '')}</span>
        <span class="recipe-row__copy">
          <span class="recipe-row__title">${esc(o.navn)}</span>
          <span class="meta">${meta(o)}</span>
        </span>
      </button>
      <button class="recipe-row__save"
              aria-label="${state.lagret.has(o.id) ? 'Fjern ' : 'Lagre '}${esc(o.navn)}"
              aria-pressed="${state.lagret.has(o.id)}"
              data-handling='{"h":"lagre","id":"${o.id}"}'>
        <svg width="21" height="21" viewBox="0 0 22 22" fill="none"
             stroke="currentColor" stroke-width="1.7" stroke-linecap="round"
             stroke-linejoin="round" aria-hidden="true">
          <path d="M6 4h10v14l-5-3.5L6 18z"/>
        </svg>
      </button>
    </div>`;

  // ---- Bilder ------------------------------------------------------------
  /**
   * Ett sted avgjør om en flate er ekte bilde eller plassholder. BILDER kan
   * være tom — fila skal fungere uten bildeblokken, slik at fasene kan
   * bygges og leses på en fil som fortsatt er redigerbar.
   */
  const PLASSHOLDER = '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--illo-mid)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3"/><circle cx="8.5" cy="10" r="1.5"/><path d="M4 17l5-4 4 3 3-2 4 3"/></svg>';
  const bildeTag = (o, alt) => BILDER[o.id]
    ? `<img src="${BILDER[o.id]}" alt="${alt}" decoding="async">`
    : PLASSHOLDER;
  const hero = o => `<div class="hero${BILDER[o.id] ? ' har-bilde' : ''}">
      ${bildeTag(o, `Ferdig rett: ${o.navn}`)}
      ${BILDER[o.id] ? '' : '<span class="note">Bilde kommer</span>'}</div>`;

  // ---- Ingrediensikoner --------------------------------------------------
  /**
   * Tre nivåer, og fallbacken er bygget FØRST.
   *
   * Dekningen ble målt før dette ble skrevet (OPPSKRIFTSAPPER.md §3): beste
   * enkelte ikonsamling dekker 54 % av en norsk ingrediensliste, unionen av
   * 231 samlinger 68 %. De 32 % som mangler overalt er nøyaktig den norske
   * kjernen — brunost, rømme, kesam, tyttebær, kjøttdeig. Bring! løste det
   * ved å tegne ~486 ikoner selv, og mangler fortsatt kesam.
   *
   * Derfor: ingen jakt på et sett som dekker alt. Kategoriikon der vi kjenner
   * varen, bokstavflis der vi ikke gjør det. Grensesnittet er aldri ødelagt,
   * heller ikke ved 0 % dekning, og biblioteket kan vokse gradvis.
   *
   * Tegnet for hånd i ett rutenett (24×24, strek 1,6, currentColor). Det er
   * ikke sparsommelighet: artefakten har streng CSP og er én fil, så et
   * CDN-sett er uansett utelukket — og én hånd er motmiddelet mot «style
   * creep», driften der hjørneradier og strektykkelser vandrer mellom ikoner
   * som skal høre sammen.
   */
  const IKON = {
    meieri:  '<path d="M6.5 10.5h11v9.5a1.5 1.5 0 0 1-1.5 1.5H8a1.5 1.5 0 0 1-1.5-1.5z"/><path d="M6.5 10.5L9 4.5h6l2.5 6"/><path d="M9 4.5v-2h6v2"/><path d="M12 10.5v11"/>',
    ost:     '<path d="M2.5 18.5v-6.5l9.5-6 9.5 6v6.5z"/><path d="M2.5 12h19"/><circle cx="8" cy="15.5" r="1.3"/><circle cx="15" cy="16" r="1.3"/>',
    egg:     '<path d="M12 2.5c4 0 7 5.5 7 10.5A7 7 0 0 1 5 13c0-5 3-10.5 7-10.5z"/>',
    korn:    '<path d="M12 22V8"/><path d="M12 13c-4 0-6-2.3-6-5.8 3.4 0 6 2 6 5.8z"/><path d="M12 13c4 0 6-2.3 6-5.8-3.4 0-6 2-6 5.8z"/><path d="M12 7.5c-3.1 0-4.7-1.9-4.7-4.6C10.6 2.9 12 4.8 12 7.5z"/><path d="M12 7.5c3.1 0 4.7-1.9 4.7-4.6C13.4 2.9 12 4.8 12 7.5z"/>',
    baking:  '<path d="M2.5 11.5h19a9.5 9.5 0 0 1-19 0z"/><path d="M12 11.5V4"/><path d="M12 4c0-1.5 1.5-1.5 1.5-3"/><path d="M9.5 11.5C9.5 8 10.5 6 12 6s2.5 2 2.5 5.5"/>',
    sott:    '<path d="M5 9.5h14l-1.2 10.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8z"/><path d="M5 9.5 6.5 5h11L19 9.5"/><path d="M12 13.5c1.4 1.7 2.2 3 2.2 4a2.2 2.2 0 0 1-4.4 0c0-1 .8-2.3 2.2-4z"/>',
    baer:    '<circle cx="8" cy="15.5" r="5"/><circle cx="16" cy="15.5" r="5"/><path d="M12 10.5V4.5"/><path d="M12 5c2.8-1.2 4.6-.6 5.4-3"/>',
    frukt:   '<path d="M12 7c-5 0-7.5 3.8-7.5 8 0 3.8 2.6 6.8 4.9 6.8 1.1 0 1.8-.6 2.6-.6s1.5.6 2.6.6c2.3 0 4.9-3 4.9-6.8 0-4.2-2.5-8-7.5-8z"/><path d="M12 7V3"/><path d="M12 3c2.1 0 3.4-1.4 3.4-3.4"/>',
    gronn:   '<path d="M3 21c0-9.4 6.9-16.5 18-16.5C21 14 14.1 21 3 21z"/><path d="M3 21c4.1-4.1 8.3-6.9 13.5-9.2"/>',
    nott:    '<path d="M12 2.5c4.4 2.8 7 7.2 7 11.6 0 5-3.1 8.4-7 8.4s-7-3.4-7-8.4c0-4.4 2.6-8.8 7-11.6z"/><path d="M12 8v13.5"/>',
    krydder: '<path d="M6.5 9.5h11v10a2 2 0 0 1-2 2h-7a2 2 0 0 1-2-2z"/><path d="M7.5 9.5V6a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2v3.5"/><circle cx="10.3" cy="6.3" r=".8"/><circle cx="13.7" cy="6.3" r=".8"/><circle cx="12" cy="7.8" r=".8"/><path d="M6.5 14h11"/>',
    smor:    '<path d="M2.5 12.5 7 8h12.5a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H4.5a2 2 0 0 1-2-2z"/><path d="M2.5 12.5H17a2 2 0 0 1 2 2V18"/><path d="M17 12.5 21.5 8"/>',
    fett:    '<path d="M9.5 2.5h5v3l3.2 4.6a4 4 0 0 1 .8 2.4V19a2.5 2.5 0 0 1-2.5 2.5H8a2.5 2.5 0 0 1-2.5-2.5v-6.5a4 4 0 0 1 .8-2.4L9.5 5.5z"/><path d="M5.5 14.5h13"/>',
    brod:    '<path d="M2.5 11c0-3.5 4.2-5.5 9.5-5.5s9.5 2 9.5 5.5v6.5a1.5 1.5 0 0 1-1.5 1.5H4a1.5 1.5 0 0 1-1.5-1.5z"/><path d="M8 6.5v12M16 6.5v12"/>',
    kjott:   '<path d="M20 4.5a4.7 4.7 0 0 0-7.6 5.3l-2.6 2.6a4.4 4.4 0 1 0 1.8 1.8l2.6-2.6A4.7 4.7 0 0 0 20 4.5z"/><path d="M9.4 14.6 4 20"/>',
    palegg:  '<ellipse cx="12" cy="8.5" rx="9" ry="4"/><path d="M3 8.5v3.5c0 2.2 4 4 9 4s9-1.8 9-4V8.5"/><path d="M3 15c0 2.2 4 4 9 4s9-1.8 9-4"/>',
    fisk:    '<path d="M2.5 12c3.4-4.4 7.6-6.4 11.8-6.4 4 0 6.8 2.4 8 6.4-1.2 4-4 6.4-8 6.4-4.2 0-8.4-2-11.8-6.4z"/><path d="M2.5 12 .2 7.6M2.5 12 .2 16.4"/><circle cx="17.5" cy="10.4" r="1"/>',
    potet:   '<path d="M3.5 13.5c0-5.2 3.8-8.5 8.5-8.5s8.5 3.3 8.5 8.5-3.8 8-8.5 8-8.5-2.8-8.5-8z"/><circle cx="9" cy="12" r="1"/><circle cx="14.5" cy="15" r="1"/>',
    lok:     '<path d="M12 4.5c4.4 3 7 6.6 7 11A7 7 0 0 1 5 15.5c0-4.4 2.6-8 7-11z"/><path d="M12 4.5V1"/><path d="M9 11c-1 4 0 8 3 11.5"/><path d="M15 11c1 4 0 8-3 11.5"/>',
    sopp:    '<path d="M2.5 12.5a9.5 9.5 0 0 1 19 0z"/><path d="M9 12.5v6.5a3 3 0 0 0 6 0v-6.5"/>',
    urter:   '<path d="M12 22V7"/><path d="M12 13c-4.6 0-6.6-2.6-6.6-6C8.8 7 12 9.1 12 13z"/><path d="M12 16.5c4.6 0 6.6-2.6 6.6-6-3.4 0-6.6 2.1-6.6 6z"/>',
    vaeske:  '<path d="M5 3h14l-1.9 17.2a2 2 0 0 1-2 1.8H8.9a2 2 0 0 1-2-1.8z"/><path d="M6.2 11.5h11.6"/>',
  };

  /**
   * Norsk nøkkelord → kategori. Rekkefølgen er ikke tilfeldig: mer spesifikke
   * ord står FØRST, ellers ville «havremel» truffet «mel» og «peanøttsmør»
   * truffet «smør». Første treff vinner.
   *
   * Nøkkelen er den norske varen slik den står i oppskriften. Bring! nøkler
   * på en kanonisk id og lokaliserer visningsnavnet, som er riktigere — men
   * det forutsetter en katalog vi ikke har. Her er ingrediensen fritekst, så
   * vi matcher på tekst og aksepterer at det er grovere.
   */
  const VAREKATEGORI = [
    // Meieri før alt annet — «vaniljekesam» og «gresk yoghurt» er sammensatte
    [/kesam|yoghurt|cottage|kremfløte|fløte|rømme|melk(?!ekartong)|kefir|skyr/i, 'meieri'],
    [/\bost\b|revet ost|brunost|parmesan|fetaost/i, 'ost'],
    [/\begg\b|eggehvite|eggeplomme/i, 'egg'],
    // Nøtter og frø før korn: «sesamfrø» og «solsikkefrø» er ikke mel
    [/nøtt|mandel|valnøtt|cashew|pistasj|sesam|solsikke|gresskarkjerne|chiafrø|linfrø/i, 'nott'],
    [/havregryn|havremel|\bmel\b|hvetemel|speltmel|rugmel|fullkorn|weetabix|müsli|musli|granola|couscous|\bris\b|pasta|quinoa/i, 'korn'],
    [/bakepulver|natron|tørrgjær|gjær|maisenna/i, 'baking'],
    [/sukker|sirup|honning|søtning|sukrin|kakao|syltetøy|nugatti|sjokolade/i, 'sott'],
    [/bringebær|blåbær|jordbær|bjørnebær|tyttebær|multe|\bbær\b|solbær/i, 'baer'],
    [/banan|eple|pære|mango|fersken|kiwi|appelsin|sitron|lime|avokado|ananas|drue|granateple|\bfrukt\b|kokos/i, 'frukt'],
    [/spinat|gulrot|gulrøtter|stangselleri|selleri|agurk|tomat|paprika|brokkoli|blomkål|salat|grønnsak|squash|mais|erter/i, 'gronn'],
    [/kanel|kardemomme|muskat|vanilje|ingefær|\bsalt\b|pepper|karri|spisskummen|krydder|pulverkaffe|eddik/i, 'krydder'],
    // Smør står i meierihyllen, ikke blant oljene. Egen kategori og ikke bare
    // en avdelingsregel, fordi ikonet fortsatt skal være en smørskive.
    [/smør(?!brød)|meierismør/i, 'smor'],
    [/margarin|\bolje\b|olivenolje|rapsolje|kokosolje/i, 'fett'],
    [/brødskive|knekkebrød|tortilla|lompe|\bbrød\b|bagel|pitabrød|rundstykke|wrap/i, 'brod'],
    [/skinke|spekeskinke|kalkunpålegg|kyllingpålegg|salami|\bpålegg\b|leverpostei/i, 'palegg'],
    [/kylling|kjøttdeig|karbonade|biff|svin|bacon|pølse|\bkjøtt\b/i, 'kjott'],
    [/laks|torsk|makrell|sild|reker|tunfisk|\bfisk\b/i, 'fisk'],
    [/potet/i, 'potet'],
    [/\bløk\b|rødløk|hvitløk|purre/i, 'lok'],
    [/sopp|champignon/i, 'sopp'],
    [/persille|dill|gressløk|basilikum|koriander|timian|urter|mynte/i, 'urter'],
    // «pulverkaffe» treffer krydder lenger opp — det er en smakstilsetning i
    // en oppskrift. Ren «Kaffe» er en handlevare og hører til drikke.
    [/\bvann\b|juice|saft|kaffe|\bte\b|melkefri drikke/i, 'vaeske'],
  ];

  /**
   * Bokstavflisen. Bygget først, og den er grunnen til at resten er trygt å
   * lansere: den kan ikke feile. Bring! har samme nivå, håndtegnet a–z.
   *
   * Tar første bokstav i den faktiske VAREN, ikke i mengden — «2 dl. melk»
   * skal gi M, ikke 2.
   */
  function forsteBokstav(tekst) {
    const uten = String(tekst)
      .replace(/^[\d\s.,/½¼¾]+/, '')                       // mengde
      // \b etter enheten er ikke pynt. Uten den spiser alternativet «g»
      // (gram) første bokstav i ethvert ord som begynner på g: «Grønt
      // tilbehør» ble «rønt tilbehør», og flisen viste R. Med \b krever «g»
      // at neste tegn ikke er en bokstav, så «g» i «1 g salt» treffer og
      // «G» i «Grønt» gjør det ikke.
      .replace(/^(dl|ss|ts|g|kg|stk|boks|neve|never|håndfull(er)?|cm|pk|stilk|stenger?|klype|porsjoner?)\b\.?\s*/i, '')
      .trim();
    const m = uten.match(/[a-zæøåA-ZÆØÅ]/);
    return m ? m[0].toUpperCase() : '?';
  }

  /**
   * ikonFor(tekst) → kategoriikon ?? bokstavflis.
   *
   * Nivå 2 i undersøkelsen — ~40 bestilte hero-tegninger for brunost, rømme,
   * kesam og resten av den norske kjernen — er IKKE bygget. Anslaget der er
   * NOK 15 000–40 000. Kroken finnes: legg en id-nøklet oppslag foran
   * kategorioppslaget, så faller resten på plass uten å røre kallstedene.
   */
  function ikonFor(tekst) {
    const t = String(tekst);
    for (const [m, kat] of VAREKATEGORI) {
      if (m.test(t)) {
        return `<span class="vareikon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="1.6" stroke-linecap="round"
          stroke-linejoin="round">${IKON[kat]}</svg></span>`;
      }
    }
    return `<span class="vareikon flis" aria-hidden="true">${forsteBokstav(t)}</span>`;
  }

  /**
   * Komplett lokalt prototypebibliotek. Spesifikke treff står foran brede
   * familier: «eplecidereddik» må for eksempel treffe eddik før «eple».
   * Flere tekstvarianter deler samme bilde, slik at biblioteket kan dekke
   * alle oppskriftene uten nesten-like kopier.
   */
  const INGREDIENS_OPPSLAG = [
    [/olivenolje|rapsolje|kokosolje|\bolje\b/i, 'oil'],
    [/eplecidereddik/i, 'apple-cider-vinegar'],
    [/blåbærsyltetøy|bringebærsyltetøy|jordbærsyltetøy|syltetøy/i, 'jam'],
    [/peanøttsmør/i, 'peanut-butter'],
    [/kokosmelk/i, 'coconut-milk'],
    [/cottage cheese/i, 'cottage-cheese'],
    [/linfrø.*sesamfrø.*solsikk/i, 'seed-mix'],
    [/gresskarkjerner/i, 'pumpkin-seeds'],
    [/solsikkefrø|solsikkekjerner/i, 'sunflower-seeds'],
    [/sesamfrø/i, 'sesame'],
    [/valnøtt/i, 'walnuts'],
    [/chiafrø/i, 'chia'],
    [/mørk sjokolade/i, 'dark-chocolate'],
    [/pulverkaffe|\bkaffe\b/i, 'coffee'],
    [/bringebær/i, 'raspberries'],
    [/blåbær/i, 'blueberries'],
    [/jordbær/i, 'strawberries'],
    [/fersken/i, 'peach'],
    [/mango/i, 'mango'],
    [/kiwi/i, 'kiwi'],
    [/avokado/i, 'avocado'],
    [/banan/i, 'banana'],
    [/eple\b/i, 'apple'],
    [/gulr[oø]tter?|gulrot/i, 'carrots'],
    [/stangselleri|selleri/i, 'celery'],
    [/ingefær/i, 'ginger'],
    [/spinat/i, 'spinach'],
    [/valgfrie? grønnsaker|grønt tilbehør/i, 'vegetable-mix'],
    [/valgfri topping|bær eller frukt|frukt eller .*bær/i, 'fruit-berries'],
    [/fullkornstortilla|tortilla|lomper/i, 'tortilla'],
    [/knekkebrød/i, 'crispbread'],
    [/brødskive|brødskiver/i, 'bread'],
    [/kyllingfilet/i, 'chicken'],
    [/pålegg/i, 'deli-meat'],
    [/\bost\b/i, 'cheese'],
    [/smør til steking|\bsmør\b/i, 'butter'],
    [/tørrgjær/i, 'dry-yeast'],
    [/bakepulver|natron/i, 'baking-powder'],
    [/kardemomme/i, 'cardamom'],
    [/muskat/i, 'nutmeg'],
    [/kanel/i, 'cinnamon'],
    [/honning|lønnesirup|\bsirup\b/i, 'syrup'],
    [/vaniljesukker|\bsukker\b|søtning|sukrin/i, 'sugar'],
    [/\bsalt\b/i, 'salt'],
    [/kakaopulver|\bkakao\b/i, 'cocoa'],
    [/eggehvite|\begg\b/i, 'egg'],
    [/vaniljekesam|kesam|gresk yoghurt|naturell yoghurt|vaniljeyoghurt|\byoghurt\b/i, 'yogurt'],
    [/havremel|havregryn|weetabix/i, 'oats'],
    [/fullkornsmel|hvetemel|speltmel|\bmel\b/i, 'flour'],
    [/\bmelk\b/i, 'milk'],
    [/\bvann\b/i, 'water'],
  ];

  const LOKALE_INGREDIENSBILDER = {
    oil: 'assets/ingredients/oil.png',
  };

  function ingrediensNokkel(tekst) {
    const t = String(tekst);
    let best = null;
    for (const [m, nokkel] of INGREDIENS_OPPSLAG) {
      const treff = m.exec(t);
      if (treff && (!best || treff.index < best.index)) {
        best = { index:treff.index, nokkel };
      }
    }
    return best ? best.nokkel : '';
  }

  function ingrediensKunst(tekst) {
    const nokkel = ingrediensNokkel(tekst);
    const src = INGREDIENSBILDER[nokkel] || LOKALE_INGREDIENSBILDER[nokkel];
    return src
      ? `<img src="${src}" alt="" decoding="async">`
      : ikonFor(tekst);
  }

  /**
   * Deler «1 dl. havregryn» i visningsnavn og høyrejustert mengde.
   * Parseren er bevisst konservativ: hvis starten ikke er en kjent
   * mengde/enhet, beholdes hele linjen som navn i stedet for å gjette.
   */
  function delIngrediens(tekst, faktor) {
    const skalert = skaler(tekst, faktor).trim();
    const m = /^((?:(?:\d+(?:[.,]\d+)?|\d+\s+\d+\/\d+|\d+\/\d+|en|to)\s*(?:dl|ss|ts|g|kg|stk|boks|neve|never|håndfull(?:er)?|cm|pk|stilk|stenger?|klype|porsjoner?)?\.?))\s+(.+)$/i.exec(skalert);
    if (!m) return { navn:skalert, mengde:'' };
    return { navn:m[2], mengde:m[1].replace(/\.$/, '') };
  }

  /** Kategorien alene, uten markup. Handlelisten grupperer på den. */
  function varekategori(tekst) {
    for (const [m, kat] of VAREKATEGORI) if (m.test(String(tekst))) return kat;
    return null;
  }

  /**
   * «Fyll:» og «Dyppes i:» er ikke ingredienser — de er overskrifter Maria har
   * skrevet inne i listen, og de er de eneste to linjene av 158 som ikke er en
   * vare. Uten dette får de et ingrediensikon og en avhukingsboks, og
   * handlelisten ber deg kjøpe «Fyll».
   */
  const erBolk = t => /:\s*$/.test(String(t));

  /**
   * Kategori → butikkavdeling, med Odas verifiserte norske navn.
   * Ett kart, to jobber: ikonet og hyllen kommer fra samme oppslag, så en
   * vare kan ikke få ikon uten å få avdeling.
   */
  const AVDELING = {
    frukt:'Frukt og grønt', baer:'Frukt og grønt', gronn:'Frukt og grønt',
    potet:'Frukt og grønt', lok:'Frukt og grønt', sopp:'Frukt og grønt',
    urter:'Frukt og grønt',
    brod:'Bakeri og konditori',
    meieri:'Meieri, ost og egg', ost:'Meieri, ost og egg', egg:'Meieri, ost og egg',
    palegg:'Pålegg',
    kjott:'Kylling og kjøtt',
    fisk:'Fisk og sjømat',
    korn:'Bakeingredienser', baking:'Bakeingredienser', sott:'Bakeingredienser',
    nott:'Bakeingredienser',
    smor:'Meieri, ost og egg',
    krydder:'Middager og tilbehør', fett:'Middager og tilbehør',
    vaeske:'Drikke',
  };
  /** Rekkefølgen man faktisk går gjennom en butikk i. */
  const AVDELINGSREKKE = ['Frukt og grønt', 'Bakeri og konditori', 'Meieri, ost og egg',
    'Pålegg', 'Kylling og kjøtt', 'Fisk og sjømat', 'Bakeingredienser',
    'Middager og tilbehør', 'Drikke', 'Annet'];

  const avdelingFor = t => AVDELING[varekategori(t)] || 'Annet';


  /**
   * Innstillingslisten. Rader med `vend` er brytere og navigerer ikke —
   * de vender en verdi i state.valg og tegner skjermen på nytt.
   */
  function tegnInnstillinger(node) {
    node.querySelector('[data-slot="seksjoner"]').innerHTML =
      SECTIONS.map(([title, rows]) => `
      <section class="settings-section">
      <h2 class="section-label">${title}</h2>
      <div class="list">${rows.map(([label, ikon, sub, danger, vend, ark], i) => {
        const pa = vend ? !!state.valg[vend] : false;
        const attr = vend ? `role="switch" aria-checked="${pa}" data-vend="${vend}"`
                          : `data-ark="${danger ? 'bekreft-slett-konto' : ark}"`;
        return `
        ${i ? '<div class="rule"></div>' : ''}
        <button class="row" ${attr}>
          <span class="sq">${rowSvg(ikon, danger)}</span>
          <span class="lbl">
            <span style="color:${danger ? 'var(--error)' : 'var(--text)'}">${label}</span>
            ${sub ? `<span class="meta">${sub}</span>` : ''}
          </span>
          ${vend ? `<span class="toggle" aria-hidden="true" aria-checked="${pa}"></span>` : chev}
        </button>`;
      }).join('')}
      </div></section>`).join('');
  }

  // ---- Mat ---------------------------------------------------------------
  /**
   * Skalerer mengden foran en ingrediens. Bare det FØRSTE tallet røres.
   * «en klype salt» og «Valgfritt pålegg» står uendret — halvforstått mat er
   * verre enn uskalert mat.
   */
  const BROK = { 0.25:'1/4', 0.33:'1/3', 0.5:'1/2', 0.67:'2/3', 0.75:'3/4' };
  function skaler(tekst, faktor) {
    if (faktor === 1) return tekst;
    return tekst.replace(/^(\d+)\/(\d+)|^\d+(?:[.,]\d+)?/, m => {
      let v;
      if (m.includes('/')) { const [a, b] = m.split('/'); v = (+a / +b) * faktor; }
      else v = parseFloat(m.replace(',', '.')) * faktor;
      const hel = Math.floor(v + 1e-9);
      const br  = BROK[+(v - hel).toFixed(2)];
      if (br) return hel ? `${hel} ${br}` : br;
      return String(+v.toFixed(2)).replace('.', ',');
    });
  }

  // ---- Mat ---------------------------------------------------------------
  /**
   * Måltidene brukeren filtrerer på. Notion-kategoriene (Grøt, Yoghurt, Chia …)
   * ligger fortsatt i dataene, men åtte kategorier fra en eksport er en
   * taksonomi som beskriver innholdet, ikke en som hjelper noen å velge.
   *
   * `middag` treffer null oppskrifter i dag. Chippen er likevel med, etter
   * beslutning, og møter brukeren med en ærlig tom tilstand i stedet for å
   * bli borte. Se tom-teksten i tegnListe-kallene under.
   */
  const MALTIDER = [
    ['alle',    'Alle'],
    ['frokost', 'Frokost'],
    ['lunsj',   'Lunsj'],
    ['middag',  'Middag'],
    ['snacks',  'Snacks'],
  ];

  const iMaltid = (o, m) => m === 'alle' || o.maltid === m;
  const kuratert = l => [...l].sort((a, b) => a.rekkefolge - b.rekkefolge);

  const OPPSKRIFT_SORTERING = [
    ['recommended',  'Anbefalt'],
    ['popular',      'Populært'],
    ['highestRated', 'Høyest vurdert'],
    ['newest',       'Nyeste'],
  ];

  /**
   * De fire eksplisitte capabilities app og fremtidig oppskriftsweb deler.
   * `recommended` er alltid default; de tre rangeringene krever et valg.
   * Tallene beskriver om folk likte å lage retten, aldri sunnhet.
   */
  function sorterOppskrifter(liste, nokkel = 'recommended') {
    const l = [...liste];
    if (nokkel === 'popular') {
      return l.sort((a, b) =>
        b.vurderinger - a.vurderinger || b.snitt - a.snitt || a.rekkefolge - b.rekkefolge);
    }
    if (nokkel === 'highestRated') {
      return l.sort((a, b) =>
        b.snitt - a.snitt || b.vurderinger - a.vurderinger || a.rekkefolge - b.rekkefolge);
    }
    if (nokkel === 'newest') {
      return l.sort((a, b) =>
        b.publisertDato.localeCompare(a.publisertDato) || a.rekkefolge - b.rekkefolge);
    }
    return kuratert(l);
  }

  /** Kompakt rating à la Google Reviews: fem stjerner, deretter snittet. */
  const stjerner = n => {
    const fyll = Math.round(Math.max(0, Math.min(5, Number(n))) / 5 * 100);
    return `<span class="stjerner" style="--rating-fill:${fyll}%" aria-hidden="true"></span>`;
  };

  const vurdering = (n, antall) => {
    const verdi = Number(n).toFixed(1).replace('.', ',');
    const grunnlag = antall ? `, basert på ${antall} vurderinger` : '';
    return `<span class="rating-summary" aria-label="${verdi} av 5${grunnlag}">${stjerner(n)}<strong>${verdi}</strong></span>`;
  };

  /** Metalinjen under et oppskriftsnavn. Ett sted, så den ikke driver fra hverandre. */
  const meta = o => vurdering(o.snitt, o.vurderinger);

  /**
   * Mat-hjem. Oppdagelsesflate: bilde, måltidschips, én kuratert hylle, og en
   * dør til hele listen. «Finn noe bestemt» bor på oppskriftsliste.
   */
  function tegnMat(node, p, state) {
    const m = MALTIDER.some(([v]) => v === p.maltid) ? p.maltid : 'alle';
    const utvalg = DATA.oppskrifter.filter(o => iMaltid(o, m));

    // Ukas rett er eksplisitt kuratert. Måltidsfiltrering får fortsatt sin
    // første rett som hero, men standardflaten viser alltid proteinbowlen.
    const ukasRett = DATA.oppskrifter.find(o => o.id === 'r-03');
    const topp = m === 'alle' && ukasRett ? ukasRett : kuratert(utvalg)[0];
    // Featured-flaten skjules når bolken er tom. Ingen tom medieflate.
    const heroEl = node.querySelector('[data-slot="hero"]');
    heroEl.hidden = !topp;
    heroEl.innerHTML = !topp ? '' : `
      <button class="featured-recipe" data-go="oppskrift" data-id="${topp.id}" aria-label="Åpne ${esc(topp.navn)}">
        <span class="featured-recipe__media">
          ${BILDER[topp.id]
            ? `<img src="${BILDER[topp.id]}" alt="" decoding="async">`
            : `<span class="mat-featured__fallback">${PLASSHOLDER}</span>`}
          <span class="featured-recipe__badge">${m === 'alle' ? 'Ukas rett' : MALTIDER.find(x => x[0] === m)[1]}</span>
        </span>
        <span class="mat-featured__copy">
          <span class="featured-recipe__topline"><span>${topp.kategori}</span>${vurdering(topp.snitt, topp.vurderinger)}</span>
          <span class="tit">${esc(topp.navn)}</span>
          <span class="featured-recipe__cta">Se oppskriften <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14m-5-5 5 5-5 5"/></svg></span>
        </span>
      </button>`;

    node.querySelector('[data-slot="filter"]').innerHTML = MALTIDER.map(([v, l]) =>
      `<button aria-pressed="${v === m}" data-sett='{"maltid":"${v}"}'>${l}</button>`
    ).join('');

    // Hylla hopper over heroen, ellers står samme rett to ganger rett over
    // hverandre.
    const hylle = kuratert(utvalg).filter(o => !topp || o.id !== topp.id).slice(0, 6);
    // Hele seksjonen skjules når det ikke er noe å vise. «Verdt å prøve ·
    // Middag» over en tom hylle er verre enn ingen overskrift.
    node.querySelector('[data-slot="hylleseksjon"]').hidden = !hylle.length;
    node.querySelector('[data-slot="hylletittel"]').textContent =
      m === 'alle' ? 'Verdt å prøve' : `Verdt å prøve · ${MALTIDER.find(x => x[0] === m)[1]}`;
    node.querySelector('[data-slot="hylle"]').innerHTML = hylle.map(o => `
      <button class="kort" data-go="oppskrift" data-id="${o.id}" aria-label="Åpne ${esc(o.navn)}">
        <span class="bilde">${BILDER[o.id] ? `<img src="${BILDER[o.id]}" alt="" decoding="async" loading="lazy">` : PLASSHOLDER}</span>
        <span class="recipe-card__body">
          <span class="recipe-card__category">${o.kategori}</span>
          <span class="navn">${esc(o.navn)}</span>
          <span class="meta">${vurdering(o.snitt, o.vurderinger)}</span>
        </span>
      </button>`).join('');

    // Tom tilstand for et måltid uten innhold. «Middag» er tom i dag, og det
    // er en ærlig beskjed om biblioteket — ikke en feil å skjule.
    node.querySelector('[data-slot="liste"]').innerHTML = utvalg.length ? '' : tomt({
      tittel: 'Ingen middagsoppskrifter her akkurat nå',
      tekst:  'Prøv en annen kategori eller se alle oppskrifter.',
      knapp:  { attr: `data-sett='{"maltid":"alle"}'`, tekst: 'Vis alt' },
    });

    // Relevanslinjen står her fordi hylla ER kuratert og ikke relevanssortert.
    // Uten treff å vise ville en påstand om sortering vært usann, og en usann
    // påstand om sortering er verre enn ingen påstand.
    node.querySelector('[data-slot="relevans"]').innerHTML = '';

    // «Se alle» bærer med seg måltidsvalget. Uten params droppes brukerens
    // valg i stillhet: velg Lunsj, trykk «Se alle», og listen viser alt.
    const sealle = node.querySelector('[data-slot="sealle"]');
    sealle.dataset.go = 'oppskriftsliste';
    sealle.dataset.params = JSON.stringify({ maltid: m });

    const sokeinngang = node.querySelector('[data-slot="sokeinngang"]');
    sokeinngang.dataset.go = 'oppskriftsliste';
    sokeinngang.dataset.params = JSON.stringify({ maltid: m });

    const filterknapp = node.querySelector('[data-slot="filterknapp"]');
    filterknapp.dataset.params = JSON.stringify({ maltid: m });
    filterknapp.classList.toggle('has-active-filter', m !== 'alle');
    filterknapp.setAttribute('aria-label', `Filtrer oppskrifter. Valgt: ${MALTIDER.find(x => x[0] === m)[1]}`);

    node.querySelector('[data-slot="plantall"]').textContent =
      state.plan.length ? `${state.plan.length} oppskrifter` : 'Ingen retter ennå';
  }

  /**
   * Hele listen, med søk. Mønsteret er fra OPPSKRIFTSAPPER.md §6: ett
   * søkefelt øverst, alltid samme sted, og sorteringen bak sin egen rad.
   */
  function tegnOppskriftsliste(node, p, state) {
    const m = MALTIDER.some(([v]) => v === p.maltid) ? p.maltid : 'alle';
    const q = (p.q || '').trim().toLowerCase();
    const sortering = OPPSKRIFT_SORTERING.some(([v]) => v === p.sortering)
      ? p.sortering : 'recommended';

    // Søket skriver til feltet KUN når verdien faktisk avviker. Skriver vi
    // ubetinget, flytter markøren seg til slutten ved hvert tastetrykk.
    const felt = node.querySelector('[data-slot="sok"]');
    if (felt.value !== (p.q || '')) felt.value = p.q || '';

    let liste = DATA.oppskrifter.filter(o => iMaltid(o, m));
    if (q) {
      liste = liste.filter(o =>
        o.navn.toLowerCase().includes(q) ||
        o.beskrivelse.toLowerCase().includes(q) ||
        o.ingredienser.some(t => t.toLowerCase().includes(q)) ||
        o.topping.some(t => t.toLowerCase().includes(q)));
    }
    // Treffene står i KURATERT rekkefølge, aldri sortert på treffkvalitet.
    // Et søk er et filter; en rangering på hvor godt noe matchet ville vært
    // en relevansmodell, og den skylder brukeren «Vis alt» og «Hvorfor».
    liste = sorterOppskrifter(liste, sortering);

    const maltidLabel = MALTIDER.find(([v]) => v === m)[1];
    const sorteringLabel = OPPSKRIFT_SORTERING.find(([v]) => v === sortering)[1];
    const filterknapp = node.querySelector('[data-slot="filterknapp"]');
    filterknapp.dataset.params = JSON.stringify({ maltid:m, sortering });
    filterknapp.setAttribute(
      'aria-label', `Filtrer og sorter. Valgt ${maltidLabel}, ${sorteringLabel}`);
    filterknapp.classList.toggle(
      'has-active-filter', m !== 'alle' || sortering !== 'recommended');

    node.querySelector('[data-slot="sortering"]').innerHTML = `
      <span class="meta">${q
        ? `${liste.length} treff på «${esc((p.q || '').trim())}»`
        : `${liste.length} ${liste.length === 1 ? 'oppskrift' : 'oppskrifter'}`}</span>
      <span class="meta">${maltidLabel} · ${sorteringLabel}</span>`;

    node.querySelector('[data-slot="liste"]').innerHTML = tegnListe(liste, radOppskrift, {
      merke: 'Oppskrifter',
      klasse: 'recipe-results',
      tom: q
        ? { tittel: `Ingen treff på «${esc(p.q)}»`,
            tekst:  'Prøv et annet søk eller vis hele biblioteket.',
            ikon: false,
            knapp:  {
              attr: `data-sett='{"q":"","maltid":"alle"}'`,
              tekst: 'Vis alle oppskrifter',
            } }
        : { tittel: 'Ingen oppskrifter i denne kategorien ennå',
            tekst:  'Velg en annen måltidstype for å se resten av biblioteket.',
            ikon: false,
            knapp:  { attr: `data-sett='{"maltid":"alle"}'`, tekst: 'Vis alle' } },
    });
  }

  /**
   * Kommentarer. Bygget TOVEIS fra start, etter beslutning fra Markus.
   *
   * ═══ DENNE FLATEN KAN IKKE PUBLISERES ═══
   * Ikke til App Store, og heller ikke til TestFlight for eksterne testere,
   * før tre ting finnes: moderasjonspolicy, pro-ED-deteksjon og
   * rapporteringsflyt. Det finnes NULL pro-ana/pro-ED-analyse i hele
   * styringspakken, og en kommentarflate under oppskrifter i en app for folk
   * med anstrengt matforhold er nøyaktig der den analysen trengs — tallnevning
   * av mengder, «jeg halverte alt», sammenligning av porsjoner mellom brukere.
   * Se rules.commentsRequireModerationBeforeRelease og BESLUTNINGER-VENTER.md.
   *
   * Derfor bærer hver kommentar `forfatter.rolle` og `status` fra første
   * linje, og `status: 'skjult'` virker ALLEREDE — den filtreres bort her,
   * før noen trenger den. Å skru flaten av eller moderere den er dermed en
   * konfigurasjonsendring, ikke en skjemaendring. Det er hele grunnen til at
   * det er trygt å bygge den nå.
   */
  const KOMMENTAR_SORTERING = [
    ['mostHelpful', 'Mest nyttig'],
    ['newest', 'Nyeste'],
  ];

  function sorterKommentarer(liste, nokkel = 'mostHelpful') {
    return [...liste].sort((a, b) => nokkel === 'newest'
      ? a.dagerSiden - b.dagerSiden || b.upvotes - a.upvotes
      : b.upvotes - a.upvotes || a.dagerSiden - b.dagerSiden);
  }

  function tegnKommentarer(o, state) {
    const alle = state.kommentarer[o.id] || [];
    // Statusfilteret ligger her, ikke i dataene. En skjult kommentar finnes
    // fortsatt i modellen — den vises bare ikke.
    const sortering = state.kommentarSortering[o.id] || 'mostHelpful';
    const synlige = sorterKommentarer(
      alle.filter(k => k.status === 'publisert'), sortering);

    return `
      <section class="comment-section" aria-labelledby="kommentarer-tittel">
        <div class="comment-section-head">
          <h2 class="t-card" id="kommentarer-tittel">Kommentarer</h2>
          <button class="sort-button" data-ark="sorter-kommentarer"
                  data-params='{"id":"${o.id}","sortering":"${sortering}"}'>
            ${KOMMENTAR_SORTERING.find(([v]) => v === sortering)[1]}
            <span aria-hidden="true">⌄</span>
          </button>
        </div>

        ${synlige.length ? `<div class="comment-list">${synlige.map(k => `
          <article class="comment-row">
            <div class="comment-row__top">
              <span class="comment-row__name">${esc(k.forfatter.navn)}</span>
              <span class="meta">${datotekst(k.dagerSiden)}</span>
            </div>
            ${k.rating ? `<div class="comment-row__rating">${vurdering(k.rating)}</div>` : ''}
            <p>${esc(k.tekst)}</p>
            <button class="helpful" aria-pressed="${state.kommentarUpvotes.has(`${o.id}:${k.id}`)}"
                    aria-label="${state.kommentarUpvotes.has(`${o.id}:${k.id}`)
                      ? 'Fjern nyttig-stemme' : 'Marker som nyttig'}. ${k.upvotes} stemmer"
                    data-handling='{"h":"upvote-comment","id":"${o.id}","commentId":"${k.id}"}'>
              <svg width="17" height="17" viewBox="0 0 20 20" fill="none"
                   stroke="currentColor" stroke-width="1.6" stroke-linecap="round"
                   stroke-linejoin="round" aria-hidden="true">
                <path d="M7.5 17H4.8A1.8 1.8 0 013 15.2V9.8A1.8 1.8 0 014.8 8h2.7m0 9V8l3-5c1.8.6 2.2 2.1 1.5 4h3.1a1.9 1.9 0 011.8 2.5l-1.7 5.8A2.4 2.4 0 0112.9 17H7.5z"/>
              </svg>
              <span>${k.upvotes}</span>
            </button>
          </article>`).join('')}</div>`
        : `<p class="comment-empty">Ingen kommentarer ennå. Du kan være den første.</p>`}

        <button class="btn btn-secondary" data-ark="kommenter" data-id="${o.id}">
          Skriv en kommentar
        </button>
      </section>`;
  }

  /** Detaljvisning. Skriver hver slot på hvert kall — se kommentaren over. */
  function tegnOppskrift(node, p, state) {
    const o = DATA.oppskrifter.find(x => x.id === p.id);
    // Ukjent id gir tom tilstand, ikke oppskrift nummer én. En delt lenke
    // til noe som ikke finnes skal si det, ikke vise noe annet i stillhet
    // mens adressen fortsatt påstår det opprinnelige.
    if (!o) {
      node.querySelector('[data-slot="tittel"]').textContent = 'Oppskrift';
      const lagreTom = node.querySelector('[data-slot="lagre"]');
      lagreTom.hidden = true;
      delete lagreTom.dataset.handling;
      node.querySelector('[data-slot="innhold"]').innerHTML = tomt({
        tittel: 'Denne oppskriften finnes ikke',
        tekst:  'Lenken peker på noe som ikke er her.',
        knapp:  { attr:'data-go="oppskrifter"', tekst:'Se alle oppskrifter' } });
      return;
    }
    node.querySelector('[data-slot="lagre"]').hidden = false;
    const n = Math.min(8, Math.max(1, p.porsjoner || o.porsjoner));
    const f = n / o.porsjoner;
    const del = p.del === 'metode' ? 'metode' : 'ingredienser';
    const lagret  = state.lagret.has(o.id);
    const iPlanen = state.plan.some(x => x.oppskriftId === o.id);

    const fokusTittel = node.querySelector('[data-slot="tittel"]');
    fokusTittel.textContent = 'Oppskrift';
    fokusTittel.setAttribute('aria-label', `Oppskrift: ${o.navn}`);

    const lagre = node.querySelector('[data-slot="lagre"]');
    lagre.setAttribute('aria-pressed', String(lagret));
    lagre.setAttribute('aria-label', lagret ? 'Fjern fra lagret' : 'Lagre oppskriften');
    lagre.dataset.handling = JSON.stringify({ h:'lagre', id:o.id });
    lagre.querySelector('path').setAttribute('fill', lagret ? 'var(--accent)' : 'none');

    // Relatert: samme kategori først, så resten i kuratert rekkefølge.
    //
    // IKKE relevanssortert. En sortert flate må ha «Vis alt» og «Hvorfor ser
    // du dette?», og en hylle på tre rader nederst i en detaljvisning har
    // ikke plass til begge uten å ta over skjermen. Da er det ærligere å
    // ikke sortere: dette er kuratert kontekst, ikke et anbefalingsfelt.
    const andre = DATA.oppskrifter.filter(x => x.id !== o.id);
    const rekke = l => [...l].sort((a, b) => a.rekkefolge - b.rekkefolge);
    const relatert = [
      ...rekke(andre.filter(x => x.kategori === o.kategori)),
      ...rekke(andre.filter(x => x.kategori !== o.kategori)),
    ].slice(0, 3);

    const mengder = l => `<div class="ingredient-list">${l.map(t => {
      if (erBolk(t)) return `<span class="ingredient-group">${esc(t)}</span>`;
      const v = delIngrediens(t, f);
      return `<div class="ingredient-row">
        <span class="ingredient-art">${ingrediensKunst(t)}</span>
        <span class="ingredient-name">${esc(v.navn)}</span>
        <span class="ingredient-amount">${esc(v.mengde)}</span>
      </div>`;
    }).join('')}</div>`;

    node.querySelector('[data-slot="innhold"]').innerHTML = `
      ${hero(o)}

      <div class="recipe-intro">
        <h1 class="recipe-title">${esc(o.navn)}</h1>
        <p class="ingress">${esc(o.beskrivelse)}</p>
        <div class="recipe-stats">
          ${vurdering(o.snitt, o.vurderinger)}
        </div>
      </div>

      <div class="stepper" role="group" aria-label="Antall porsjoner">
        <span class="lbl">Porsjoner</span>
        <button class="icon-btn" aria-label="Færre porsjoner"
                data-sett='{"porsjoner":${n - 1}}'${n <= 1 ? ' disabled' : ''}>&minus;</button>
        <span class="tall" aria-live="polite">${n}</span>
        <button class="icon-btn" aria-label="Flere porsjoner"
                data-sett='{"porsjoner":${n + 1}}'${n >= 8 ? ' disabled' : ''}>+</button>
      </div>

      <div class="recipe-tabs" role="tablist" aria-label="Oppskriftsinnhold">
        <button role="tab" aria-selected="${del === 'ingredienser'}"
                data-sett='{"del":"ingredienser"}'>Ingredienser</button>
        <button role="tab" aria-selected="${del === 'metode'}"
                data-sett='{"del":"metode"}'>Slik gjør du</button>
      </div>

      ${del === 'ingredienser' ? `
        <section class="recipe-main-section" aria-label="Ingredienser">
          ${mengder(o.ingredienser)}
        </section>
        ${o.topping.length ? `
        <section class="recipe-main-section" aria-labelledby="topping-tittel">
          <h2 class="t-card" id="topping-tittel">Topping</h2>
          ${mengder(o.topping)}
        </section>` : ''}`
      : `<section class="recipe-main-section" aria-label="Slik gjør du">
          <ol class="steg method-list">${o.steg.map(s =>
            `<li>${esc(String(s).replace(/^\s*\d+[.)]\s*/, ''))}</li>`).join('')}</ol>
        </section>`}

      <button class="btn ${iPlanen ? 'btn-secondary' : 'btn-primary'}"
              data-handling='{"h":"plan","id":"${o.id}"}'>
        ${iPlanen ? 'Ligger i matplanen · Fjern' : 'Legg i matplanen'}
      </button>

      ${tegnKommentarer(o, state)}

      ${relatert.length ? `
      <div class="stack" style="gap:12px">
        <h2 class="t-card">Flere som denne</h2>
        ${tegnListe(relatert, radOppskrift, {
          merke:'Relaterte oppskrifter', klasse:'recipe-results'
        })}
      </div>` : ''}

      <div class="spacer" style="height:8px"></div>`;
  }

  /**
   * Standardplanen. ÉN kuratert plan, lik for alle, som brukeren bytter ut
   * rader i selv.
   *
   * Dette utløser IKKE ny produktklassifisering. Det som krevde ny Port 1 var
   * formuleringen «styrer måltider individuelt». En fast plan alle får er
   * kuratert innhold, i samme kategori som modulene.
   *
   * ═══ GRENSEN GÅR VED OM PLANEN ER DEN SAMME FOR ALLE ═══
   * Den dagen planen komponeres ut fra profil, historikk eller preferanser,
   * er det individuell styring av måltider, og da gjelder Ny Port 1, DPIA og
   * regulatorisk intended-purpose-vurdering igjen. Se BESLUTNINGER-VENTER.md.
   *
   * Planen er fortsatt en liste. Den godkjente ukestripen velger eller
   * grupperer listen; den introduserer ikke tomme kalenderceller.
   */
  const STANDARDPLAN = ['r-10', 'r-03', 'r-04', 'r-14', 'r-24'];

  /**
   * Faste varer. DYTTER inn i listen, trekker aldri fra.
   *
   * Plan to Eat bygde et spiskammer, drepte det, og skrev post-mortem:
   * «Removing items from someone's shopping list without them knowing about
   * it is never a good idea.» Erstatningen deres er en liste du kopierer FRA.
   *
   * Retningen på pilen er hele poenget. Dytting er reversibel — ser du salt i
   * listen og har det, hekter du av. Subtraksjon er det ikke: en vare som
   * aldri dukket opp, kan du ikke oppdage at mangler før du står på kjøkkenet.
   *
   * Bare navn. Ingen datoer, ingen antall, ingen beholdning. Et spiskammer med
   * utløpsdatoer er et overvåkningssystem rettet mot matinntak — ikke vekt
   * eller kalorier, men samme psykologi: appen fører regnskap over maten din.
   */
  const FASTE_VARER = ['Salt', 'Olje', 'Smør', 'Mel', 'Bakepulver', 'Kaffe'];

  const planRader = state => state.plan
    .map(x => DATA.oppskrifter.find(o => o.id === x.oppskriftId))
    .filter(Boolean);

  const planOppforinger = state => state.plan
    .map(x => {
      const oppskrift = DATA.oppskrifter.find(o => o.id === x.oppskriftId);
      return oppskrift ? { ...x, dag:Number.isInteger(x.dag) ? x.dag : 0, oppskrift } : null;
    })
    .filter(Boolean);

  function plandager() {
    return Array.from({ length:5 }, (_, i) => {
      const dato = new Date();
      dato.setHours(12, 0, 0, 0);
      dato.setDate(dato.getDate() + i);
      const kort = new Intl.DateTimeFormat('nb-NO', { weekday:'short' })
        .format(dato).replace('.', '');
      const lang = new Intl.DateTimeFormat('nb-NO', { weekday:'long', day:'numeric', month:'long' })
        .format(dato);
      return { i, kort:kort.charAt(0).toUpperCase() + kort.slice(1), dato:dato.getDate(), lang };
    });
  }

  /**
   * Måltidsplanen. En LISTE, aldri et rutenett av dager. Det finnes ingen
   * tomme dagceller å tegne fordi tomme dager ikke finnes i modellen.
   *
   * Handlelisten ligger nå HER, som en seksjon under planen, i stedet for som
   * en egen rad på Mat-hjem. Den hører hjemme der ingrediensene kommer fra.
   */
  function tegnMaltidsplan(node, p, state) {
    const oppforinger = planOppforinger(state);
    const dager = plandager();
    const valgtDag = Math.max(0, Math.min(4, Number(p.dag) || 0));
    const visning = p.visning === 'uke' ? 'uke' : 'dag';
    const dagstripe = `
      <div class="week-strip" role="group" aria-label="Velg dag">
        ${dager.map(d => `
          <button class="week-day" aria-pressed="${d.i === valgtDag}"
                  data-sett='{"dag":${d.i}}'>
            <span>${d.kort}</span><strong>${d.dato}</strong>
          </button>`).join('')}
      </div>`;
    const visningsvalg = `
      <div class="meal-view-toggle" role="group" aria-label="Vis planen per dag eller uke">
        <button aria-pressed="${visning === 'dag'}" data-sett='{"visning":"dag"}'>Dag</button>
        <button aria-pressed="${visning === 'uke'}" data-sett='{"visning":"uke"}'>Uke</button>
      </div>`;
    const rad = ({ oppskrift:o }) => `
      <div class="planrad">
        <button class="row row-media" data-go="oppskrift" data-id="${o.id}">
          <span class="medie${BILDER[o.id] ? ' har-bilde' : ''}">${bildeTag(o, '')}</span>
          <span class="lbl">
            <span>${o.navn}</span>
            <span class="meta">${o.maltid[0].toUpperCase() + o.maltid.slice(1)}</span>
          </span>
          ${chev}
        </button>
        <button class="link byttut" data-ark="bytt-ut" data-id="${o.id}">Bytt ut</button>
      </div>`;
    const aktiveDager = visning === 'uke'
      ? dager.map(d => ({ ...d, rader:oppforinger.filter(x => x.dag === d.i) }))
          .filter(d => d.rader.length)
      : [{ ...dager[valgtDag], rader:oppforinger.filter(x => x.dag === valgtDag) }];
    const agenda = aktiveDager.map(d => `
      <section class="plan-day">
        <h2 class="plan-day__heading">${d.lang}</h2>
        ${d.rader.length
          ? `<div class="list">${d.rader.map(rad).join('<div class="rule"></div>')}</div>`
          : `<div class="empty" style="padding:24px 0">
               <strong>Ingen retter denne dagen</strong>
               <p>Legg til en oppskrift fra Mat når du har lyst.</p>
             </div>`}
      </section>`).join('');
    const preview = ['r-03','r-04','r-14']
      .map(id => DATA.oppskrifter.find(o => o.id === id)).filter(Boolean);

    node.querySelector('[data-slot="innhold"]').innerHTML = `
      <div class="meal-plan-intro">
        <h1 class="sr">Måltidsplanen min</h1>
        <p>En enkel oversikt du kan endre når som helst.</p>
      </div>
      ${dagstripe}
      ${visningsvalg}

      ${oppforinger.length ? `
        <div class="plan-agenda">${agenda}</div>
        <button class="btn btn-secondary" data-ark="bekreft-tom-plan">Tøm planen</button>` : ''}

      ${oppforinger.length ? '' : `
        ${tomt({ tittel: 'Planen er tom',
                 tekst:  'Start med et rolig forslag, eller legg til én rett fra Mat.',
                 knapp:  { attr:'data-handling=\'{"h":"standardplan"}\'', tekst:'Bruk forslag' } })}
        <div class="plan-preview" aria-hidden="true">
          ${preview.map(o => BILDER[o.id] ? `<img src="${BILDER[o.id]}" alt="">` : '').join('')}
        </div>`}

      ${tegnHandleliste(state)}

      <div class="spacer" style="height:8px"></div>`;
  }

  /**
   * Handlelisten, som seksjon i måltidsplanen.
   *
   * Gruppert på BUTIKKAVDELING, med Odas verifiserte norske navn. Det er
   * standardvalget i Paprika og forventet av alle som har handlet.
   *
   * Men mengdene slås ALDRI sammen. «2 dl havregryn» fra to oppskrifter kan
   * ikke summeres når mengden er fritekst, og et feil sammenslått tall er
   * verre enn to ærlige linjer. Kildeoppskriften står som metalinje i stedet,
   * så to like linjer er til å forstå.
   */
  function tegnHandleliste(state) {
    const rader = planRader(state);
    if (!rader.length) return '';

    // Varer fra planen, pluss faste varer som DYTTES inn. De faste kommer
    // ferdig avhuket — de er der for å bli sett, ikke for å bli kjøpt.
    const varer = [];
    for (const o of rader) {
      for (const t of [...o.ingredienser, ...o.topping]) {
        if (erBolk(t)) continue;                   // «Fyll:» er ikke en vare
        varer.push({ tekst: t, fra: o.navn, fast: false });
      }
    }
    for (const t of FASTE_VARER) varer.push({ tekst: t, fra: 'Fast vare', fast: true });

    const grupper = {};
    for (const v of varer) (grupper[avdelingFor(v.tekst)] ||= []).push(v);

    const seksjoner = AVDELINGSREKKE.filter(a => grupper[a]).map(a => `
      <div class="stack" style="gap:8px">
        <span class="kicker">${a}</span>
        <div class="list">${grupper[a].map((v, i) => {
          const nokkel = v.fra + '|' + v.tekst;
          // Faste varer starter avhuket. Alt annet starter uhuket.
          const av = state.harHjemme.has(nokkel) || (v.fast && !state.harHjemme.has('!' + nokkel));
          return `
          ${i ? '<div class="rule"></div>' : ''}
          <button class="row vare handlerad" role="checkbox" aria-checked="${av}"
                  data-handling='${JSON.stringify({ h:'har-hjemme', k:nokkel, fast:v.fast })}'>
            <span class="ingredient-art">${ingrediensKunst(v.tekst)}</span>
            <span class="lbl">
              <span${av ? ' class="avhuket"' : ''}>${v.tekst}</span>
              <span class="meta">${v.fra}</span>
            </span>
            <span class="hake${av ? ' pa' : ''}" aria-hidden="true">${av ? HAKE : ''}</span>
          </button>`;
        }).join('')}</div>
      </div>`).join('');

    return `
      <div class="stack" style="gap:16px">
        <h2 class="t-card">Handleliste</h2>
        <p class="meta">Gruppert etter hvor varene står i butikken. Mengdene står
          som i oppskriften — ingenting er slått sammen eller regnet om.</p>
        ${seksjoner}
        <span class="meta">Faste varer er lagt til og ferdig avhuket. De trekkes
          aldri fra listen i stillhet — du hekter av det du har.</span>
      </div>`;
  }

  // ---- Onboarding · profil og personlig plan ----------------------------
  const ONBOARDING_STEG = {
    navn:{nr:1,over:'Hei der',tittel:'Hva skal vi kalle deg?',tekst:'Vi bruker navnet for å gjøre opplevelsen litt mer personlig.',felt:true,neste:'onboarding-hverdag'},
    hverdag:{nr:2,over:'Hverdagen din',tittel:'Hvem lager du vanligvis mat til?',tekst:'Velg det som passer best akkurat nå.',neste:'onboarding-mal',valg:['Bare meg','Meg og én annen','Familien eller flere hjemme','Det varierer fra uke til uke'],valgt:[2]},
    mal:{nr:3,over:'Det du ønsker',tittel:'Hva vil du ha hjelp med?',tekst:'Velg ett hovedmål og opptil to ting til. Du kan endre dem senere.',neste:'onboarding-barrierer',flere:true,valg:['Få mer matglede','Spise mer variert','Få bedre rutiner','Bli tryggere på kjøkkenet','Forstå sult og metthet','Spise godt med lite tid'],valgt:[1,2,3]},
    barrierer:{nr:4,over:'Det som står i veien',tittel:'Hva gjør mat vanskelig i dag?',tekst:'Vi tilpasser oppgavene – vi vurderer ikke innsatsen din.',neste:'onboarding-generering',flere:true,valg:['Jeg mangler tid','Jeg går tom for ideer','Jeg tviler på egne ferdigheter','Vi har mange ulike ønsker hjemme','Matbudsjettet er stramt','Jeg mister rytmen','Kresenhet gjør måltider krevende','Noe annet'],valgt:[0,1],hopp:'Svar senere',knapp:'Lag planen min'}
  };
  const ONBOARDING_REKKE = ['navn','hverdag','mal','barrierer'];

  function tegnOnboardingSteg(node, p) {
    const steg = ONBOARDING_STEG[p.steg];
    if (!steg) return;
    const forrige = steg.nr === 1 ? 'onboarding' : `onboarding-${ONBOARDING_REKKE[steg.nr - 2]}`;
    const valg = (steg.valg || []).map((tekst, i) =>
      `<button class="onboarding-option" aria-pressed="${(steg.valgt || []).includes(i)}" data-onboarding-choice data-multi="${!!steg.flere}">${tekst}</button>`).join('');
    node.querySelector('[data-slot="innhold"]').innerHTML = `
      <div class="onboarding-progress"><div class="onboarding-progress__top">
        <button class="onboarding-progress__back" data-go="${forrige}" aria-label="Tilbake"><svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13 5l-6 6 6 6"/></svg></button>
        <span class="meta">Steg ${steg.nr} av 4</span></div>
        <div class="bar" role="progressbar" aria-label="Onboarding" aria-valuemin="1" aria-valuemax="4" aria-valuenow="${steg.nr}"><i style="width:${steg.nr / 4 * 100}%"></i></div></div>
      <div class="onboarding-copy"><span class="meta">${steg.over}</span><h1 class="t-screen" tabindex="-1" data-focus>${steg.tittel}</h1><p>${steg.tekst}</p></div>
      ${steg.felt ? `<div class="formrow"><label class="label" for="onboarding-navn">Fornavn eller det du vil bli kalt</label><input class="input" id="onboarding-navn" value="Ingrid" maxlength="40" autocomplete="name"></div>` : ''}
      ${valg ? `<div class="onboarding-options" role="group" aria-label="${steg.tittel}">${valg}</div>` : ''}
      ${steg.sikkerhet ? `<div class="onboarding-safety"><p>${steg.sikkerhet}</p></div>` : ''}
      <div class="spacer" style="height:8px"></div>`;
    node.querySelector('[data-slot="dock"]').innerHTML = `<button class="btn btn-primary" data-go="${steg.neste}">${steg.knapp || 'Fortsett'}</button>${steg.hopp ? `<button class="link" data-go="${steg.neste}">${steg.hopp}</button>` : `<button class="link" data-go="${forrige}">Tilbake</button>`}`;
  }

  function tegnOnboardingGenerering(node) {
    node.querySelector('[data-slot="innhold"]').innerHTML = `<div class="onboarding-generating"><div class="onboarding-generating__mark" aria-hidden="true"><svg width="68" height="68" viewBox="0 0 68 68"><path d="M15 42c9-20 25-25 40-27-1 20-9 35-29 37" fill="var(--illo-light)"/><path d="M19 50c8-14 18-22 32-29" fill="none" stroke="var(--primary)" stroke-width="4" stroke-linecap="round"/><circle cx="18" cy="50" r="5" fill="var(--illo-warm)"/></svg></div><div class="onboarding-copy"><span class="meta">Setter sammen planen din</span><h1 class="t-screen" tabindex="-1" data-focus>Vi finner en god start, Ingrid.</h1><p>Svarene dine blir til en rolig første uke.</p></div></div>`;
    node.querySelector('[data-slot="dock"]').innerHTML = `<button class="btn btn-primary" data-go="onboarding-klar">Se planen min</button><button class="link" data-go="onboarding-barrierer">Se gjennom svarene</button>`;
  }

  function tegnOnboardingKlar(node) {
    node.querySelector('[data-slot="innhold"]').innerHTML = `<div class="onboarding-copy"><span class="meta">Planen er klar</span><h1 class="t-screen" tabindex="-1" data-focus>Ingrid, her er en rolig start.</h1><p>Du kan endre planen når hverdagen endrer seg.</p></div><div class="plan-ready"><div class="plan-ready__hero"><span class="meta">Ukas lille mål</span><h2 class="t-card">Lag to middager du gleder deg til</h2></div><div class="plan-ready__item"><span class="plan-ready__number">1</span><div><strong>Små valg som gir mer variasjon</strong><p>Første modul · 10–15 min</p></div></div><div class="plan-ready__item"><span class="plan-ready__number">2</span><div><strong>Grønn proteinbowl</strong><p>Forslag til en enkel hverdagsmiddag</p></div></div><div class="plan-ready__item"><span class="plan-ready__number">3</span><div><strong>Tre korte aktiviteter</strong><p>Fordelt utover den første uken</p></div></div></div>`;
    node.querySelector('[data-slot="dock"]').innerHTML = `<button class="btn btn-primary" data-go="hjem">Gå til Hjem</button><button class="link" data-go="onboarding-barrierer">Juster planen</button>`;
  }

  // ---- Profil ------------------------------------------------------------
  /**
   * Interessene. Samme skjerm i onboarding og som redigering fra Meg —
   * forskjellen er hva knappene i bunnen sier, og det er en param.
   *
   * Ingenting her er obligatorisk. Null valgte interesser er en gyldig
   * tilstand som slår relevanssorteringen av, ikke en feil å rette opp.
   */
  function tegnInteresser(node, p, state) {
    const valgte = state.profil.interesser;

    node.querySelector('[data-slot="chips"]').innerHTML = DATA.interesser.map(i =>
      `<button class="chip" aria-pressed="${valgte.has(i.id)}"
               data-handling='{"h":"interesse","id":"${i.id}"}'>${i.label}</button>`).join('');

    node.querySelector('[data-slot="antall"]').textContent = valgte.size
      ? `${valgte.size} valgt`
      : 'Ingen interesser valgt';

    // Onboarding går videre; redigering går tilbake. «Hopp over» er en
    // fullverdig knapp, ikke en grå lenke i hjørnet.
    node.querySelector('[data-slot="dock"]').innerHTML = p.fra === 'onboarding'
      ? `<button class="btn btn-primary" data-go="moduler">Lagre og fortsett</button>
         <button class="link" style="align-self:center" data-go="moduler">Hopp over</button>`
      : `<button class="btn btn-primary" data-back>Ferdig</button>`;
  }

  /**
   * Navneskjemaet. Feltet er DOM-tilstand, så renderen setter verdien og
   * lagringen leser den tilbake. Ingen validering: et tomt felt beholder
   * forrige navn i stedet for å bli en feil brukeren må rette.
   */
  function tegnProfilNavn(node, p, state) {
    node.querySelector('[data-slot="navn"]').value = state.profil.navn || '';
    node.querySelector('[data-slot="lagre"]').dataset.handling =
      JSON.stringify({ h:'lagre-navn' });
  }

  /** Profilhuben. Ingen alder, ingen demografi, ingen biologisk kjønn. */
  function tegnKonto(node, p, state) {
    const valgte = valgteEtiketter();
    const forbokstav = (state.profil.navn || '?').trim().charAt(0).toUpperCase();

    node.querySelector('[data-slot="innhold"]').innerHTML = `
      <div class="profile-hero">
        <div class="avatar" aria-hidden="true">${forbokstav}</div>
        <div class="profile-copy">
          <span style="font-family:var(--font-display);font-size:var(--fs-section-title);
                       font-weight:600;letter-spacing:var(--tracking-display)">${esc(state.profil.navn)}</span>
          <span class="meta">${esc(state.profil.epost)}</span>
        </div>
      </div>

      <div class="settings-section">
      <span class="section-label">Profil</span>
      <div class="list">
        <button class="row" data-go="profil-navn">
          <span class="lbl"><span>Navn</span><span class="meta">${esc(state.profil.navn)}</span></span>${chev}
        </button>
        <div class="rule"></div>
        <button class="row" data-go="interesser">
          <span class="lbl"><span>Interesser</span>
            <span class="meta">${valgte.length ? valgte.join(' · ') : 'Ingenting valgt'}</span></span>${chev}
        </button>
      </div></div>

      <div class="settings-section">
      <span class="section-label">Konto</span>
      <div class="list">
        <button class="row" data-go="innstillinger">
          <span class="lbl"><span>Innstillinger</span>
            <span class="meta">Varsler, undertekster, personvern</span></span>${chev}
        </button>
        <div class="rule"></div>
        <button class="row" data-ark="bekreft-slett-konto">
          <span class="lbl"><span style="color:var(--error)">Slett kontoen min</span></span>${chev}
        </button>
      </div></div>
      <div class="spacer" style="height:8px"></div>`;
  }

  // ---- Hjem --------------------------------------------------------------
  function tegnHjem(node, p, state) {
    node.querySelector('[data-slot="hilsen"]').textContent = `Hei, ${state.profil.navn}`;
    node.querySelector('[data-slot="ukesmaal"]').textContent =
      'Denne uka: løsne på én matregel.';
  }

  // ---- Meg ---------------------------------------------------------------
  const MND = ['januar','februar','mars','april','mai','juni',
               'juli','august','september','oktober','november','desember'];

  /** «for 2 dager siden» er mer lesbart enn en dato, og mindre som en logg. */
  function datotekst(dagerSiden) {
    if (dagerSiden === 0) return 'I dag';
    if (dagerSiden === 1) return 'I går';
    if (dagerSiden < 7)   return `For ${dagerSiden} dager siden`;
    const d = new Date(); d.setDate(d.getDate() - dagerSiden);
    return `${d.getDate()}. ${MND[d.getMonth()]}`;
  }
  const maaned = dagerSiden => {
    const d = new Date(); d.setDate(d.getDate() - dagerSiden);
    return `${MND[d.getMonth()]} ${d.getFullYear()}`;
  };

  /**
   * Dagens dato, skrevet ut.
   *
   * Bruker Intl med ÉN dato i stedet for en ukedagsliste. Det er ikke
   * stilpreferanse: regelsjekken slo ut på en `DAGER`-array, og den hadde
   * rett i å gjøre det. En liste over ukedagene er nøyaktig det man trenger
   * for å bygge et ukesrutenett, og appen skal ikke ha den byggeklossen
   * liggende. En formatterer som tar én dato kan ikke enumerere en uke.
   */
  function idagTekst() {
    const d = new Date();
    const dag = new Intl.DateTimeFormat('nb-NO', { weekday: 'long' }).format(d);
    return `${dag} ${d.getDate()}. ${MND[d.getMonth()]}`;
  }

  /**
   * Meg. Brukerens egen flate, ikke en innstillingsside.
   *
   * Rekkefølgen er valgt: hilsen, SKRIV, tilbakeblikk, lagret, profil, hjelp.
   * «Skriv et notat» er primærhandlingen og ligger øverst — den lå tidligere
   * som en rad langt nede, bak «Notatene mine», altså to trykk unna det
   * flaten faktisk er til for.
   *
   * Innstillinger er flyttet til tannhjulet i toppen. Selve skjermen er
   * uendret; det er bare inngangen som er ute av veien.
   */
  function tegnMeg(node, p, state) {
    const navn = (state.profil.navn || '').trim();

    node.querySelector('[data-slot="hilsen"]').textContent = navn ? `Hei, ${navn}` : 'Hei';
    node.querySelector('[data-slot="dato"]').textContent = idagTekst();

    // To raske handlinger: skriv selv eller fortsett læringen.
    node.querySelector('[data-slot="skriv"]').innerHTML = `
      <div class="quick-actions">
        <button class="skrivkort" data-go="notat-opptak">
          <span class="sq"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="var(--on-primary)" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13 3.2l3.8 3.8-9 9-5 1.2 1.2-5z"/></svg></span>
          <span class="lbl">
            <span class="tit">Skriv et notat</span>
            <span class="sub">Ditt eget rom</span>
          </span>
        </button>
        <button class="skrivkort quick-secondary" data-go="video">
          <span class="sq"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="var(--primary-pressed)" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="10" cy="10" r="7"/><path d="M8.2 6.8l5 3.2-5 3.2z"/></svg></span>
          <span class="lbl">
            <span class="tit">Fortsett modul</span>
            <span class="sub">Matstøy</span>
          </span>
        </button>
      </div>`;

    /**
     * Tilbakeblikket rett på flaten, ikke bak en rad.
     *
     * Kun de tre siste, og ingen forhåndsvisning av selve teksten — bare
     * tittelen. Det er A2-avveiningen fra komponentgjennomgangen: gjentatt
     * gjennomlesing av egne refleksjoner er en kjent gruble-vei, og en liste
     * med full tekst på forsiden av Meg gjør den kortere enn den bør være.
     * Hele historikken finnes fortsatt, ett trykk unna.
     */
    const siste = [...state.notater].sort((a, b) => a.dagerSiden - b.dagerSiden).slice(0, 3);
    node.querySelector('[data-slot="tilbakeblikk"]').innerHTML = `
      <div class="stack" style="gap:12px">
        <div class="seksjonshode">
          <h2 class="t-card">Tilbakeblikk</h2>
          ${state.notater.length ? '<button class="link" data-go="tilbakeblikk">Se alt</button>' : ''}
        </div>
        ${siste.length ? `<div class="list">${siste.map((n, i) => `
          ${i ? '<div class="rule"></div>' : ''}
          <button class="row" data-go="notat" data-id="${n.id}">
            <span class="sq">${rowSvg('refleksjon', false)}</span>
            <span class="lbl"><span>${esc(n.tittel)}</span>
              <span class="meta">${n.type === 'refleksjon' ? 'Refleksjon' : 'Notat'} · ${datotekst(n.dagerSiden)}</span></span>
            ${chev}
          </button>`).join('')}
          <div class="rule"></div>
          <button class="row" data-go="notater">
            <span class="sq">${rowSvg('refleksjon', false)}</span>
            <span class="lbl"><span>Alle notatene mine</span>
              <span class="meta">${state.notater.length} ${state.notater.length === 1 ? 'oppføring' : 'oppføringer'} · Kun på denne telefonen</span></span>
            ${chev}
          </button></div>`
        : tomt({ tittel: 'Ingenting skrevet ennå',
                 tekst:  'Det du skriver havner her, og forlater aldri telefonen.' })}
      </div>`;

    // Lagrede oppskrifter MED bilder — det var poenget med å flytte dem hit.
    const lagret = [...state.lagret]
      .map(id => DATA.oppskrifter.find(o => o.id === id)).filter(Boolean);
    node.querySelector('[data-slot="lagret"]').innerHTML = `
      <div class="stack" style="gap:12px">
        <h2 class="t-card">Lagrede oppskrifter</h2>
        ${lagret.length
          ? `<div class="hylle">${lagret.map(o => `
              <button class="kort" data-go="oppskrift" data-id="${o.id}">
                <span class="bilde">${BILDER[o.id] ? `<img src="${BILDER[o.id]}" alt="" decoding="async">` : PLASSHOLDER}</span>
                <span class="navn">${o.navn}</span>
              </button>`).join('')}</div>`
          : `<span class="meta">Trykk bokmerket på en oppskrift, så ligger den her.</span>`}
      </div>`;

    // Diskret inngang til profilen. En rad, ikke en avatar som tar toppen.
    node.querySelector('[data-slot="profil"]').innerHTML = `
      <div class="list">
        <button class="row" data-go="konto">
          <span class="sq"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="var(--accent)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="10" cy="7.5" r="3.2"/><path d="M4 16.5c1.4-2.7 3.6-4 6-4s4.6 1.3 6 4"/></svg></span>
          <span class="lbl"><span>Profilen min</span>
            <span class="meta">${esc(state.profil.epost)}</span></span>${chev}
        </button>
        <div class="rule"></div>
        <button class="row" data-go="interesser">
          <span class="sq"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="var(--accent)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 3l2.1 4.3 4.7.7-3.4 3.3.8 4.7-4.2-2.2-4.2 2.2.8-4.7L3.2 8l4.7-.7z"/></svg></span>
          <span class="lbl"><span>Interessene mine</span>
            <span class="meta">${state.profil.interesser.size ? `${state.profil.interesser.size} valgt` : 'Ingen valgt'}</span></span>${chev}
        </button>
      </div>`;

    // Hjelp ligger FAST nederst, alltid samme sted. Se kommentaren på
    // s-hjelp for hvorfor den aldri er kontekstuell.
    node.querySelector('[data-slot="hjelp"]').innerHTML = `
      <button class="hjelpkort" data-go="hjelp">
        <span class="tit">Hvis tankene om mat tar for stor plass</span>
        <span class="sub">Florir er et læringsprogram, ikke behandling. Her er hvem du kan snakke med.</span>
      </button>`;
  }

  /**
   * Hjelp. To veier, presentert rolig.
   *
   * Formuleringene er hentet fra ROS og Helsenorge, ikke oppfunnet.
   * «Tar for stor plass» er gradvis, ikke binær — den treffer matstøy direkte
   * og krever ingen selv-etikett. «Har du en spiseforstyrrelse?» tvinger fram
   * en merkelapp de fleste avviser, og da hoppes lenken over.
   * Pårørende nevnes i samme setning, så man kan klikke «for en venn».
   *
   * ÅPNINGSTIDER ER IKKE HARDKODET, og det er en bevisst utelatelse. Tre ulike
   * sett ble funnet i kildene, og ROS endrer tider mellom sesonger. Et feil
   * klokkeslett sender noen til en stengt linje i et sårbart øyeblikk — det er
   * verre enn ingen tid.
   *
   * ═══ KAN IKKE PUBLISERES UTEN AVTALE ═══
   * Vi bruker ROS' navn og telefonnummer uten avtale med dem. Det er greit i
   * en intern demo. Det kan ikke gå i TestFlight til eksterne testere eller i
   * App Store før avtalen finnes. Se BESLUTNINGER-VENTER.md.
   */
  function tegnHjelp(node, p, state) {
    node.querySelector('[data-slot="innhold"]').innerHTML = `
      <div class="stack" style="gap:8px">
        <h1 class="t-screen">Hvis tankene om mat tar for stor plass</h1>
        <p>Florir er et læringsprogram, ikke behandling. Kjenner du at forholdet
           til mat og kropp har blitt vanskelig, kan du snakke med noen som kan dette.</p>
      </div>

      <div class="support-feature">
        <span class="section-label">Rådgivning</span>
        <span class="t-card" style="font-family:var(--font-display);font-weight:600;
              letter-spacing:var(--tracking-display)">ROS — Rådgivning om spiseforstyrrelser</span>
        <p>Gratis, og du kan være anonym. De er der for alle som strever med mat
           og kropp — og for pårørende.</p>
        <div class="hjelpknapper">
          <a class="btn btn-primary" href="tel:94817818">Ring 948 17 818</a>
          <a class="btn btn-secondary" href="https://nettros.no" target="_blank" rel="noopener">nettros.no</a>
        </div>
        <span class="meta">Se åpningstider på nettros.no.
          De varierer mellom regionskontorene.</span>
      </div>

      <!-- REKKEFØLGEN ER IKKE TILFELDIG.
           Mental Helse sto tidligere som 13px grå tekst UNDER vårt eget betalte
           tilbud, og nummeret var ikke trykkbart. Uansett hva vi mente, sa
           hierarkiet at konsultasjonen vår rangeres over den nasjonale
           døgnlinja. Nå kommer all hjelp utenfra først, som trykkbare rader,
           og vårt eget tilbud etterpå. -->
      <div class="list">
        <a class="row" href="tel:116123">
          <span class="sq"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="var(--accent)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4.5 4h3l1.5 3.5-2 1.5a9 9 0 0 0 4 4l1.5-2L16 12.5v3a1.5 1.5 0 0 1-1.5 1.5A11 11 0 0 1 3 5.5A1.5 1.5 0 0 1 4.5 4z"/></svg></span>
          <span class="lbl"><span>Mental Helse · 116 123</span>
            <span class="meta">Hele døgnet, om hva som helst</span></span>${chev}
        </a>
      </div>

      <div class="spacer" style="height:8px"></div>`;
  }

  /**
   * Tilbakeblikket. Signaturen er poenget: den får `state`, aldri en fra- og
   * til-dato. En renderer som ikke kan enumerere dager, kan ikke tegne tomme
   * dager — det er sterkere enn en regel i et dokument.
   *
   * Ingen tellere, ingen prikk-per-dag, ingen månedsoppsummering, ingen
   * framovervisning. Ordet «kalender» brukes ikke i grensesnittet.
   */
  const TB_FILTER = [['alle','Alle'],['notat','Notater'],['refleksjon','Refleksjoner'],['lagret','Lagret']];

  function tegnTilbakeblikk(node, p, state) {
    const filter = p.filter || 'alle';
    const filterLabel = TB_FILTER.find(([v]) => v === filter)?.[1] || 'Alle';

    // Oppføringer, ikke dager. Lagrede oppskrifter får dagerSiden fra sin
    // plass i settet — vi vet ikke når de faktisk ble lagret, og later ikke
    // som om vi gjør det.
    const oppforinger = [
      ...state.notater.map(n => ({
        id:n.id, type:n.type, dagerSiden:n.dagerSiden,
        tittel:n.tittel, rute:'notat',
      })),
      ...[...state.lagret].map((id, i) => {
        const o = DATA.oppskrifter.find(x => x.id === id);
        return o ? { id:o.id, type:'lagret', dagerSiden:i, tittel:o.navn, rute:'oppskrift' } : null;
      }).filter(Boolean),
    ].filter(e => filter === 'alle' || e.type === filter)
     .sort((a, b) => a.dagerSiden - b.dagerSiden);

    node.querySelector('[data-slot="filter"]').innerHTML = `
      <div class="timeline-toolbar">
        <span class="meta">Nyeste først</span>
        <button class="timeline-filter" data-ark="tilbakeblikk-filter"
                data-params='{"filter":"${filter}"}'>
          ${filterLabel}
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"
               stroke="currentColor" stroke-width="1.7" stroke-linecap="round"
               stroke-linejoin="round" aria-hidden="true"><path d="M4 6.5l5 5 5-5"/></svg>
        </button>
      </div>`;

    // Grupper per måned. Måneder uten oppføringer finnes ikke som overskrift,
    // på samme måte som dager uten innhold ikke finnes som rader.
    const grupper = [];
    for (const e of oppforinger) {
      const m = maaned(e.dagerSiden);
      const siste = grupper[grupper.length - 1];
      if (siste && siste.mnd === m) siste.rader.push(e);
      else grupper.push({ mnd:m, rader:[e] });
    }

    const ETIKETT = { notat:'Notat', refleksjon:'Refleksjon', lagret:'Lagret' };
    const rad = e => `
      <button class="timeline-entry" data-go="${e.rute}" data-id="${e.id}">
        <span class="timeline-marker" aria-hidden="true"></span>
        <span class="timeline-copy"><span>${esc(e.tittel)}</span>
          <span class="meta">${ETIKETT[e.type] || ''} · ${datotekst(e.dagerSiden)}</span></span>${chev}
      </button>`;

    node.querySelector('[data-slot="agenda"]').innerHTML = grupper.length
      ? `<div class="agenda">${grupper.map(g => `
          <span class="mnd">${g.mnd}</span>
          <div class="timeline-list">${g.rader.map(rad).join('')}</div>`).join('')}</div>`
      : tomt({ tittel:'Ingenting her ennå',
               tekst:'Notater og lagrede oppskrifter dukker opp her etter hvert. Det er ingen dager som skal fylles.' });
  }

  function tegnNotater(node, p, state) {
    const q = (p.q || '').trim().toLocaleLowerCase('nb-NO');
    const felt = node.querySelector('[data-slot="sok"]');
    if (felt.value !== (p.q || '')) felt.value = p.q || '';
    const synlige = [...state.notater]
      .filter(n => !q || `${n.tittel} ${n.tekst}`.toLocaleLowerCase('nb-NO').includes(q))
      .sort((a,b) => a.dagerSiden - b.dagerSiden);
    const rad = n => `
      <button class="row" data-go="notat" data-id="${n.id}">
        <span class="lbl"><span>${esc(n.tittel)}</span>
          <span class="meta">${datotekst(n.dagerSiden)}</span></span>${chev}
      </button>`;

    node.querySelector('[data-slot="innhold"]').innerHTML = `
      ${tegnListe(synlige, rad, {
        merke:'Notater',
        tom: q
          ? { tittel:'Ingen notater passer søket',
              tekst:'Prøv et annet ord eller tøm søkefeltet.' }
          : { tittel:'Ingen notater ennå',
              tekst:'Du skriver når du har lyst. Det er ingen påminnelse som venter på deg.' },
      })}
    `;
  }

  function tegnNotat(node, p, state) {
    // Ingen fallback til notat nummer én. Notatene er private, og en lenke
    // til et slettet notat som i stedet viser et ANNET, ekte notat er den
    // verste formen denne feilen kan ta.
    const n = state.notater.find(x => x.id === p.id);
    const slett = node.querySelector('[data-slot="slett"]');

    if (!n) {
      node.querySelector('[data-slot="tittel"]').textContent = 'Notat';
      slett.hidden = true;
      delete slett.dataset.ark;
      delete slett.dataset.id;
      node.querySelector('[data-slot="innhold"]').innerHTML = tomt({
        tittel: 'Dette notatet finnes ikke',
        tekst:  'Det kan være slettet, eller lenken peker på noe som aldri var her.',
        knapp:  { attr:'data-go="notater"', tekst:'Se notatene mine' } });
      return;
    }
    slett.hidden = false;

    node.querySelector('[data-slot="tittel"]').textContent = datotekst(n.dagerSiden);
    slett.dataset.ark = 'bekreft-slett';
    slett.dataset.id = n.id;

    node.querySelector('[data-slot="innhold"]').innerHTML = `
      <div class="note-body">
        <div class="stack" style="gap:8px">
        <span class="meta">${n.type === 'refleksjon' ? 'Refleksjon' : 'Notat'}</span>
        <h1 class="t-screen">${esc(n.tittel)}</h1>
        </div>
        ${n.tekst.split('\n').filter(Boolean).map(a => `<p style="color:var(--text)">${esc(a)}</p>`).join('')}
        ${n.sporsmal ? `<div class="note-quote">
            <span class="meta">Spørsmålet du svarte på</span>
            <p>${esc(n.sporsmal)}</p>
          </div>` : ''}
      </div>
      <div class="spacer" style="height:8px"></div>`;
  }

  /** Skjemaet er DOM-tilstand. Renderen tømmer feltet ved hver inngang. */
  function tegnNotatOpptak(node, p, state) {
    node.querySelector('[data-slot="tekst"]').value = '';
  }

  /**
   * Refleksjonsfeltet er også DOM-tilstand, og skjermen hadde ingen renderer
   * i det hele tatt. Da ble teksten stående mellom besøk: skriv noe, gå
   * tilbake, kom inn igjen, og den var der fortsatt. Det er den samme
   * re-entry-lekkasjen renderer-kontrakten finnes for — denne skjermen slapp
   * unna fordi den ikke hadde slots. Innholdet er privat refleksjon.
   */
  function tegnRefleksjon(node, p, state) {
    node.querySelector('[data-slot="tekst"]').value = '';
  }

  /**
   * Videoskjermen holdt på formatvalget mellom besøk — velger du «Lyd» og
   * kommer tilbake senere, står den fortsatt på lyd. Samme årsak.
   */
  function tegnVideo(node, p, state) {
    node.querySelectorAll('[data-fmt]').forEach(b => {
      const on = b.dataset.fmt === 'video';
      b.classList.toggle('on', on);
      b.setAttribute('aria-selected', String(on));
    });
    node.querySelector('#videoInner').innerHTML = SURFACE.video;
    const kropp = node.querySelector('#lessonBody');
    kropp.style.whiteSpace = 'normal';
    kropp.textContent = TEXT.video;
  }

  // ---- Ruter -------------------------------------------------------------
  // Erstatter den gamle skjermbytteren. Tre ting den gjør som den ikke gjorde:
  // tar payload (hvilken oppskrift, hvilket notat), holder én stakk per fane,
  // og bevarer scrollposisjon når man går tilbake fra detalj til liste.
  const ROUTES = {
    onboarding: { el:'s-onboarding' },
    'onboarding-navn':         { el:'s-onboarding-steg', render:(n,p,s) => tegnOnboardingSteg(n,{...p,steg:'navn'},s) },
    'onboarding-hverdag':      { el:'s-onboarding-steg', render:(n,p,s) => tegnOnboardingSteg(n,{...p,steg:'hverdag'},s) },
    'onboarding-mal':          { el:'s-onboarding-steg', render:(n,p,s) => tegnOnboardingSteg(n,{...p,steg:'mal'},s) },
    'onboarding-barrierer':    { el:'s-onboarding-steg', render:(n,p,s) => tegnOnboardingSteg(n,{...p,steg:'barrierer'},s) },
    'onboarding-generering':   { el:'s-onboarding-steg', render:tegnOnboardingGenerering },
    'onboarding-klar':         { el:'s-onboarding-steg', render:tegnOnboardingKlar },
    'design-fonter':           { el:'s-design-fonter' },
    'design-komponenter':      { el:'s-design-komponenter' },
    'design-fargepalett':      { el:'s-design-fargepalett' },
    hjem:       { el:'s-hjem',       tab:'hjem',     render:tegnHjem },
    moduler:    { el:'s-moduler',    tab:'moduler',  render:tegnModuler },
    video:      { el:'s-video',                      render:tegnVideo },
    refleksjon: { el:'s-refleksjon',                 render:tegnRefleksjon },
    meg:        { el:'s-meg',        tab:'meg',      render:tegnMeg },

    // `tab` betyr «dette er fanens rot». `hjemmefane` betyr «denne
    // dybdeskjermen hører til den fanen» og brukes kun når en deeplink
    // åpner skjermen kaldt — da må stakken få en rot under seg, ellers
    // faller «tilbake» ut i onboarding.

    // Fase 1 — Mat
    oppskrifter:      { el:'s-oppskrifter',     tab:'mat',        render:tegnMat },
    oppskriftsliste:  { el:'s-oppskriftsliste', hjemmefane:'mat', render:tegnOppskriftsliste },
    oppskrift:    { el:'s-oppskrift',   hjemmefane:'mat', render:tegnOppskrift },
    maltidsplan:  { el:'s-maltidsplan', hjemmefane:'mat', render:tegnMaltidsplan },

    // Fase 2 — Profil
    interesser:   { el:'s-interesser',  hjemmefane:'meg', render:tegnInteresser },
    'profil-navn':{ el:'s-profil-navn', hjemmefane:'meg', render:tegnProfilNavn },
    konto:        { el:'s-konto',       hjemmefane:'meg', render:tegnKonto },

    // Fase 4 — Meg
    innstillinger:  { el:'s-innstillinger',  hjemmefane:'meg', render:tegnInnstillinger },
    hjelp:          { el:'s-hjelp',          hjemmefane:'meg', render:tegnHjelp },
    tilbakeblikk:   { el:'s-tilbakeblikk',   hjemmefane:'meg', render:tegnTilbakeblikk },
    notater:        { el:'s-notater',        hjemmefane:'meg', render:tegnNotater },
    notat:          { el:'s-notat',          hjemmefane:'meg', render:tegnNotat },
    'notat-opptak': { el:'s-notat-opptak',   hjemmefane:'meg', render:tegnNotatOpptak },
  };
  for (const r of Object.values(ROUTES)) r.node = document.getElementById(r.el);

  /** Roten hver fane faller tilbake til. */
  const TAB_ROOT = { hjem:'hjem', moduler:'moduler', mat:'oppskrifter', meg:'meg' };

  let aktivFane = null;                                  // null = utenfor faner (onboarding)
  const stakker = { hjem:[], moduler:[], mat:[], meg:[], _:[] };
  const stakk = () => stakker[aktivFane] ?? stakker._;
  const na    = () => stakk()[stakk().length - 1];

  /** Lagrer scrollposisjonen på oppføringen vi forlater. */
  function lagreScroll() {
    const e = na(); if (!e) return;
    const r = ROUTES[e.name]; if (!r || !r.node) return;
    const s = r.node.querySelector('.scroll');
    if (s) e.scroll = s.scrollTop;
  }

  function show(name, params = {}, opts = {}) {
    const r = ROUTES[name];
    // Ærlig ark i stedet for stille return. Under en faset utbygging er en
    // knapp som ikke gjør noe umulig å skille fra en knapp som er ødelagt.
    if (!r || !r.node) { visArk('senere'); return; }
    const forrige = na() ? ROUTES[na().name] : null;

    lagreScroll();

    // Målet kan høre til en annen fane enn den aktive. Skjermer uten `tab`
    // (video, oppskrift, notat) blir liggende i den fanen de ble åpnet fra.
    if (r.tab && r.tab !== aktivFane) aktivFane = r.tab;

    const e = { name, params, scroll:0 };
    if (opts.reset)        stakker[aktivFane ?? '_'] = [e];
    else if (opts.replace) stakk()[Math.max(0, stakk().length - 1)] = e;
    else                   stakk().push(e);

    // Stakktak. Oppskrift -> relatert -> relatert er en uendelig løkke, og
    // uten tak blir «tilbake» en tretti trykk lang reise. Roten beholdes;
    // det er den back() faller ned til.
    if (stakk().length > 12) stakk().splice(1, 1);

    bytt(e, forrige, opts);
  }

  function bytt(e, forrige, opts = {}) {
    const r = ROUTES[e.name];

    // Tegn FØR vi viser. Ellers ser brukeren forrige rads innhold i én frame.
    if (r.render) r.render(r.node, e.params, state);
    if (r.tab) tegnNav(r.tab);

    // Gardering: ved re-entry i samme node (oppskrift -> relatert oppskrift)
    // må vi ikke skjule og vise den samme noden synkront.
    if (forrige && forrige.node !== r.node) forrige.node.hidden = true;
    r.node.hidden = false;

    if (!opts.noAnim) {
      r.node.classList.remove('enter');
      r.node.classList.add('enter');
    }

    // Tving layout FØR vi skriver scroll. Lå tidligere inne i animasjons-
    // grenen, så en gjenoppretting uten animasjon landet på gammel høyde.
    void r.node.offsetHeight;

    const s = r.node.querySelector('.scroll');
    if (s) s.scrollTop = opts.restore ? (e.scroll || 0) : 0;

    // Fokus på skjermtittelen. Uten dette blir nitten skjermer utilgjengelige
    // med tastatur og skjermleser. Ved re-entry er fokusflyttingen dessuten
    // den eneste endringsvarslingen som overlever prefers-reduced-motion.
    const f = r.node.querySelector('[data-focus]');
    if (f) f.focus({ preventScroll:true });

    skrivHash(e);
  }

  // ---- Deeplink ----------------------------------------------------------
  /**
   * #/oppskrift/r-07. Artefakten publiseres som URL, og da kan én skjerm
   * sendes til en grunnlegger direkte i stedet for «trykk Mat, så scroll».
   * replaceState, ikke pushState: nettleserhistorikken eies av appens egen
   * stakk, og to konkurrerende historikker gir en tilbakeknapp ingen forstår.
   */
  function skrivHash(e) {
    const h = e.params && e.params.id ? `#/${e.name}/${e.params.id}` : `#/${e.name}`;
    if (location.hash !== h) history.replaceState(null, '', h);
  }

  /**
   * Ruter som har byttet navn. Lenker er allerede delt med grunnleggerne, og
   * en delt lenke som plutselig lander på onboarding leser som at appen er
   * ødelagt — ikke som at noe har fått nytt navn.
   *
   * Dette er en oversettelse ved lesing, ikke en rute: skrivHash bruker alltid
   * det nye navnet, så adressefeltet retter seg selv ved første navigasjon.
   */
  const GAMLE_RUTENAVN = {
    program: 'moduler',
    'onboarding-interesser': 'onboarding-barrierer',
    'onboarding-preferanser': 'onboarding-barrierer',
    'onboarding-hensyn': 'onboarding-barrierer',
    'onboarding-laeringsform': 'onboarding-generering',
    'onboarding-tid': 'onboarding-generering',
    // Handlelisten var en egen skjerm. Den er nå en seksjon i måltidsplanen,
    // fordi den hører hjemme der ingrediensene kommer fra.
    handleliste: 'maltidsplan',
  };

  function lesHash() {
    const m = /^#\/([\w-]+)(?:\/([\w-]+))?$/.exec(location.hash || '');
    if (!m) return null;
    const navn = GAMLE_RUTENAVN[m[1]] || m[1];
    if (!ROUTES[navn] || !ROUTES[navn].node) return null;
    return { name:navn, params: m[2] ? { id:m[2] } : {} };
  }

  /** Åpner appen på hash-ruten hvis den finnes, ellers på onboarding. */
  function start() {
    // Skjul alt først. bytt() skjuler bare skjermen vi kom FRA, og ved kald
    // start finnes det ingen. Uten dette ble onboarding liggende synlig bak
    // en deeplinket skjerm — usynlig i vanlig bruk, garantert i en delt lenke.
    for (const r of Object.values(ROUTES)) if (r.node) r.node.hidden = true;

    const mal = lesHash();
    if (!mal) { show('onboarding', {}, { reset:true, noAnim:true }); return; }

    const r = ROUTES[mal.name];
    const fane = r.tab || r.hjemmefane || 'hjem';
    aktivFane = fane;
    // Legg fanens rot under, slik at «tilbake» har et sted å gå.
    stakker[fane] = [{ name:TAB_ROOT[fane], params:{}, scroll:0 }];
    if (mal.name === TAB_ROOT[fane]) bytt(na(), null, { noAnim:true });
    else show(mal.name, mal.params, { noAnim:true });
  }

  function back() {
    if (stakk().length > 1) {
      const forrige = ROUTES[stakk().pop().name];
      bytt(na(), forrige, { restore:true });
    } else {
      show(TAB_ROOT[aktivFane] || 'hjem', {}, { reset:true });
    }
  }

  /** Trykk på aktiv fane går til roten, som i iOS. */
  function velgFane(t) {
    const rot = TAB_ROOT[t];
    // Fanen finnes i menyen, men skjermen er ikke bygget ennå.
    // Bedre et ærlig ark enn en knapp som ikke gjør noe.
    if (!ROUTES[rot] || !ROUTES[rot].node) { visArk('senere'); return; }
    if (t === aktivFane) { show(rot, {}, { reset:true }); return; }
    // Denne manglet: uten den mister Mat scrollposisjonen sin i det du
    // bytter til Meg, og fanestakken er bare halvveis en stakk.
    lagreScroll();
    const forrige = na() ? ROUTES[na().name] : null;
    aktivFane = t;
    if (!stakk().length) stakk().push({ name:rot, params:{}, scroll:0 });
    bytt(na(), forrige, { restore:true });
  }

  /**
   * Tegner den aktive skjermen på nytt uten å røre stakken. Filterchips,
   * porsjonsstepper og brytere går hit.
   *
   * Valget lagres i params på stakkoppføringen, ikke i en modulvariabel.
   * Da overlever et filter at brukeren går inn i en detalj og tilbake, og
   * to oppføringer av samme rute har hver sin uavhengige tilstand.
   */
  function tegnPaNytt(patch) {
    const e = na(); if (!e) return;
    if (patch) Object.assign(e.params, patch);
    const r = ROUTES[e.name];
    if (!r || !r.render) return;
    // Husk hva brukeren nettopp trykket på. Uten dette faller fokus til body
    // hver gang en chip velges — samme feil som tegnNav hadde.
    const a = document.activeElement;
    const felt = a && a.dataset ? (a.dataset.sett ? 'sett' : a.dataset.handling ? 'handling' : null) : null;
    const merke = felt ? a.dataset[felt] : null;
    r.render(r.node, e.params, state);
    if (merke) {
      const igjen = r.node.querySelector(`[data-${felt}='${merke.replace(/'/g, "\\'")}']`);
      if (igjen) igjen.focus({ preventScroll:true });
    }
  }

  /**
   * Eneste stedet state muteres. Renderere leser; delegaten skriver.
   * Med nitten skjermer er «hvem endret dette» ellers et søk gjennom hele
   * fila i stedet for ett blikk på én funksjon.
   */
  function utfor(a) {
    switch (a.h) {
      case 'lagre':
        if (state.lagret.has(a.id)) state.lagret.delete(a.id);
        else                        state.lagret.add(a.id);
        break;
      case 'plan': {
        const i = state.plan.findIndex(x => x.oppskriftId === a.id);
        if (i >= 0) state.plan.splice(i, 1);
        else        state.plan.push({ oppskriftId:a.id, dag:0 });
        break;
      }
      case 'interesse':
        if (state.profil.interesser.has(a.id)) state.profil.interesser.delete(a.id);
        else                                   state.profil.interesser.add(a.id);
        break;
      case 'standardplan':
        // Kuratert plan, lik for alle. Erstatter det som ligger der.
        state.plan = STANDARDPLAN.map((id, dag) => ({ oppskriftId:id, dag }));
        break;
      case 'tom-plan':
        state.plan = [];
        state.harHjemme.clear();
        break;
      case 'bytt-ut': {
        const i = state.plan.findIndex(x => x.oppskriftId === a.fra);
        if (i >= 0) state.plan[i] = { oppskriftId:a.til, dag:state.plan[i].dag ?? 0 };
        lukkArk();
        tegnPaNytt();
        return;
      }
      case 'har-hjemme': {
        // Faste varer starter avhuket, så for dem lagrer vi det MOTSATTE:
        // «!nøkkel» betyr «denne faste varen har jeg likevel ikke». Uten det
        // ville et trykk på en fast vare ikke gjort noe synlig.
        const nok = a.fast ? '!' + a.k : a.k;
        const motsatt = a.fast ? a.k : '!' + a.k;
        state.harHjemme.delete(motsatt);
        if (state.harHjemme.has(nok)) state.harHjemme.delete(nok);
        else state.harHjemme.add(nok);
        break;
      }
      case 'mat-filter':
        lukkArk();
        tegnPaNytt({ maltid:a.m });
        return;
      case 'tilbakeblikk-filter':
        lukkArk();
        tegnPaNytt({ filter:a.filter });
        return;
      case 'bruk-oppskriftsfilter': {
        const ark = document.getElementById('ark');
        const maltidFelt = ark.querySelector('input[name="oppskrift-maltid"]:checked');
        const sorteringFelt = ark.querySelector(
          'input[name="oppskrift-sortering"]:checked');
        const maltid = MALTIDER.some(([v]) => v === maltidFelt?.value)
          ? maltidFelt.value : 'alle';
        const sortering = OPPSKRIFT_SORTERING.some(([v]) => v === sorteringFelt?.value)
          ? sorteringFelt.value : 'recommended';
        lukkArk();
        tegnPaNytt({ maltid, sortering });
        return;
      }
      case 'sorter-kommentarer':
        state.kommentarSortering[a.id] =
          a.sortering === 'newest' ? 'newest' : 'mostHelpful';
        lukkArk();
        tegnPaNytt();
        return;
      case 'upvote-comment': {
        const key = `${a.id}:${a.commentId}`;
        const kommentar = (state.kommentarer[a.id] || [])
          .find(k => k.id === a.commentId);
        if (kommentar) {
          if (state.kommentarUpvotes.has(key)) {
            state.kommentarUpvotes.delete(key);
            kommentar.upvotes = Math.max(0, (kommentar.upvotes || 0) - 1);
          } else {
            state.kommentarUpvotes.add(key);
            kommentar.upvotes = (kommentar.upvotes || 0) + 1;
          }
        }
        break;
      }
      case 'kommenter': {
        const ark = document.getElementById('ark');
        const felt = ark.querySelector('[data-slot="kommentar"]');
        const ratingFelt = ark.querySelector('[data-slot="kommentar-rating"]');
        const authorFelt = ark.querySelector(
          'input[name="kommentar-forfatter"]:checked');
        const t = felt ? felt.value.trim() : '';
        const rating = ratingFelt ? Number(ratingFelt.value) : 0;
        const authorMode = authorFelt && authorFelt.value === 'anonymous'
          ? 'anonymous' : 'firstName';
        const fornavn = (state.profil.navn || 'Du').trim().split(/\s+/)[0];
        // Ingen validering og ingen minstelengde, som alt annet brukerskrevet
        // i appen. Tomt felt betyr ombestemt seg.
        if (t) {
          (state.kommentarer[a.id] = state.kommentarer[a.id] || []).unshift({
            id: 'k-' + (Date.now() % 100000),
            dagerSiden: 0,
            // Status settes eksplisitt, aldri utelatt. En kommentar uten
            // status ville falt ut av filteret og blitt usynlig moderering.
            status: 'publisert',
            rating: rating >= 1 && rating <= 5 ? rating : null,
            upvotes: 0,
            authorMode,
            forfatter: {
              navn: authorMode === 'anonymous' ? 'Anonym' : fornavn,
              rolle: 'bruker',
            },
            tekst: t,
          });
        }
        lukkArk();
        tegnPaNytt();
        return;
      }
      case 'lagre-navn': {
        // Skjemaverdi finnes bare i DOM. utfor() er ikke en renderer, og er
        // det eneste stedet som får lov til å hente den ut igjen.
        const felt = ROUTES['profil-navn'].node.querySelector('[data-slot="navn"]');
        const v = felt.value.trim();
        // Ingen validering. Tomt felt beholder forrige navn i stedet for å
        // bli en feil brukeren må rette opp.
        if (v) state.profil.navn = v;
        lukkArk();
        back();
        return;
      }
      case 'lagre-notat': {
        const felt = ROUTES['notat-opptak'].node.querySelector('[data-slot="tekst"]');
        const t = felt.value.trim();
        // Ingen validering, ingen minstelengde, ingen tegnteller. Et tomt
        // notat er ikke en feil — det er et notat brukeren ombestemte seg om,
        // og da går vi bare tilbake uten å si noe om det.
        if (t) {
          state.notater.push({
            id: 'n-' + (state.notater.length + 90),
            type: 'notat',
            dagerSiden: 0,
            tittel: t.split('\n')[0].slice(0, 60),
            tekst: t,
          });
        }
        lukkArk();
        back();
        return;
      }
      case 'slett-notat':
        state.notater = state.notater.filter(n => n.id !== a.id);
        lukkArk();
        back();
        return;
    }
    lukkArk();
    tegnPaNytt();
  }

  /** Vender en bryter i state.valg. */
  function vend(nokkel) {
    state.valg[nokkel] = !state.valg[nokkel];
    tegnPaNytt();
  }

  // ---- Formatvelger ------------------------------------------------------
  const inner = document.getElementById('videoInner');
  const body  = document.getElementById('lessonBody');
  const TEXT = {
    video: 'En regel gir noe å holde seg til når mat kjennes uoversiktlig. Den forteller hva du skal gjøre, og den tar bort valget. Det er derfor den kan kjennes som en lettelse lenge før den kjennes som en tvang.',
    tekst: '00:15  En regel gir noe å holde seg til når mat kjennes uoversiktlig.\n\n02:40  Den forteller hva du skal gjøre, og den tar bort valget.\n\n04:52  Det er derfor den kan kjennes som en lettelse lenge før den kjennes som en tvang.',
    lyd:   'Lytt mens du gjør noe annet. Du mister ikke posisjonen når du bytter mellom video, tekst og lyd.'
  };
  const SURFACE = {
    video: `<button class="play" aria-label="Spill av"><svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true"><path d="M9 6l11 7-11 7z" fill="var(--primary)"/></svg></button>`,
    tekst: `<div class="surface"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/><path d="M9 12h6M9 16h6"/></svg><span style="font-size:16px;color:var(--text-secondary)">Transkripsjon</span></div>`,
    lyd:   `<div class="surface"><svg width="180" height="56" viewBox="0 0 180 56" aria-hidden="true">${
             Array.from({length:28},(_,i)=>{const h=[10,22,38,26,48,18,34,44,14,30,50,20,36,24,42,16,28,46,12,32,40,22,52,18,30,26,38,14][i];
             return `<rect x="${i*6+4}" y="${28-h/2}" width="3" height="${h}" rx="1.5" fill="var(--illo-deep)" opacity="${i<11?1:.35}"/>`}).join('')
           }</svg><button class="play" aria-label="Spill av"><svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true"><path d="M9 6l11 7-11 7z" fill="var(--primary)"/></svg></button></div>`
  };

  document.getElementById('formats').addEventListener('click', e => {
    const btn = e.target.closest('[data-fmt]');
    if (!btn) return;
    const f = btn.dataset.fmt;
    document.querySelectorAll('[data-fmt]').forEach(b => {
      const on = b === btn;
      b.classList.toggle('on', on);
      b.setAttribute('aria-selected', on);
    });
    inner.innerHTML = SURFACE[f];
    body.style.whiteSpace = f === 'tekst' ? 'pre-line' : 'normal';
    body.textContent = TEXT[f];
  });

  // ---- Ark ---------------------------------------------------------------
  /**
   * Ett ark, mange innhold. Registeret er nøkkel -> {tittel, tegn, cta}.
   * tegn(params, state) returnerer HTML og navigerer aldri selv — knapper i
   * arket bærer de samme data-attributtene som resten av appen og plukkes opp
   * av den samme delegaten. Arket er ikke et eget univers.
   */
  const ARK = {
    senere: {
      tittel: 'Ikke tilgjengelig ennå',
      tegn: () => `<p>Denne delen er ikke tilgjengelig i denne versjonen.</p>`,
      cta: 'Greit',
    },

    sprak: {
      tittel: 'Språk',
      tegn: () => `<p>Florir vises på norsk bokmål. Flere språk kan legges til senere.</p>`,
      cta: 'Lukk',
    },

    personvern: {
      tittel: 'Slik behandler vi data',
      tegn: () => `<p>Denne versjonen sender ikke profil, notater eller refleksjoner til en server.</p>
        <p>Før en ferdig app lanseres, skal lagring, sletting og samtykke beskrives tydelig her.</p>`,
      cta: 'Lukk',
    },

    'lokal-lagring': {
      tittel: 'Refleksjonene dine',
      tegn: () => `<p>Refleksjonene brukes bare i den aktive økten og deles ikke med andre.</p>`,
      cta: 'Lukk',
    },

    'om-florir': {
      tittel: 'Om Florir',
      tegn: () => `<p>Florir er et rolig lærings- og refleksjonsverktøy for et friere forhold til mat.</p>
        <p>Fagansvar, kontaktinformasjon og personverndokumentasjon legges inn før lansering.</p>`,
      cta: 'Lukk',
    },

    'review-feedback': {
      tittel: 'Gi tilbakemelding',
      tegn: () => `<p>Tilbakemeldinger samles på skjermkortene i designreviewet, slik at de følger riktig skjerm og versjon.</p>`,
      cta: 'Lukk',
    },

    hvorfor: {
      tittel: 'Hvorfor ser du dette?',
      tegn: () => {
        const valgte = valgteEtiketter();
        return `
          <p>Rekkefølgen er satt av to ting: hva du har valgt under Interesser,
             og en fast rekkefølge vi har satt selv.</p>
          <p>Ingenting her måler hva du trykker på, hvor lenge du leser, eller
             hva andre gjør. Det finnes ingen tellere i appen.</p>
          ${valgte.length
            ? `<div class="chips">${valgte.map(l => `<span class="badge">${l}</span>`).join('')}</div>`
            : `<p>Du har ikke valgt noen interesser ennå, så alt vises i vanlig rekkefølge.</p>`}
          <button class="btn btn-secondary" data-go="interesser">Endre interessene mine</button>`;
      },
      cta: 'Lukk',
    },

    porsjoner: {
      tittel: 'Porsjoner',
      tegn: p => `
        <p>Mengdene ganges opp. Fremgangsmåten står uendret.</p>
        <div class="chips">${[1,2,3,4,6,8].map(n =>
          `<button class="chip" aria-pressed="${n === p.n}" data-sett='{"porsjoner":${n}}'>${n}</button>`
        ).join('')}</div>`,
      cta: 'Ferdig',
    },

    'mat-filter': {
      tittel: 'Filtrer oppskrifter',
      tegn: p => `
        <div class="filter-options" role="radiogroup" aria-label="Måltid">
          ${MALTIDER.map(([v, l]) => `
            <button class="row" role="radio" aria-checked="${v === (p.maltid || 'alle')}"
                    data-handling='{"h":"mat-filter","m":"${v}"}'>
              <span class="lbl">${l}</span>
              <span class="filter-check" aria-hidden="true">${v === (p.maltid || 'alle') ? '●' : ''}</span>
            </button>`).join('')}
        </div>`,
      cta: 'Avbryt',
    },

    'sorter-oppskrifter': {
      tittel: 'Filtrer og sorter',
      klasse: 'custom-sheet recipe-choice-sheet',
      tegn: p => {
        const valgtMaltid = MALTIDER.some(([v]) => v === p.maltid)
          ? p.maltid : 'alle';
        const valgtSortering = OPPSKRIFT_SORTERING.some(([v]) => v === p.sortering)
          ? p.sortering : 'recommended';
        return `
          <div class="recipe-filter-form">
            <fieldset class="filter-group">
              <legend>Måltid</legend>
              ${MALTIDER.map(([v, l]) => `
                <label class="filter-choice">
                  <span>${l}</span>
                  <input type="radio" name="oppskrift-maltid" value="${v}"
                         ${v === valgtMaltid ? 'checked' : ''}>
                </label>`).join('')}
            </fieldset>
            <fieldset class="filter-group">
              <legend>Sorter etter</legend>
              ${OPPSKRIFT_SORTERING.map(([v, l]) => `
                <label class="filter-choice">
                  <span>${l}</span>
                  <input type="radio" name="oppskrift-sortering" value="${v}"
                         ${v === valgtSortering ? 'checked' : ''}>
                </label>`).join('')}
            </fieldset>
            <button class="btn btn-primary"
                    data-handling='{"h":"bruk-oppskriftsfilter"}'>
              Vis oppskrifter
            </button>
          </div>`;
      },
      cta: false,
    },

    'sorter-kommentarer': {
      tittel: 'Sorter kommentarer',
      tegn: p => `
        <div class="filter-options" role="radiogroup" aria-label="Sortering">
          ${KOMMENTAR_SORTERING.map(([v, l]) => `
            <button class="row" role="radio"
                    aria-checked="${v === (p.sortering || 'mostHelpful')}"
                    data-handling='${JSON.stringify({
                      h:'sorter-kommentarer', id:p.id, sortering:v
                    })}'>
              <span class="lbl">${l}</span>
              <span class="filter-check" aria-hidden="true">${
                v === (p.sortering || 'mostHelpful') ? '●' : ''}</span>
            </button>`).join('')}
        </div>`,
      cta: 'Avbryt',
    },

    'tilbakeblikk-filter': {
      tittel: 'Vis i tilbakeblikk',
      tegn: p => `
        <div class="filter-options" role="radiogroup" aria-label="Filtrer tilbakeblikk">
          ${TB_FILTER.map(([v, l]) => `
            <button class="row" role="radio" aria-checked="${v === (p.filter || 'alle')}"
                    data-handling='${JSON.stringify({ h:'tilbakeblikk-filter', filter:v })}'>
              <span class="lbl">${l}</span>
              <span class="filter-check" aria-hidden="true">${v === (p.filter || 'alle') ? '●' : ''}</span>
            </button>`).join('')}
        </div>`,
      cta: 'Avbryt',
    },

    'bekreft-slett': {
      tittel: 'Slette notatet?',
      tegn: p => `
        <p>Notatet blir borte fra denne økten. Ingenting er lagret utenfor
           denne enheten.</p>
        <button class="btn btn-primary" data-handling='{"h":"slett-notat","id":"${p.id}"}'>Slett notatet</button>`,
      cta: 'Avbryt',
    },

    'bekreft-slett-konto': {
      tittel: 'Slett kontoen min',
      tegn: () => `
        <p>Denne versjonen lagrer ingen konto eller data på en server.</p>
        <p>I den ferdige appen ville dette slettet alt: profil, interesser,
           lagrede oppskrifter og notater. Uten kopi, uten angrefrist.</p>`,
      cta: 'Lukk',
    },

  };

  /**
   * «Tøm planen» slettet planen og all avhuking umiddelbart, uten bekreftelse
   * og uten angre — mens stjernevurderingen, som er triviell å sette på nytt,
   * HADDE angre. Sikkerheten var invertert: lav risiko beskyttet, høy risiko
   * ikke.
   */
  ARK['bekreft-tom-plan'] = {
    tittel: 'Tømme planen?',
    tegn: (p, state) => `
      <p>Planen og avhukingen i handlelisten forsvinner. Lagrede oppskrifter og
         notater blir liggende.</p>
      <button class="btn btn-primary" data-handling='{"h":"tom-plan"}'>Tøm planen</button>`,
    cta: 'Avbryt',
  };

  ARK['bytt-ut'] = {
    tittel: 'Bytt ut denne',
    tegn: (p, state) => {
      const naa = DATA.oppskrifter.find(o => o.id === p.id);
      if (!naa) return '<p>Fant ikke oppskriften.</p>';
      // Alternativer fra samme måltid, i kuratert rekkefølge, som ikke
      // allerede ligger i planen. Ingen anbefaling og ingen rangering — det
      // er et bytte, ikke et forslag appen står inne for.
      const iPlan = new Set(state.plan.map(x => x.oppskriftId));
      const alt = kuratert(DATA.oppskrifter.filter(o =>
        o.maltid === naa.maltid && o.id !== naa.id && !iPlan.has(o.id))).slice(0, 6);
      return `
        <p>Bytter ut <strong>${naa.navn}</strong> med noe annet fra samme måltid.</p>
        ${alt.length ? `<div class="list">${alt.map((o, i) => `
          ${i ? '<div class="rule"></div>' : ''}
          <button class="row row-media"
                  data-handling='${JSON.stringify({ h:'bytt-ut', fra:naa.id, til:o.id })}'>
            <span class="medie${BILDER[o.id] ? ' har-bilde' : ''}">${bildeTag(o, '')}</span>
            <span class="lbl"><span>${o.navn}</span></span>
          </button>`).join('')}</div>`
        : `<p class="meta">Ingen andre retter i denne bolken ennå.</p>`}`;
    },
    cta: 'Avbryt',
  };

  ARK.kommenter = {
    tittel: 'Skriv en kommentar',
    klasse: 'custom-sheet comment-sheet',
    tegn: p => `
      <div class="comment-form">
        <fieldset class="comment-rating-field">
          <legend>Vurder oppskriften <span class="meta">(valgfritt)</span></legend>
          <input type="hidden" data-slot="kommentar-rating" value="0">
          <div class="comment-star-buttons" role="radiogroup"
               aria-label="Vurder oppskriften fra én til fem stjerner">
            ${[1,2,3,4,5].map(n => `
              <button class="comment-star" type="button" role="radio"
                      aria-checked="false" aria-label="${n} ${n === 1 ? 'stjerne' : 'stjerner'}"
                      data-comment-star="${n}">★</button>`).join('')}
          </div>
        </fieldset>
        <label class="formrow">
          <span class="label">Din kommentar</span>
          <textarea class="field" data-slot="kommentar" rows="4"
                    placeholder="Hva vil du dele?"
                    aria-label="Kommentaren din"></textarea>
        </label>
        <fieldset class="publish-mode">
          <legend>Publiser som</legend>
          <div class="publish-segments">
            <label class="publish-option">
              <input type="radio" name="kommentar-forfatter"
                     value="firstName" checked>
              <span>${esc((state.profil.navn || 'Du').trim().split(/\s+/)[0])}</span>
            </label>
            <label class="publish-option">
              <input type="radio" name="kommentar-forfatter" value="anonymous">
              <span>Anonym</span>
            </label>
          </div>
        </fieldset>
        <div class="comment-publish">
          <button class="btn btn-primary"
                  data-handling='{"h":"kommenter","id":"${p.id}"}'>
            Publiser
          </button>
        </div>
      </div>`,
    cta: false,
  };

  const arkWrap  = document.getElementById('ark');
  const arkPanel = arkWrap.querySelector('.sheet');
  let   arkKilde = null;                       // hvem hadde fokus da arket åpnet

  const FOKUSERBARE =
    'button:not([disabled]),a[href],input,textarea,select,[tabindex]:not([tabindex="-1"])';

  function visArk(nokkel, params = {}) {
    const a = ARK[nokkel] || ARK.senere;
    if (!arkWrap.hidden) lukkArk();            // ark oppå ark finnes ikke
    arkKilde = document.activeElement;

    arkPanel.className = `sheet${a.klasse ? ` ${a.klasse}` : ''}`;
    arkPanel.innerHTML = `
      <span class="grab" aria-hidden="true"></span>
      ${a.cta === false ? `
        <div class="sheet-head">
          <h2 class="t-card" id="arkTittel" tabindex="-1">${a.tittel}</h2>
          <button class="sheet-close" data-ark-lukk aria-label="Lukk">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"
                 stroke="currentColor" stroke-width="1.8" stroke-linecap="round"
                 aria-hidden="true"><path d="M5 5l10 10M15 5L5 15"/></svg>
          </button>
        </div>`
      : `<h2 class="t-card" id="arkTittel" tabindex="-1">${a.tittel}</h2>`}
      ${a.tegn(params, state)}
      ${a.cta === false ? '' : `
        <button class="btn ${a.cta === 'Avbryt' ? 'btn-secondary' : 'btn-primary'}"
                data-ark-lukk>${a.cta || 'Greit'}</button>`}`;

    arkWrap.hidden = false;

    // Rekkefølgen er ikke tilfeldig: fokus FØRST inn i arket, deretter inert
    // på resten. Motsatt vei finnes det et øyeblikk der fokus står i noe som
    // er aria-hidden, og det er en skjermleserfeil i seg selv.
    arkPanel.querySelector('#arkTittel').focus({ preventScroll:true });
    bakgrunn(true);
  }

  function lukkArk() {
    if (arkWrap.hidden) return;
    bakgrunn(false);
    arkWrap.hidden = true;
    arkPanel.innerHTML = '';                   // ingen skjult, fokuserbar rest
    arkPanel.className = 'sheet';
    const k = arkKilde; arkKilde = null;
    // Gi fokus tilbake bare hvis kilden finnes OG er synlig. Etter «Endre
    // interessene mine» ligger kilden i en skjult skjerm, og da ville
    // focus() sendt fokus til body i stedet for til den nye skjermen.
    if (k && document.contains(k) && !k.closest('.screen[hidden]')) {
      k.focus({ preventScroll:true });
    }
  }

  /**
   * inert på ALLE skjermer, ikke på en fast liste — nye skjermer dekkes
   * gratis. aria-hidden i tillegg, for motorer uten inert-støtte.
   */
  function bakgrunn(av) {
    document.querySelectorAll('.screen, .restart').forEach(el => {
      el.inert = av;
      if (av) el.setAttribute('aria-hidden', 'true');
      else    el.removeAttribute('aria-hidden');
    });
  }

  arkWrap.addEventListener('click', e => { if (e.target === arkWrap) lukkArk(); });

  // ---- Delegert klikk ----------------------------------------------------
  /** data-params='{"id":"r-042"}' eller kortformen data-id="r-042". */
  function lesParams(el) {
    if (el.dataset.params) { try { return JSON.parse(el.dataset.params); } catch { return {}; } }
    return el.dataset.id ? { id: el.dataset.id } : {};
  }

  const AKSJONER = ['data-fane','data-go','data-back','data-ark','data-ark-lukk',
                    'data-sett','data-vend','data-handling'];
  const AKSJON_SEL = AKSJONER.map(a => `[${a}]`).join(',');

  /**
   * ÉN closest over hele settet. Da vinner NÆRMESTE element med et
   * aksjonsattributt, uansett hvilket — en lagre-knapp inne i en rad med
   * data-go lagrer, den navigerer ikke. Med separate closest-kall i en
   * if-kjede ville rekkefølgen på if-ene bestemt oppførselen, og lagre-
   * knappen ville navigert. Det er ikke en stilpreferanse; det er forskjellen
   * på riktig og feil når rader får knapper i seg.
   */
  /**
   * Søk er den ene interaksjonen som ikke er et klikk, og den kan ikke gå
   * gjennom den klikkdelegaten uten å bli et tastetrykk-per-navigasjon.
   *
   * Verdien lagres i params på stakkoppføringen, som alt annet valg, slik at
   * et søk overlever at brukeren åpner en oppskrift og går tilbake.
   * tegnPaNytt() skriver ikke feltet med mindre verdien avviker — ellers
   * hopper markøren til slutten ved hvert tegn.
   */
  document.addEventListener('input', e => {
    const felt = e.target.closest('[data-sok]');
    if (!felt) return;
    tegnPaNytt({ q: felt.value });
  });

  document.addEventListener('click', e => {
    const onboardingValg = e.target.closest('[data-onboarding-choice]');
    if (onboardingValg) {
      const gruppe = onboardingValg.closest('[role="group"]');
      const flere = onboardingValg.dataset.multi === 'true';
      if (!flere) gruppe.querySelectorAll('[data-onboarding-choice]').forEach(k => k.setAttribute('aria-pressed', 'false'));
      onboardingValg.setAttribute('aria-pressed', String(onboardingValg.getAttribute('aria-pressed') !== 'true'));
      return;
    }

    const kommentarstjerne = e.target.closest('[data-comment-star]');
    if (kommentarstjerne) {
      const valgt = Number(kommentarstjerne.dataset.commentStar);
      const gruppe = kommentarstjerne.closest('.comment-star-buttons');
      const skjult = arkPanel.querySelector('[data-slot="kommentar-rating"]');
      gruppe.querySelectorAll('[data-comment-star]').forEach(stjerne => {
        const verdi = Number(stjerne.dataset.commentStar);
        stjerne.classList.toggle('is-filled', verdi <= valgt);
        stjerne.setAttribute('aria-checked', String(verdi === valgt));
      });
      if (skjult) skjult.value = String(valgt);
      return;
    }

    const el = e.target.closest(AKSJON_SEL);
    if (!el) return;
    const d = el.dataset;
    if ('arkLukk'  in d) { lukkArk(); return; }
    if ('ark'      in d) { visArk(d.ark, lesParams(el)); return; }
    if ('sett'     in d) { tegnPaNytt(JSON.parse(d.sett)); return; }
    if ('vend'     in d) { vend(d.vend); return; }
    if ('handling' in d) { utfor(JSON.parse(d.handling)); return; }
    if ('fane'     in d) { lukkArk(); velgFane(d.fane); return; }
    if ('back'     in d) { lukkArk(); back(); return; }
    if ('go'       in d) { lukkArk(); show(d.go, lesParams(el)); return; }
  });

  document.addEventListener('keydown', e => {
    if (arkWrap.hidden) return;
    // Escape lukker arket. Uten dette blir et ark med valg en tastaturfelle.
    if (e.key === 'Escape') { e.preventDefault(); lukkArk(); return; }
    if (e.key !== 'Tab') return;
    // Fokusfelle. Uten den vandrer Tab rett ut i skjermen bak arket, og
    // brukeren står i noe hun ikke kan se.
    const f = [...arkPanel.querySelectorAll(FOKUSERBARE)].filter(el => el.offsetParent !== null);
    if (!f.length) { e.preventDefault(); return; }
    const forste = f[0], siste = f[f.length - 1];
    const a = document.activeElement;
    if (e.shiftKey && (a === forste || a === arkPanel.querySelector('#arkTittel'))) {
      e.preventDefault(); siste.focus();
    } else if (!e.shiftKey && a === siste) {
      e.preventDefault(); forste.focus();
    }
  });

  document.getElementById('restart').addEventListener('click', () => {
    lukkArk();
    for (const k of Object.keys(stakker)) stakker[k] = [];
    // Bygg fra fabrikken i stedet for å liste opp felter. En håndskrevet
    // liste går ut av sync i det noen legger til tilstand — og det er
    // nøyaktig det som skjedde med kommentarer og harHjemme.
    for (const k of Object.keys(state)) delete state[k];
    Object.assign(state, startTilstand());
    for (const r of Object.values(ROUTES)) if (r.node) r.node.hidden = true;
    aktivFane = null;
    show('onboarding', {}, { reset:true, noAnim:true });
  });

  // ---- Innholdsvakt ------------------------------------------------------
  /**
   * Ett vokabular. En skrivefeil i en tag ville falt stille ut av hver
   * relevanssortering på hver flate, og ingen ville sett det før i demo.
   */
  (() => {
    const kjent = new Set(DATA.interesser.map(i => i.id));
    const ukjent = [...DATA.oppskrifter]
      .flatMap(x => x.tags || []).filter(t => !kjent.has(t));
    if (ukjent.length) console.warn('Ukjente tags:', [...new Set(ukjent)]);
    // Frys nivå to. Det er dette som gjør at ingen renderer kan skrive
    // visningstilstand inn i innholdsdataene «bare midlertidig».
    for (const k of ['oppskrifter','moduler','interesser']) {
      DATA[k].forEach(Object.freeze); Object.freeze(DATA[k]);
    }
    Object.freeze(DATA);
  })();

  // ---- Bilder ------------------------------------------------------------
  // ─── BILDER:START — generert av design/build-innhold.mjs --bilder. Ikke rediger. ───
  var BILDER = {
    'r-01': 'assets/photos/original-01.jpg',
    'r-02': 'assets/photos/original-02.jpg',
    'r-03': 'assets/photos/original-03.jpg',
    'r-04': 'assets/photos/original-04.jpg',
    'r-05': 'assets/photos/original-05.jpg',
    'r-06': 'assets/photos/original-06.jpg',
    'r-07': 'assets/photos/original-07.jpg',
    'r-08': 'assets/photos/original-08.jpg',
    'r-09': 'assets/photos/original-09.jpg',
    'r-10': 'assets/photos/original-10.jpg',
    'r-11': 'assets/photos/original-11.jpg',
    'r-12': 'assets/photos/original-12.jpg',
    'r-13': 'assets/photos/original-13.jpg',
    'r-14': 'assets/photos/original-14.jpg',
    'r-15': 'assets/photos/original-15.jpg',
    'r-16': 'assets/photos/original-16.jpg',
    'r-17': 'assets/photos/original-17.jpg',
    'r-18': 'assets/photos/original-18.jpg',
    'r-19': 'assets/photos/original-19.jpg',
    'r-20': 'assets/photos/original-20.jpg',
    'r-21': 'assets/photos/original-21.jpg',
    'r-22': 'assets/photos/original-22.jpg',
    'r-23': 'assets/photos/original-23.jpg',
    'r-24': 'assets/photos/original-24.jpg',
  };
  // ─── BILDER:SLUTT ───

  // ─── INGREDIENSBILDER:START — generert av design/build-innhold.mjs --bilder. Ikke rediger. ───
  var INGREDIENSBILDER = {
    'apple-cider-vinegar': 'assets/ingredients/apple-cider-vinegar.png',
    'apple': 'assets/ingredients/apple.png',
    'avocado': 'assets/ingredients/avocado.png',
    'baking-powder': 'assets/ingredients/baking-powder.png',
    'banana': 'assets/ingredients/banana.png',
    'blueberries': 'assets/ingredients/blueberries.png',
    'bread': 'assets/ingredients/bread.png',
    'butter': 'assets/ingredients/butter.png',
    'cardamom': 'assets/ingredients/cardamom.png',
    'carrots': 'assets/ingredients/carrots.png',
    'celery': 'assets/ingredients/celery.png',
    'cheese': 'assets/ingredients/cheese.png',
    'chia': 'assets/ingredients/chia.png',
    'chicken': 'assets/ingredients/chicken.png',
    'cinnamon': 'assets/ingredients/cinnamon.png',
    'cocoa': 'assets/ingredients/cocoa.png',
    'coconut-milk': 'assets/ingredients/coconut-milk.png',
    'coffee': 'assets/ingredients/coffee.png',
    'cottage-cheese': 'assets/ingredients/cottage-cheese.png',
    'crispbread': 'assets/ingredients/crispbread.png',
    'dark-chocolate': 'assets/ingredients/dark-chocolate.png',
    'deli-meat': 'assets/ingredients/deli-meat.png',
    'dry-yeast': 'assets/ingredients/dry-yeast.png',
    'egg': 'assets/ingredients/egg.png',
    'flour': 'assets/ingredients/flour.png',
    'fruit-berries': 'assets/ingredients/fruit-berries.png',
    'ginger': 'assets/ingredients/ginger.png',
    'jam': 'assets/ingredients/jam.png',
    'kiwi': 'assets/ingredients/kiwi.png',
    'mango': 'assets/ingredients/mango.png',
    'milk': 'assets/ingredients/milk.png',
    'nutmeg': 'assets/ingredients/nutmeg.png',
    'oats': 'assets/ingredients/oats.png',
    'peach': 'assets/ingredients/peach.png',
    'peanut-butter': 'assets/ingredients/peanut-butter.png',
    'pumpkin-seeds': 'assets/ingredients/pumpkin-seeds.png',
    'raspberries': 'assets/ingredients/raspberries.png',
    'salt': 'assets/ingredients/salt.png',
    'seed-mix': 'assets/ingredients/seed-mix.png',
    'sesame': 'assets/ingredients/sesame.png',
    'spinach': 'assets/ingredients/spinach.png',
    'strawberries': 'assets/ingredients/strawberries.png',
    'sugar': 'assets/ingredients/sugar.png',
    'sunflower-seeds': 'assets/ingredients/sunflower-seeds.png',
    'syrup': 'assets/ingredients/syrup.png',
    'tortilla': 'assets/ingredients/tortilla.png',
    'vegetable-mix': 'assets/ingredients/vegetable-mix.png',
    'walnuts': 'assets/ingredients/walnuts.png',
    'water': 'assets/ingredients/water.png',
    'yogurt': 'assets/ingredients/yogurt.png',
  };
  // ─── INGREDIENSBILDER:SLUTT ───

  // ---- Start -------------------------------------------------------------
  window.Florir = {state, DATA, ROUTES, BILDER, INGREDIENSBILDER, start, show, back, rerender:tegnPaNytt, current:na, nav:tegnNav, esc, delIngrediens, ingrediensKunst, erBolk, comments:tegnKommentarer, close:lukkArk, startTilstand};
})();
