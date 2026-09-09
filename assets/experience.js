/* Florir v3: native screens, durable per-user progress and complete prototype flows. */
(() => {
  'use strict';
  const F = window.Florir, U = window.FlorirUI, P = window.FlorirPrototype, S = F.state, D = P.demo, esc = F.esc;
  const { icon, go, action, crop, flower, cta, backhead, title, frame, register, toast, modal, redraw, recipe, food, minutes, kr } = U;
  const act = (name, data = {}) => `data-v3="${name}" data-value='${esc(JSON.stringify(data))}'`;
  const stamp = () => crop('diary-stamp', [648, 1243, 150, 190], 'diary-stamp');
  const price = month => Math.max(180, 499 - Math.max(0, Math.floor(month)) * 50);
  const priceTable = () => `<table class="price-table"><thead><tr><th>Periode</th><th>Per måned</th></tr></thead><tbody>${Array.from({ length: 8 }, (_, i) => `<tr><td>${i === 7 ? 'Fra måned 8' : 'Måned ' + (i + 1)}</td><td>${price(i)} kr</td></tr>`).join('')}</tbody></table>`;
  const date = iso => new Date(iso || Date.now());
  const dateLong = iso => date(iso).toLocaleDateString('nb-NO', { weekday: 'long', day: 'numeric', month: 'long' });
  const clock = iso => date(iso).toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' });
  const previewText = note => note.tekst?.trim().split('\n')[0].slice(0, 100) || note.tittel || 'Et notat';
  D.clipPositions = {}; D.clipDone = {}; D.finishedParts = [0, 1]; D.awake = false;

  function paywall(node) {
    frame(node, `${backhead('Florir', `<button class="icon-button" ${action('explore')} aria-label="Lukk">${icon('close')}</button>`)}${title('Billigere med tiden.', 'Du starter på 499 kr. Prisen synker hver måned.')}<section class="declining-price"><span class="eyebrow">Din prøve</span><h2>3 dager gratis</h2><p>Deretter <strong>499 kr/mnd</strong></p><div class="price-columns" role="img" aria-label="Måned 1: 499 kroner. Måned 3: 399 kroner. Måned 5: 299 kroner. Fra måned 8: 180 kroner per måned videre.">${[[499,1],[399,3],[299,5],[180,'8+']].map(([value, month], i) => `<div class="price-column ${i === 3 ? 'floor' : ''}"><b>${value} kr</b><i style="height:${value / 499 * 100}px"></i><span>Mnd ${month}</span></div>`).join('')}</div><div class="permanent-price"><h2>180 kr/mnd videre</h2><p>Prisen blir her så lenge du beholder medlemskapet.</p><small>319 kr mindre hver måned enn ved start.</small></div></section><div class="benefits"><div>${icon('check')}Første del av Matstøy</div><div>${icon('check')}5 oppskrifter · 3 retter i planen</div><div>${icon('check')}Notater og refleksjon</div></div><details class="trial-details"><summary>Se hele prisplanen ${icon('down')}</summary>${priceTable()}<p>Etter prøven får du alle fem deler av Matstøy, alle oppskriftene og fri planlegging.</p></details><label class="consent"><input id="fl-consent" type="checkbox"><span>Jeg godtar automatisk fornyelse etter prøven.<small>Første betaling om 3 dager: 499 kr.</small></span></label>${cta('Prøv gratis i 3 dager', action('start-trial'))}<p class="demo-note">Avslutt før prøven er over for å unngå betaling.<br>Demo · Ingen betaling</p>`, { cls: 'paywall-v3' });
  }
  function membership(node) {
    const trial = U.isTrial() && !D.cancelled;
    frame(node, `${backhead()}${title('Ditt medlemskap')}<div class="declining-price"><span class="eyebrow">${D.cancelled ? 'Avsluttet' : trial ? 'Prøveperiode' : 'Medlemsdemo'}</span><h2>${D.cancelled ? 'Ingen fornyelse' : trial ? '0 kr nå' : price(D.month) + ' kr/mnd'}</h2><p>${trial ? 'Prøven varer til ' + U.dateLabel(date(D.trialEnd)) + '. Deretter 499 kr/mnd.' : D.cancelled ? 'Du kan fortsette å utforske Florir.' : 'Pris for måned ' + (D.month + 1) + '.'}</p></div><h2>Lavere pris hver måned</h2><p>Prisen faller med 50 kr per måned, til 180 kr fra måned 8. Der blir den så lenge medlemskapet løper.</p>${priceTable()}${trial ? `<button class="text-button under" ${action('cancel-trial')}>Avslutt før første betaling</button>` : cta('Prøv medlemsflyten', go('betaling'))}<button class="utility" ${act('price-next')}>${icon('calendar')}<span>Vis neste prismåned</span>${icon('arrow')}</button><button class="text-button" ${action('explore')}>Utforsk hele Florir</button><p class="demo-note">En demonstrasjon av medlemskapet. Ingen kort eller betaling er registrert.</p>`);
  }
  function diary(node, params = {}) {
    const existing = params.id && S.notater.find(n => n.id === params.id);
    const key = params.id || 'new';
    const draft = D.drafts[key] ||= { text: existing?.tekst || '', createdAt: existing?.createdAt || new Date().toISOString() };
    frame(node, `${backhead('Ditt rom', `<span class="diary-private">${icon('lock')}Bare ditt</span>`)}<div class="diary-heading">${title('Dagbok')}${flower()}</div><div class="diary-paper"><div class="diary-date"><span>${esc(dateLong(draft.createdAt))}</span><time>${clock(draft.createdAt)}</time></div><label class="visually-hidden" for="diary-text-${node.id}">Notatet ditt</label><textarea id="diary-text-${node.id}" data-diary="${esc(key)}" placeholder="Skriv her" maxlength="30000">${esc(draft.text)}</textarea>${stamp()}</div><span class="sync-copy" data-sync aria-live="polite"></span>`, { bottom: cta('Ta vare på tanken', act('diary-save', { key, id: params.id })), cls: 'diary-screen' });
  }
  function notePage(node, params) {
    const note = S.notater.find(n => n.id === params.id);
    if (!note) { frame(node, `${backhead()}${title('Notatet finnes ikke')}${cta('Til dagboken', go('notater'))}`); return; }
    frame(node, `${backhead('Ditt rom', `<button class="icon-button" ${action('delete-note', { id: note.id })} aria-label="Slett notatet">${icon('close')}</button>`)}<div class="diary-heading">${title('Dagbok')}${flower()}</div><article class="diary-paper"><div class="diary-date"><span>${esc(dateLong(note.createdAt))}</span><time>${clock(note.createdAt)}</time></div><p class="diary-prose">${esc(note.tekst)}</p>${stamp()}</article>`, { bottom: cta('Skriv videre', go('notat-opptak', { id: note.id })), cls: 'diary-screen' });
  }
  function notesPage(node) {
    frame(node, `${backhead()}${title('Dagboken din')}<div class="diary-list">${S.notater.map(n => `<button ${go('notat', { id: n.id })}><span class="eyebrow">${esc(dateLong(n.createdAt))} · ${clock(n.createdAt)}</span><p>${esc(previewText(n))}</p>${icon('arrow')}</button>`).join('') || '<p>Her får tankene dine plass.</p>'}</div>`, { bottom: cta('Skriv et notat', go('notat-opptak')) });
  }
  const originalJournal = F.ROUTES.meg.render;
  register('meg', (node, params) => {
    for (const note of S.notater) { note.tittel = previewText(note); note.dagerSiden = Math.max(0, Math.floor((Date.now() - date(note.createdAt)) / 86400000)); }
    originalJournal(node, params);
    if(D.savedClips?.length)node.querySelector('.scroll').insertAdjacentHTML('beforeend',`<section class="saved-clips"><h2>Klipp du vil ta med deg</h2>${D.savedClips.map(key=>{const [part,index]=key.split(':').map(Number),clip=LESSONS[part]?.clips[index];return clip?`<button ${go('video',{part,clip:index})}><span class="eyebrow">Matstøy · Del ${part+1}</span><br>${esc(clip[0])} ${icon('arrow')}</button>`:'';}).join('')}</section>`);
  }, 'meg');

  const bowl = recipe('r-03');
  bowl.steg = ['Ha cottage cheese, avokado, spinat, peanøttsmør, vaniljesukker og søtning i en blender.', 'Kjør ingrediensene til røren er helt glatt. Stopp og skrap ned langs kanten ved behov.', 'Hell røren i en skål. Skjær bananen i skiver, og legg banan og blåbær på toppen.'];
  const bowlTitles = ['Ha alt i blenderen.', 'Blend til en myk krem.', 'Topp med banan og blåbær.'];
  const originalRecipe = F.ROUTES.oppskrift.render;
  function recipeScreen(node, params) {
    if (params.del !== 'metode') { originalRecipe(node, params); return; }
    const r = recipe(params.id);
    if (!r) { originalRecipe(node, params); return; }
    if (U.isTrial() && !['r-03','r-pasta','r-waffles','r-lentils','r-10'].includes(r.id)) { U.locked(node, 'Denne oppskriften blir tilgjengelig etter prøven.'); return; }
    const completed = r.steg.filter((_, i) => D.steps.has(r.id + ':' + i)).length;
    const current = r.steg.findIndex((_, i) => !D.steps.has(r.id + ':' + i));
    const portions = Math.max(1, Number(params.porsjoner) || r.porsjoner);
    const summaries = r.id === 'r-03' ? bowlTitles : r.steg.map(s => s.split(/[.!?]\s/)[0].split(/\s+/).slice(0,10).join(' ').replace(/[.,:]$/, '') + '.');
    frame(node, `${backhead('Oppskrift', `<button class="icon-button" ${action('save', { id: r.id })} aria-label="Lagre oppskrift" aria-pressed="${S.lagret.has(r.id)}">${icon('bookmark')}</button>`)}<div class="cooking-head"><div class="cooking-photo">${food(r)}</div><div><h1 data-focus tabindex="-1">${esc(r.navn)}</h1><p>${minutes(r)} min · ${portions} ${portions === 1 ? 'porsjon' : 'porsjoner'}</p></div></div><div class="segmented" role="tablist" aria-label="Oppskriftsinnhold"><button role="tab" ${action('recipe-tab',{tab:'ingredienser'})} aria-selected="false">Ingredienser</button><button role="tab" ${action('recipe-tab',{tab:'metode'})} aria-selected="true">Slik gjør du</button></div><div class="cooking-progress"><h2>Én ting om gangen</h2><p>${completed} av ${r.steg.length} steg ferdig</p><div class="progress">${r.steg.map((_,i) => `<i class="${D.steps.has(r.id+':'+i)?'complete':''}"></i>`).join('')}</div></div><div class="cooking-steps">${r.steg.map((text, i) => { const key = r.id+':'+i, checked=D.steps.has(key), open=D.expanded.has(key); return `<div class="cook-step ${checked?'done':''} ${open?'open':''}"><button class="cook-check" role="checkbox" aria-checked="${checked}" aria-label="${checked?'Fjern avkrysning for':'Fullfør'} steg ${i+1}" ${action('step-check',{key})}><span>${checked?icon('check'):''}</span></button><button class="cook-summary" ${action('step-open',{key})} aria-expanded="${open}" aria-controls="cook-detail-${i}"><span>${i+1}. ${esc(summaries[i])}</span>${icon('down')}</button><div class="cook-detail" id="cook-detail-${i}" ${open?'':'hidden'}><p>${esc(text)}</p>${r.id==='r-03'&&i===1?'<aside class="culinary-note"><em>Gjør den så tykk du liker.</em><p>Spe med melk eller vann, litt om gangen.</p></aside>':''}</div></div>`; }).join('')}</div><div class="awake-row"><span>${icon('star')}Hold skjermen våken</span><button class="toggle" role="switch" aria-checked="${D.awake}" aria-label="Hold skjermen våken" ${act('awake')}><i></i></button></div>`, { bottom: `<div class="flow">${cta(current < 0 ? 'Oppskriften er ferdig' : `Merk steg ${current+1} som ferdig`, act('cook-next', { id:r.id, step:current }))}<button class="text-button" ${action('plan-picker', {id:r.id,portions})}>Legg i planen</button></div>`, cls:'cooking-screen' });
  }

  const LESSONS = [
    { title:'Hva er matstøy?', takeaway:'Plass til noe annet.', clips:[['Når mat tar stor plass','Matstøy kan være tanker om hva, når og hvor mye du skal spise. Her bruker vi ordet om tanker som tar mer plass enn du ønsker.'],['Legg merke til tankene','Hva pleier du å si til deg selv rundt mat? Du trenger ikke endre noe med én gang. Det holder å legge merke til det.'],['Det finnes mange råd','Et råd kan være nyttig i én situasjon og mindre nyttig i en annen. Du kan vurdere hva som passer i din hverdag.'],['Det du selv trenger','En regel forteller ikke alltid hvordan dagen din har vært. Gi plass til din egen erfaring.'],['En liten start','Legg merke til én tanke rundt mat i dag. Hva sier den? Du kan skrive den ned hvis du vil.']] },
    { title:'Når «sunt» blir en regel', takeaway:'Et valg gir rom.', clips:[['Et råd er et valg','Et råd er en mulighet, ikke en plikt. Du kan velge det som passer deg.'],['Når rådet blir en regel','En regel kan kjennes som noe du må gjøre, også på dager hvor den ikke passer. Legg merke til forskjellen på «jeg kan» og «jeg må».'],['Hvor kommer kravet fra?','Noen råd har vi hørt så ofte at de føles som sannheter. Du kan være nysgjerrig på hvor dine egne regler kommer fra.'],['Gi valget litt plass','Prøv å formulere en regel som et valg. Hvordan kjennes det å bytte ut «jeg må» med «jeg kan»?'],['Gi deg selv litt mer rom','Du trenger ikke endre alt i dag. Begynn med å legge merke til forskjellen mellom et råd du velger og en regel du føler du må følge.']] },
    { title:'Hvor kommer reglene fra?', takeaway:'Du kan være nysgjerrig.', clips:[['Regler vi har arvet','Familie, venner og det vi ser i mediene kan påvirke hvordan vi tenker om mat. Noen regler har fulgt oss lenge.'],['En kjent setning','Er det en setning om mat du kjenner igjen fra oppveksten? Hva betydde den den gangen?'],['Din hverdag nå','Livet ditt kan se annerledes ut i dag. Det er lov å undersøke om en gammel regel fortsatt passer.'],['Se med nye øyne','Hva ville du sagt til en venn i samme situasjon? Det spørsmålet kan gi et annet perspektiv.'],['Ta med deg ett spørsmål','Hvilken regel vil du bli litt bedre kjent med? Skriv den gjerne ned, uten å bestemme hva du skal gjøre med den.']] },
    { title:'Gi deg selv litt mer rom', takeaway:'Små valg får også plass.', clips:[['Begynn der du er','Du trenger ingen perfekt start. En vanlig dag er et fint sted å legge merke til det som skjer.'],['Én situasjon','Velg en situasjon rundt mat du er nysgjerrig på. Det kan være et måltid, en handletur eller en tanke.'],['Hva la du merke til?','Beskriv situasjonen med dine egne ord. Prøv å være konkret, uten å vurdere deg selv.'],['Det som passer for deg','Det er lov å ta hensyn til tid, lyst, selskap og praktiske behov. Hverdager er forskjellige.'],['Plass til variasjon','Det du velger én dag trenger ikke bli regelen for alle andre dager. Du kan prøve deg fram.']] },
    { title:'Din egen vei videre', takeaway:'Du bestemmer tempoet.', clips:[['Se tilbake','Hva kjenner du igjen fra disse delene? Kanskje noe føles kjent, mens noe er nytt.'],['Det du vil huske','Velg én tanke du vil ta med deg videre. Den trenger ikke være stor eller ferdig formulert.'],['En dag av gangen','Det går an å komme tilbake til en del når du trenger det. Her finnes det ingen frist.'],['Når du trenger støtte','Du trenger ikke håndtere vanskelige tanker alene. Under Hjelp og støtte finner du noen å snakke med.'],['Veien videre','Ta med deg det som var nyttig. Resten kan vente. Dine notater og favoritter ligger i Ditt rom.']] },
  ];
  const clampPart = p => Math.min(4, Math.max(0, Number(p?.part ?? D.part) || 0));
  let clipObserver, speaking = false, wakeLock;
  function stopSpeaking() { window.speechSynthesis?.cancel(); speaking = false; document.querySelectorAll('[data-speaking]').forEach(e => e.removeAttribute('data-speaking')); }
  function completePart(part) { if (!D.finishedParts.includes(part)) D.finishedParts.push(part); D.completed = D.finishedParts.length; D.part = Math.min(4, part + 1); persist.schedule(); }
  function clipProgress(part) { const done = D.clipDone[part] || []; return `<div class="clip-progress" aria-label="Fem klipp">${[0,1,2,3,4].map(i => `<i data-clip-bar="${i}" class="${done.includes(i)?'done':''}"></i>`).join('')}</div>`; }
  function partsDialog(part) { modal('Alle delene', `<div class="lesson-parts">${LESSONS.map((l,i) => `<button class="lesson-part" ${go('video',{part:i})}><span>${D.finishedParts.includes(i)?icon('check'):i+1}</span><span>${esc(l.title)}</span>${icon(U.isTrial()&&i>0?'lock':'arrow')}</button>`).join('')}</div><button class="text-button" ${go('leksjon',{part})}>Åpne vanlig leksjonsvisning</button>`); }
  function summaryContent(part) {
    const lesson = LESSONS[part], lines = [
      ['Matstøy er tanker om mat som tar stor plass.','Legg merke til tankene før du endrer noe.','Begynn med én tanke i dag.'],
      ['Et råd gir deg et valg.','En regel kan kjennes som et krav.','Begynn med å legge merke til forskjellen.'],
      ['Regler kan komme fra andre.','Det som passet før, passer ikke alltid nå.','Møt gamle regler med nysgjerrighet.'],
      ['Begynn med én konkret situasjon.','Beskriv det du merker, uten å dømme.','Gi deg selv plass til å prøve.'],
      ['Ta med deg det som er nyttig.','La resten vente.','Kom tilbake når du trenger det.'],
    ][part];
    return `<div class="summary-card"><span class="eyebrow">Oppsummering</span><h1 tabindex="-1" data-focus>${esc(lesson.takeaway)}</h1><ol>${lines.map(t=>`<li>${esc(t)}</li>`).join('')}</ol>${U.sprig()}</div><button class="note-link" ${go('notat-opptak')}>${icon('edit')}<span>Skriv et notat<small>En tanke du vil ta vare på.</small></span>${icon('arrow')}</button>${part<4?`<article class="next-lesson"><span class="eyebrow">Neste del</span><h2>${esc(LESSONS[part+1].title)}</h2><p>Del ${part+2} av 5</p></article>${cta('Fortsett til neste del', act('lesson-next',{part}))}`:`<p>Du har kommet til slutten av Matstøy. Du kan se delene igjen når du vil.</p>${cta('Til Ditt rom', go('meg'))}`}<button class="text-button" ${go('moduler')}>Tilbake til modulene</button>`;
  }
  function portrait(node, params = {}) {
    const part = clampPart(params), lesson = LESSONS[part];
    if (U.isTrial() && part > 0) { U.locked(node, 'Resten av Matstøy åpnes etter prøvedagene.'); return; }
    clipObserver?.disconnect(); stopSpeaking();
    node.classList.add('new-screen');
    node.innerHTML = `<header class="feed-header">${backhead('Matstøy', `<button class="text-button" ${act('parts',{part})}>Alle deler ${icon('list')}</button>`)}<h1 tabindex="-1" data-focus>${esc(lesson.title)}</h1>${clipProgress(part)}</header><div class="clip-feed" tabindex="0" aria-label="Videoklipp. Bla ned for neste klipp.">${lesson.clips.map(([heading, text], i) => `<article class="clip-card" data-clip="${i}"><div class="portrait-image"><img src="assets/florir-shoot.jpeg" alt="Florir-gründerne i hagen"><div class="clip-top"><span>Klipp ${i+1} av 5</span><button class="icon-button" ${act('clip-bookmark',{part,index:i})} aria-label="Lagre klippet" aria-pressed="${(D.savedClips||[]).includes(part+':'+i)}">${icon('bookmark')}</button></div><span class="footage-label">Illustrert forhåndsvisning</span><div class="clip-overlay"><h2>${esc(heading)}</h2><p>${esc(text)}</p><div class="clip-controls"><button ${act('speak',{part,index:i})} aria-label="Lytt til eksempelteksten">${icon('play')}<span>Lytt</span></button><button ${act('clip-text',{part,index:i})}>Les klippet ${icon('book')}</button></div></div></div><button class="clip-next" ${act('clip-next',{part,index:i})}>${icon('down')}<span><small>${i===4?'Oppsummering':'Neste klipp'}</small>${esc(i===4?lesson.takeaway:lesson.clips[i+1][0])}</span></button></article>`).join('')}<article class="feed-summary" data-clip="5">${summaryContent(part)}</article></div>`;
    requestAnimationFrame(() => {
      if (node.hidden) return;
      const feed = node.querySelector('.clip-feed'), cards = [...feed.querySelectorAll('[data-clip]')];
      if ('IntersectionObserver' in window) {
        clipObserver = new IntersectionObserver(entries => { for (const entry of entries) if (entry.isIntersecting && entry.intersectionRatio > .5) { const index = Number(entry.target.dataset.clip); D.clipPositions[part] = index; if(index===5){D.clipDone[part]=[0,1,2,3,4];completePart(part);} node.querySelectorAll('[data-clip-bar]').forEach((bar,i)=>{bar.classList.toggle('active',i===index);bar.classList.toggle('done',(D.clipDone[part]||[]).includes(i));}); persist.schedule(); } }, { root:feed, threshold:.55 });
        cards.forEach(card=>clipObserver.observe(card));
      }
      const resume = Math.min(5, Math.max(0, Number(params.clip ?? D.clipPositions[part]) || 0));
      if (resume) feed.scrollTop = cards[resume].offsetTop - cards[0].offsetTop;
    });
  }
  function landscape(node, params={}) {
    const part=clampPart(params), lesson=LESSONS[part], format=params.format||'video';
    if(U.isTrial()&&part>0){U.locked(node,'Resten av Matstøy åpnes etter prøvedagene.');return;}
    frame(node,`${backhead('Matstøy',`<button class="text-button" ${act('parts',{part})}>Alle deler</button>`)}<span class="eyebrow">Del ${part+1} av 5</span>${title(lesson.title)}${U.prog(D.completed)}<div class="segmented" role="tablist" aria-label="Format">${[['video','Se'],['audio','Lytt'],['text','Les']].map(([v,l])=>`<button role="tab" ${go('leksjon',{part,format:v})} aria-selected="${format===v}">${l}</button>`).join('')}</div>${format==='video'?`<button class="landscape-video" ${go('video',{part})}><img src="assets/florir-shoot.jpeg" alt="Florir-gründerne"><span>${icon('play')}</span><small>Åpne stående klipp</small></button>`:format==='audio'?`<div class="soft-panel">${icon('play')}<div><h2>Lytt til teksten</h2><p>Nettleseren leser eksempelinnholdet.</p><button class="text-button" ${act('speak-all',{part})}>Spill av ${icon('play')}</button></div></div>`:''}<div class="thought-card teaching-point"><span class="eyebrow">Dette tar du med deg</span><h2>${esc(lesson.takeaway)}</h2><p>${esc(lesson.clips[0][1])}</p>${U.sprig()}</div>${format==='text'?lesson.clips.map(([h,t])=>`<article class="lesson-copy"><h2>${esc(h)}</h2><p>${esc(t)}</p></article>`).join(''):`<details class="trial-details"><summary>Les sammendraget ${icon('down')}</summary>${lesson.clips.map(([h,t])=>`<p><strong>${esc(h)}</strong><br>${esc(t)}</p>`).join('')}</details>`}${cta('Til oppsummeringen',act('lesson-summary',{part}))}<p class="demo-note">Eksempelinnhold. De innspilte videoene er ikke lastet inn.</p>`);
  }
  function summary(node,params={}) { const part=clampPart(params); if(U.isTrial()&&part>0){U.locked(node,'Resten av Matstøy åpnes etter prøven.');return;} completePart(part);frame(node,`${backhead('Matstøy',`<button class="text-button" ${act('parts',{part})}>Alle deler</button>`)}<span class="eyebrow">5 av 5 klipp</span>${clipProgress(part)}${summaryContent(part)}`,{cls:'summary-screen'}); }

  register('betaling',paywall);register('medlemskap',membership);register('notat-opptak',diary);register('refleksjon',diary);register('notat',notePage);register('notater',notesPage);register('tilbakeblikk',notesPage);register('oppskrift',recipeScreen);register('video',portrait);register('leksjon',landscape);register('oppsummering',summary);

  const CATALOG = [
    [/pasta/,'Pasta',500,'g','pakke',29.9], [/hakkede tomater/,'Hakkede tomater',400,'g','boks',17.9], [/linser/,'Linser',380,'g','boks',19.9],
    [/spinat/,'Spinat',200,'g','pose',29.9], [/cottage cheese/,'Cottage cheese',300,'g','boks',34.9], [/avokado/,'Avokado',300,'g','pose',39.9],
    [/egg/,'Egg',6,'stk','pakke',34.9], [/havregryn/,'Havregryn',1000,'g','pakke',29.9], [/melk/,'Melk',1000,'ml','kartong',24.9],
    [/yoghurt|kesam/,'Yoghurt',500,'g','beger',29.9], [/blåbærsyltetøy/,'Blåbærsyltetøy',400,'g','glass',29.9], [/blåbær/,'Blåbær',125,'g','kurv',29.9],
    [/peanøttsmør/,'Peanøttsmør',350,'g','glass',29.9], [/vaniljesukker/,'Vaniljesukker',100,'g','boks',29.9], [/søtning/,'Søtning',100,'g','boks',29.9],
    [/banan/,'Banan',1,'stk','stk',5.9], [/gulrøtter|gulrot/,'Gulrøtter',1000,'g','pose',29.9], [/revet ost/,'Revet ost',200,'g','pose',29.9],
    [/parmesan/,'Parmesan',150,'g','pakke',44.9], [/matfløte/,'Matfløte',300,'ml','kartong',24.9], [/hvitløk/,'Hvitløk',10,'fedd','stk',12.9],
    [/olivenolje/,'Olivenolje',500,'ml','flaske',69.9], [/basilikum/,'Basilikum',1,'plante','plante',29.9], [/sitron/,'Sitron',1,'stk','stk',8.9],
    [/feta/,'Feta',200,'g','pakke',39.9], [/søtpotet/,'Søtpotet',500,'g','pakke',29.9], [/fullkornsmel|hvetemel/,'Mel',1000,'g','pakke',29.9],
    [/bakepulver/,'Bakepulver',100,'g','boks',19.9], [/smør/,'Smør',250,'g','pakke',39.9],
  ];
  D.packages = {}; D.savedClips = [];
  function shoppingData() {
    const grouped = new Map(), dates = P.week().map(U.dateKey);
    for (const plan of S.plan.filter(p=>dates.includes(p.date))) {
      const r=recipe(plan.oppskriftId); if(!r)continue;
      for (const raw of [...r.ingredienser,...r.topping]) {
        if(F.erBolk(raw)||/valgfritt pålegg|grønt tilbehør/i.test(raw))continue;
        const item=F.delIngrediens(raw,plan.portions/r.porsjoner), clean=item.navn.toLowerCase().replace(/\s*\([^)]*\)/g,'').trim();
        const catalog=CATALOG.find(([re])=>re.test(clean));
        const key=catalog?catalog[1].toLowerCase():clean;
        const m=String(item.mengde).match(/^(\d+(?:[.,]\d+)?(?:\/\d+)?)\s*(.*)$/);
        let amount=m?(m[1].includes('/')?m[1].split('/').map(Number).reduce((a,b)=>a/b):Number(m[1].replace(',','.'))):0;
        const unit=(m?.[2]||'stk').toLowerCase();
        let base=amount;
        if(catalog){const target=catalog[3];if(unit==='kg')base*=1000;else if(unit==='l')base*=1000;else if(/boks|beger|pakke|pose|kurv/.test(unit))base*=catalog[2];else if(unit==='dl')base*=target==='ml'?100:/havre/.test(key)?40:/ost/.test(key)?40:60;else if(unit==='ss')base*=15;else if(unit==='ts')base*=5;else if(/håndfull/.test(unit))base*=/spinat/.test(key)?30:50;else if(unit==='stk'&&target==='g')base*=/gulr/.test(key)?80:150;}
        if(!grouped.has(key))grouped.set(key,{key,name:catalog?.[1]||item.navn,raw,catalog,amount:0,requirements:[]});
        const row=grouped.get(key);row.amount+=base;row.requirements.push(item.mengde);
      }
    }
    return [...grouped.values()].map(row=>{
      const c=row.catalog, proposed=Math.max(1,Math.ceil(row.amount/(c?.[2]||Math.max(row.amount,1))));
      const count=D.packages[row.key]??proposed, organic=!!D.productChoices[row.key], unitPrice=(c?.[5]||29.9)+(organic?10:0);
      const size=c?(c[2]===1000?`1 ${c[3]==='ml'?'l':'kg'}`:c[2]+' '+c[3]):'Velges hos Oda';
      const pack=c?.[4]||'pakke', plural={boks:'bokser',pose:'poser',pakke:'pakker',kartong:'kartonger',beger:'begre',glass:'glass',kurv:'kurver',stk:'stk',flaske:'flasker',plante:'planter'};
      return {...row,count,proposed,unitPrice,price:count*unitPrice,organic,packLabel:`${count} ${count===1?pack:(plural[pack]||pack)} · ${size}`,quantity:c?`${Number(row.amount.toFixed(1)).toLocaleString('nb-NO')} ${c[3]}`:row.requirements.join(' + ')};
    });
  }
  const remainingProducts=()=>shoppingData().filter(r=>!D.have.has(r.key));
  function shoppingScreen(node) {
    const rows=shoppingData();
    frame(node,`${backhead('',`<button class="icon-button" ${act('share-shopping')} aria-label="Del handlelisten">${icon('share')}</button>`)}${title('Handlelisten din','Kryss av det du allerede har hjemme.')}${U.steps(1)}${rows.length?`<div>${rows.map(row=>`<button class="ingredient-check ${D.have.has(row.key)?'checked':''}" role="checkbox" aria-checked="${D.have.has(row.key)}" ${act('pantry',{key:row.key})}><span class="ingredient-art">${F.ingrediensKunst(row.raw)}</span><span class="ingredient-name">${esc(row.name)}</span><span class="ingredient-amount">${esc(row.quantity)}</span><span class="check-circle">${D.have.has(row.key)?icon('check'):''}</span></button>`).join('')}</div>`:`<div class="saved-empty">${icon('basket')}<h2>Hva frister denne uka?</h2><p>Legg en rett i planen, så finner du ingrediensene her.</p>${cta('Finn en oppskrift',go('oppskrifter'))}</div>`}${rows.length&&!remainingProducts().length?`<div class="notice">Du har krysset av alle varene. Du kan endre valgene over.</div>${cta('Til måltidsplanen',go('maltidsplan'))}`:''}`,{tab:'mat',bottom:remainingProducts().length?cta('Se varer fra Oda',go('oda-varer')):''});
  }
  function odaScreen(node) {
    const list=remainingProducts(), total=list.reduce((sum,r)=>sum+r.price,0);
    frame(node,`${backhead('',`<button class="icon-button" ${act('share-shopping')} aria-label="Del handlelisten">${icon('share')}</button>`)}${title('Se over varene')}${U.steps(2)}<p>Produktforslag fra <span class="oda-word">oda</span></p><div>${list.map(row=>`<button class="product-line product-button" ${act('product',{key:row.key})}><span class="ingredient-art">${F.ingrediensKunst(row.raw)}</span><span class="product-info"><h3>${esc(row.name)}</h3><p>${esc(row.packLabel)}</p><small>${row.organic?'Økologisk alternativ':'Du trenger '+esc(row.quantity)}</small></span><b class="product-value">${kr(row.price)}</b>${icon('arrow')}</button>`).join('')||'<p>Du har allerede alt på listen.</p>'}</div><button class="text-button under" ${go('handleliste')}>Har du noe hjemme? Juster listen</button><div class="price-total"><button class="text-button" ${act('basket-info')}>Sum varer <span class="info-circle">i</span></button><strong>${kr(total)}</strong></div><p class="demo-note">Eksempelpriser · Levering kommer i tillegg</p>`,{tab:'mat',bottom:cta(list.length?'Se handlekurven':'Til måltidsplanen',go(list.length?'oda-klar':'maltidsplan'))});
  }
  function odaReady(node) {
    const rows=remainingProducts(),total=rows.reduce((s,r)=>s+r.price,0);
    frame(node,`${backhead()}${title('Handlekurven er klar','Ukens måltider, samlet på ett sted.')}${U.steps(3)}<div class="oda-hero">${crop('oda-basket',[40,416,775,525])}</div><div class="price-total"><span>Sum eksempelvarer</span><strong>${kr(total)}</strong></div><p>Se gjennom listen, og fullfør handelen hos Oda.</p><button class="text-button" ${go('oda-varer')}>Se varene ${icon('arrow')}</button>${cta('Kopier handlelisten',act('copy-shopping'))}<a class="fl-cta" href="https://oda.com/no/" target="_blank" rel="noopener noreferrer"><span>Åpne Oda</span>${icon('external')}</a><button class="text-button" ${go('maltidsplan')}>Tilbake til måltidsplanen</button><p class="demo-note">Demokurv. Listen overføres ikke automatisk, og ingenting er bestilt.</p>`,{tab:'mat'});
  }
  register('handleliste',shoppingScreen);register('oda-varer',odaScreen);register('oda-klar',odaReady);
  register('vilkar',node=>frame(node,`${backhead()}${title('Medlemskapet, enkelt forklart')}<div class="plan-terms"><p>Dette er en demonstrasjon av Florirs medlemsmodell. Ingen betaling gjennomføres.</p><p>Prøven varer i 3 dager med første del av Matstøy, 5 oppskrifter og opptil 3 retter i planen.</p><p>Deretter er foreslått pris 499 kr/mnd med automatisk fornyelse. Prisen faller hver måned, ned til 180 kr fra måned 8. Den blir der så lenge medlemskapet løper.</p>${priceTable()}<p>Avslutt før prøven er over for å unngå første betaling. Et nytt medlemskap starter på 499 kr igjen.</p><p>Betaling, Apple/Google-innlogging og Oda-handel er demoflyter. Endelige avtalevilkår og integrasjoner må på plass før lansering.</p></div>`));
  register('personvern',node=>frame(node,`${backhead()}${title('Dine opplysninger')}<div class="plan-terms"><p>Notater, profil, måltidsplan og fremdrift lagres for din innloggede bruker på denne private Florir-siden. De er tilgjengelige når du kommer tilbake.</p><p>Apple, Google og e-post i selve prototypen viser en demoflyt. Tilgangen til denne siden styres av kontoen du åpnet den med.</p><p>Teksten din sendes ikke til Oda eller en AI-modell. Ved problemer med forbindelsen beholdes et midlertidig notatutkast på enheten til det er lagret.</p><p>Eksterne lenker åpner tjenesten du velger. Der gjelder tjenestens egne vilkår.</p></div>`));

  let revision=0, loaded=false, saving=null, timer, dirty=false, lastSnapshot='', syncStatus='loading';
  function snapshot() { const current=F.current(); return {version:3,profile:{navn:S.profil.navn,epost:S.profil.epost},notes:S.notater,comments:S.kommentarer,commentVotes:[...S.kommentarUpvotes],preferences:S.valg,plan:S.plan,saved:[...S.lagret],checked:[...D.checked],steps:[...D.steps],have:[...D.have],mode:D.mode,provider:D.provider,onboarding:D.onboarding,completed:D.completed,part:D.part,finishedParts:D.finishedParts,clipPositions:D.clipPositions,clipDone:D.clipDone,savedClips:D.savedClips,trialEnd:D.trialEnd,cancelled:D.cancelled,month:D.month,productChoices:D.productChoices,packages:D.packages,drafts:D.drafts,route:current?{name:current.name,params:current.params}:null}; }
  function hydrate(data) {
    if(data?.version!==3)return;
    if(data.profile)Object.assign(S.profil,data.profile);
    if(Array.isArray(data.notes))S.notater=data.notes;
    if(data.comments)S.kommentarer=data.comments;
    if(data.commentVotes)S.kommentarUpvotes=new Set(data.commentVotes);
    if(data.preferences)Object.assign(S.valg,data.preferences);
    if(Array.isArray(data.plan))S.plan=data.plan.filter(p=>recipe(p.oppskriftId));
    S.lagret=new Set(data.saved||[]);
    for(const key of ['checked','steps','have'])D[key]=new Set(data[key]||[]);
    for(const key of ['mode','provider','onboarding','completed','part','finishedParts','clipPositions','clipDone','savedClips','trialEnd','cancelled','month','productChoices','packages','drafts'])if(data[key]!==undefined)D[key]=data[key];
  }
  function syncUI(status) { syncStatus=status; document.querySelectorAll('[data-sync]').forEach(el=>el.textContent=status==='saved'?'Lagret':status==='saving'?'Lagrer':status==='error'?'Ikke lagret ennå. Prøv igjen.':''); const bar=document.querySelector('#save-warning');if(bar)bar.hidden=status!=='error'; }
  async function flush() {
    clearTimeout(timer);
    if(!loaded){syncUI('error');return false;}
    if(saving){dirty=true;await saving;return dirty?flush():syncStatus==='saved';}
    const state=snapshot(), body=JSON.stringify(state);
    if(body===lastSnapshot){dirty=false;return true;}
    dirty=false;syncUI('saving');
    saving=(async()=>{
      try {
        const response=await fetch('/api/progress',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({state,revision}),signal:AbortSignal.timeout(12000),keepalive:body.length<50000});
        if(!response.ok)throw new Error(response.status===409?'conflict':'save');
        const data=await response.json();revision=data.revision;lastSnapshot=body;syncUI('saved');
        try{if(JSON.stringify(D.drafts)===JSON.stringify(state.drafts))localStorage.removeItem('florir-pending-diary');}catch{}
        return true;
      } catch(error){syncUI('error');if(error.message==='conflict')toast('Fremdriften er endret i en annen fane. Åpne Florir på nytt før du fortsetter.');return false;}
    })();
    const result=await saving;saving=null;if(dirty&&result)return flush();return result;
  }
  const persist=window.FlorirPersist={schedule(){if(!loaded)return;dirty=true;clearTimeout(timer);timer=setTimeout(flush,450);},flush,snapshot,get status(){return syncStatus;}};
  function showProduct(key) {
    const row=remainingProducts().find(r=>r.key===key);if(!row)return;
    modal(row.name,`<div class="product-detail"><div class="ingredient-art">${F.ingrediensKunst(row.raw)}</div><p>Du trenger ${esc(row.quantity)}.</p><p>${esc(row.packLabel)}</p></div><div class="portion"><span>Pakninger</span><button ${act('product-count',{key,count:Math.max(1,row.count-1)})} aria-label="Færre pakninger" ${row.count===1?'disabled':''}>−</button><output>${row.count}</output><button ${act('product-count',{key,count:row.count+1})} aria-label="Flere pakninger">+</button></div><div class="choice-list"><button class="choice" ${act('product-variant',{key,organic:false})}>Standardvalg ${row.organic?'':icon('check')}</button><button class="choice" ${act('product-variant',{key,organic:true})}>Økologisk alternativ · +10 kr per pakning ${row.organic?icon('check'):''}</button></div>${cta('Ferdig',act('product-close'))}<p class="demo-note">Eksempelvare. Utvalg og pris bekreftes hos Oda.</p>`);
  }
  function shoppingText() { return remainingProducts().map(r=>`${r.name}: ${r.packLabel}`).join('\n'); }
  async function speak(text,button) {
    if(speaking){stopSpeaking();return;}
    if(!window.speechSynthesis){modal('Les klippet',`<p>${esc(text)}</p>`);return;}
    const utterance=new SpeechSynthesisUtterance(text);utterance.lang='nb-NO';utterance.rate=.92;
    const voice=speechSynthesis.getVoices().find(v=>/^nb|^no/.test(v.lang));if(voice)utterance.voice=voice;
    speaking=true;button?.setAttribute('data-speaking','true');utterance.onend=stopSpeaking;utterance.onerror=stopSpeaking;speechSynthesis.speak(utterance);
  }
  async function handle(name,data,button) {
    switch(name){
      case 'diary-save': {
        const draft=D.drafts[data.key],text=document.querySelector('.screen:not([hidden]) [data-diary]')?.value.trim()||draft?.text?.trim();
        if(!text){toast('Skriv noen ord først.');document.querySelector('.screen:not([hidden]) [data-diary]')?.focus();return;}
        const existing=S.notater.find(n=>n.id===(data.id||draft.noteId));
        const note={id:existing?.id||'n-'+Array.from(crypto.getRandomValues(new Uint32Array(4)),n=>n.toString(16)).join(''),type:'notat',createdAt:draft.createdAt,updatedAt:new Date().toISOString(),tekst:text,tittel:text.split('\n')[0].slice(0,100),dagerSiden:0};
        if(existing)Object.assign(existing,note);else S.notater.unshift(note);
        draft.noteId=note.id;
        delete D.drafts[data.key];button.disabled=true;
        if(await persist.flush()){F.show('notat',{id:note.id},{replace:true});toast('Tanken er tatt vare på');}else{D.drafts[data.key]={...draft,text};button.disabled=false;toast('Kunne ikke lagre nå. Notatet ditt blir her.');}
        break;
      }
      case 'price-next': D.month=Math.min(7,D.month+1);D.mode='preview';redraw();break;
      case 'cook-next': if(data.step<0){F.show('oppskrift',{id:data.id});break;}D.steps.add(data.id+':'+data.step);D.expanded.delete(data.id+':'+data.step);if(recipe(data.id).steg[data.step+1])D.expanded.add(data.id+':'+(data.step+1));redraw();break;
      case 'awake':
        if(D.awake){await wakeLock?.release();D.awake=false;}else if(navigator.wakeLock){try{wakeLock=await navigator.wakeLock.request('screen');D.awake=true;wakeLock.addEventListener('release',()=>{D.awake=false;if(F.current().name==='oppskrift')redraw();});}catch{toast('Skjermen kan ikke holdes våken akkurat nå.');}}else toast('Denne nettleseren støtter ikke å holde skjermen våken.');redraw();break;
      case 'parts': partsDialog(data.part);break;
      case 'clip-text': modal(LESSONS[data.part].clips[data.index][0],`<p>${esc(LESSONS[data.part].clips[data.index][1])}</p>${cta('Neste klipp',act('clip-next',data))}`);break;
      case 'clip-next': {
        document.querySelector('.fl-dialog')?.close();stopSpeaking();
        const done=D.clipDone[data.part]||=[];if(!done.includes(data.index))done.push(data.index);
        D.clipPositions[data.part]=data.index+1;
        const feed=document.querySelector('.screen:not([hidden]) .clip-feed'),cards=feed?.querySelectorAll('[data-clip]');
        if(feed&&cards[data.index+1])feed.scrollTo({top:cards[data.index+1].offsetTop-cards[0].offsetTop,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
        if(data.index===4)completePart(data.part);break;
      }
      case 'clip-bookmark': {const key=data.part+':'+data.index,i=D.savedClips.indexOf(key);if(i<0)D.savedClips.push(key);else D.savedClips.splice(i,1);button.setAttribute('aria-pressed',String(i<0));toast(i<0?'Klippet er lagret':'Klippet er fjernet');break;}
      case 'speak': speak(LESSONS[data.part].clips[data.index][1],button);break;
      case 'speak-all': speak(LESSONS[data.part].clips.map(c=>c[1]).join(' '),button);break;
      case 'lesson-summary': D.clipDone[data.part]=[0,1,2,3,4];F.show('oppsummering',{part:data.part});break;
      case 'lesson-next': completePart(data.part);F.show('video',{part:Math.min(4,data.part+1)});break;
      case 'pantry': D.have.has(data.key)?D.have.delete(data.key):D.have.add(data.key);redraw();break;
      case 'product': showProduct(data.key);break;
      case 'product-count': D.packages[data.key]=data.count;showProduct(data.key);break;
      case 'product-variant': D.productChoices[data.key]=data.organic;showProduct(data.key);break;
      case 'product-close': document.querySelector('.fl-dialog').close();redraw();break;
      case 'basket-info': {const rows=remainingProducts();modal('Mengdene i kurven',`<p>${rows.length} ulike varer, fordelt på ${rows.reduce((s,r)=>s+r.count,0)} pakninger.</p><p>Behovet fra oppskriftene er samlet. Pakningsstørrelser og priser er eksempler. Se over mengdene hos Oda.</p>`);break;}
      case 'copy-shopping': case 'share-shopping': {
        const text=shoppingText();if(!text){toast('Handlelisten er tom.');return;}
        try{if(name==='share-shopping'&&navigator.share)await navigator.share({title:'Handlelisten min fra Florir',text});else if(navigator.clipboard){await navigator.clipboard.writeText(text);toast('Handlelisten er kopiert');}else throw new Error('clipboard');}catch(error){if(error.name!=='AbortError')modal('Handlelisten din',`<textarea class="share-copy" readonly aria-label="Kopier handlelisten">${esc(text)}</textarea>`);}break;
      }
      case 'retry-save': if(loaded)await persist.flush();else location.reload();break;
    }
    persist.schedule();
  }
  document.addEventListener('click',event=>{const button=event.target.closest('[data-v3]');if(!button)return;event.preventDefault();event.stopImmediatePropagation();handle(button.dataset.v3,JSON.parse(button.dataset.value||'{}'),button).catch(error=>{console.error('Florir interaction failed',error);toast('Det gikk ikke. Prøv igjen.');});},true);
  document.addEventListener('input',event=>{if(!event.target.matches('[data-diary]'))return;const key=event.target.dataset.diary;D.drafts[key].text=event.target.value;try{localStorage.setItem('florir-pending-diary',JSON.stringify({key,draft:D.drafts[key]}));}catch{}persist.schedule();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){stopSpeaking();persist.flush();}});
  window.addEventListener('pagehide',()=>persist.flush());
  window.addEventListener('florir:navigate',()=>{stopSpeaking();clipObserver?.disconnect();persist.schedule();syncUI(syncStatus);});
  window.addEventListener('online',()=>persist.flush());
  window.FlorirExperience={LESSONS,price,shoppingData,remainingProducts,snapshot,hydrate};
  async function boot(){
    const device=document.querySelector('.device'),loading=document.createElement('div');loading.className='app-loading';loading.innerHTML=`${U.brand()}<p>Åpner Florir</p>`;device.append(loading);
    const warning=document.createElement('div');warning.id='save-warning';warning.hidden=true;warning.innerHTML=`<span>Kunne ikke lagre endringene.</span><button ${act('retry-save')}>Prøv igjen</button>`;device.append(warning);
    let saved=null, recoveredDraft=false;
    try{const response=await fetch('/api/progress',{signal:AbortSignal.timeout(10000)});if(!response.ok)throw new Error('load');const data=await response.json();saved=data.state;revision=data.revision;hydrate(saved);loaded=true;syncUI('saved');}catch{syncUI('error');}
    for(const note of S.notater)if(!note.createdAt)note.createdAt=new Date(Date.now()-(note.dagerSiden||0)*86400000).toISOString();
    try{const pending=JSON.parse(localStorage.getItem('florir-pending-diary')||'null');if(pending?.key&&pending.draft?.text){D.drafts[pending.key]=pending.draft;recoveredDraft=true;}}catch{}
    if(!location.hash){const route=saved?.route;if(route&&F.ROUTES[route.name])history.replaceState(null,'',`#/${route.name}${route.params?.id?'/'+encodeURIComponent(route.params.id):''}${route.params&&Object.keys(route.params).some(k=>k!=='id')?'?'+new URLSearchParams(Object.entries(route.params).filter(([k])=>k!=='id')):''}`);else history.replaceState(null,'','#/hjem');}
    F.start();loading.remove();lastSnapshot=JSON.stringify(snapshot());if((!saved||recoveredDraft)&&loaded){lastSnapshot='';persist.schedule();}
  }
  boot();
})();
