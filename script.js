'use strict';

const $ = id => document.getElementById(id);

const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if(e.isIntersecting){e.target.classList.add('in');observer.unobserve(e.target)} });
},{threshold:.12,rootMargin:'0px 0px -40px 0px'});
document.querySelectorAll('.fade').forEach(el => observer.observe(el));

window.addEventListener('scroll',()=>{
  $('hdr').classList.toggle('scrolled',window.scrollY>40);
  // Scroll progress bar
  const bar=$('hdr-bar');
  if(bar){
    const total=document.documentElement.scrollHeight-window.innerHeight;
    bar.style.width=(total>0?(window.scrollY/total)*100:0)+'%';
  }
  const sc=$('scta');
  if(sc){const bq=document.querySelector('.bquote');if(bq){const r=bq.getBoundingClientRect();sc.style.opacity=(r.top<window.innerHeight&&r.bottom>0)?'0':'1'}}
},{passive:true});

$('burger').addEventListener('click',function(){
  this.classList.toggle('open');
  $('mnav').classList.toggle('open');
});
document.querySelectorAll('.mnav a').forEach(a=>a.addEventListener('click',()=>{
  $('burger').classList.remove('open');$('mnav').classList.remove('open');
}));

document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{
  const t=document.querySelector(a.getAttribute('href'));
  if(!t)return;e.preventDefault();
  window.scrollTo({top:t.getBoundingClientRect().top+window.scrollY-80,behavior:'smooth'});
}));

function validate(f){
  let ok=true;
  f.querySelectorAll('[required]').forEach(el=>{
    const v=el.value.trim();
    let valid=!!v;
    if(el.type==='email'&&v&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))valid=false;
    if(el.name==='zip'&&v&&!/^\d{5}$/.test(v))valid=false;
    el.classList.toggle('err',!valid);
    if(!valid)ok=false;
  });
  return ok;
}

function bindForm(formId,okId){
  const f=$(formId),ok=$(okId);
  if(!f)return;
  f.querySelectorAll('input,select').forEach(el=>{
    el.addEventListener('blur',()=>validate(f));
    el.addEventListener('input',()=>{if(el.classList.contains('err'))el.classList.remove('err')});
  });
  f.addEventListener('submit',async e=>{
    e.preventDefault();
    if(!validate(f))return;
    const btn=f.querySelector('button[type=submit]');
    btn.textContent='Sending…';btn.disabled=true;
    try{
      const res=await fetch(f.action,{method:'POST',body:new FormData(f),headers:{Accept:'application/json'}});
      if(res.ok){f.style.display='none';ok.style.display='block'}
      else throw new Error();
    }catch{btn.textContent='Get My Free Quote →';btn.disabled=false}
  });
}
bindForm('hform','hok');
bindForm('bform','bok');

document.querySelectorAll('input[name=zip]').forEach(i=>i.addEventListener('input',()=>{i.value=i.value.replace(/\D/g,'').slice(0,5)}));
document.querySelectorAll('input[type=tel]').forEach(i=>i.addEventListener('input',()=>{
  let v=i.value.replace(/\D/g,'').slice(0,10);
  if(v.length>=7)i.value=`(${v.slice(0,3)}) ${v.slice(3,6)}-${v.slice(6)}`;
  else if(v.length>=4)i.value=`(${v.slice(0,3)}) ${v.slice(3)}`;
  else i.value=v;
}));

const rs=document.querySelector('.rev-scroll');
if(rs){let d=false,sx,sl;
  rs.addEventListener('mousedown',e=>{d=true;rs.style.cursor='grabbing';sx=e.pageX-rs.offsetLeft;sl=rs.scrollLeft});
  ['mouseleave','mouseup'].forEach(ev=>rs.addEventListener(ev,()=>{d=false;rs.style.cursor='grab'}));
  rs.addEventListener('mousemove',e=>{if(!d)return;e.preventDefault();rs.scrollLeft=sl-(e.pageX-rs.offsetLeft-sx)*1.4});
}

document.querySelectorAll('.fade').forEach(el=>{
  if(el.closest('.hero'))setTimeout(()=>el.classList.add('in'),100);
});

  // ── Before / After Comparison Sliders ──
document.querySelectorAll('.ba-wrap').forEach(wrap => {
  const after  = wrap.querySelector('.ba-after');
  const handle = wrap.querySelector('.ba-handle');
  let active = false;

  // Apply position using clip-path — image NEVER changes size
  function applyPos(clientX) {
    const r   = wrap.getBoundingClientRect();
    let pct   = ((clientX - r.left) / r.width) * 100;
    pct       = Math.min(97, Math.max(3, pct));

    // Reveal after image from left side
    after.style.clipPath    = `inset(0 ${100 - pct}% 0 0)`;
    handle.style.left       = pct + '%';
  }

  // ── Mouse Events ──
  wrap.addEventListener('mousedown', e => {
    active = true;
    applyPos(e.clientX);
    e.preventDefault();
  });
  window.addEventListener('mousemove', e => {
    if (!active) return;
    applyPos(e.clientX);
  });
  window.addEventListener('mouseup', () => { active = false; });

  // ── Touch Events ──
  wrap.addEventListener('touchstart', e => {
    active = true;
    applyPos(e.touches[0].clientX);
  }, { passive: true });
  window.addEventListener('touchmove', e => {
    if (!active) return;
    applyPos(e.touches[0].clientX);
  }, { passive: true });
  window.addEventListener('touchend', () => { active = false; });
});