const API = "http://127.0.0.1:5000";


(function() {
  const cv = document.getElementById("bg");
  if (!cv) return;
  const cx = cv.getContext("2d");
  let W, H, stars = [], nebulae = [], shooters = [], t = 0;

  function resize() {
    W = cv.width  = window.innerWidth;
    H = cv.height = window.innerHeight;
    build();
  }

  function build() {
    stars = [];
    // Tiny distant stars
    for (let i = 0; i < 600; i++) {
      const r  = Math.random();
      const tinted = r > 0.88;
      stars.push({
        x: Math.random() * W, y: Math.random() * H,
        r: Math.random() * 0.7 + 0.15,
        a: Math.random() * 0.5 + 0.1,
        sp: Math.random() * 0.003 + 0.0005,
        ph: Math.random() * Math.PI * 2,
        col: tinted
          ? (Math.random() > 0.5 ? [160, 200, 255] : [255, 240, 180])
          : [220, 230, 255],
      });
    }
    // Bright stars with flares
    for (let i = 0; i < 50; i++) {
      stars.push({
        x: Math.random() * W, y: Math.random() * H,
        r: Math.random() * 1.0 + 0.8,
        a: Math.random() * 0.7 + 0.35,
        sp: Math.random() * 0.004 + 0.001,
        ph: Math.random() * Math.PI * 2,
        col: [220, 235, 255],
        flare: true,
      });
    }

    // Nebulae
    nebulae = [
      { x:.08,  y:.12, rx:.24, ry:.14, col:"60,20,200",  a:.07, rot:-.35 },
      { x:.80,  y:.06, rx:.28, ry:.16, col:"0,80,180",   a:.055, rot:.2 },
      { x:.45,  y:.48, rx:.36, ry:.2,  col:"100,10,160", a:.045, rot:.1 },
      { x:.92,  y:.62, rx:.26, ry:.16, col:"0,130,120",  a:.05, rot:-.1 },
      { x:.04,  y:.80, rx:.22, ry:.15, col:"150,30,80",  a:.045, rot:.28 },
      { x:.55,  y:.90, rx:.32, ry:.14, col:"20,60,190",  a:.04, rot:0 },
      // Cyan aurora near top
      { x:.5,   y:.0,  rx:.5,  ry:.12, col:"0,180,220",  a:.04, rot:0 },
    ];
  }

  function drawBase() {
    // Very dark navy base
    const g = cx.createRadialGradient(W*.4, H*.3, 0, W*.5, H*.5, W*1.1);
    g.addColorStop(0,   "rgba(6,10,32,1)");
    g.addColorStop(.45, "rgba(4,6,20,1)");
    g.addColorStop(.8,  "rgba(2,4,14,1)");
    g.addColorStop(1,   "rgba(1,2,8,1)");
    cx.fillStyle = g;
    cx.fillRect(0, 0, W, H);
  }

  function drawMilkyWay() {
    cx.save();
    cx.translate(W*.5, H*.5);
    cx.rotate(-.4);
    const mw = cx.createLinearGradient(-W*.7, 0, W*.7, 0);
    mw.addColorStop(0,    "rgba(15,20,65,0)");
    mw.addColorStop(.28,  "rgba(35,40,100,.06)");
    mw.addColorStop(.5,   "rgba(50,55,125,.1)");
    mw.addColorStop(.72,  "rgba(35,40,100,.06)");
    mw.addColorStop(1,    "rgba(15,20,65,0)");
    cx.fillStyle = mw;
    cx.fillRect(-W*.8, -H*.7, W*1.6, H*1.4);
    const dust = cx.createLinearGradient(-W*.7, 0, W*.7, 0);
    dust.addColorStop(0,    "rgba(1,2,10,0)");
    dust.addColorStop(.44,  "rgba(1,2,10,.04)");
    dust.addColorStop(.5,   "rgba(1,2,10,.07)");
    dust.addColorStop(.56,  "rgba(1,2,10,.04)");
    dust.addColorStop(1,    "rgba(1,2,10,0)");
    cx.fillStyle = dust;
    cx.fillRect(-W*.8, -H*.09, W*1.6, H*.18);
    cx.restore();
  }

  function drawNebulae() {
    nebulae.forEach(n => {
      cx.save();
      cx.translate(n.x * W, n.y * H);
      cx.rotate(n.rot);
      cx.scale(1, n.ry / n.rx);
      const r = n.rx * W;
      const g = cx.createRadialGradient(0, 0, 0, 0, 0, r);
      g.addColorStop(0,   `rgba(${n.col},${n.a})`);
      g.addColorStop(.5,  `rgba(${n.col},${n.a*.45})`);
      g.addColorStop(1,   `rgba(${n.col},0)`);
      cx.beginPath(); cx.arc(0, 0, r, 0, Math.PI*2);
      cx.fillStyle = g; cx.fill();
      cx.restore();
    });
  }

  function drawFlare(x, y, r, a) {
    [0, 45, 90, 135].forEach(deg => {
      const rad = deg * Math.PI / 180;
      const len = r * 8;
      const g = cx.createLinearGradient(
        x - Math.cos(rad)*len, y - Math.sin(rad)*len,
        x + Math.cos(rad)*len, y + Math.sin(rad)*len
      );
      g.addColorStop(0,   "rgba(200,220,255,0)");
      g.addColorStop(.5,  `rgba(200,220,255,${a*.3})`);
      g.addColorStop(1,   "rgba(200,220,255,0)");
      cx.beginPath();
      cx.moveTo(x - Math.cos(rad)*len, y - Math.sin(rad)*len);
      cx.lineTo(x + Math.cos(rad)*len, y + Math.sin(rad)*len);
      cx.strokeStyle = g; cx.lineWidth = .6; cx.stroke();
    });
  }

  function drawStars() {
    stars.forEach(s => {
      s.ph += s.sp;
      const a = s.a * (.55 + .45*Math.sin(s.ph));
      cx.beginPath();
      cx.arc(s.x, s.y, s.r, 0, Math.PI*2);
      cx.fillStyle = `rgba(${s.col[0]},${s.col[1]},${s.col[2]},${a})`;
      cx.fill();
      if (s.flare && a > .5) drawFlare(s.x, s.y, s.r, a);
    });
  }

  // Cyan grid horizon effect
  function drawGrid() {
    const gridY = H * .75;
    cx.save();
    cx.globalAlpha = .025;
    // Horizontal lines converging
    for (let i = 0; i < 12; i++) {
      const y = gridY + (i * H*.04);
      if (y > H) break;
      cx.beginPath();
      cx.moveTo(0, y); cx.lineTo(W, y);
      cx.strokeStyle = "#00e5ff"; cx.lineWidth = .5; cx.stroke();
    }
    // Vertical lines from vanishing point
    const vp = W * .5;
    for (let i = -10; i <= 10; i++) {
      cx.beginPath();
      cx.moveTo(vp + i * (W*.04), gridY);
      cx.lineTo(vp + i * W * .8, H * 1.2);
      cx.strokeStyle = "#00e5ff"; cx.lineWidth = .5; cx.stroke();
    }
    cx.restore();
  }

  function spawnShooter() {
    if (shooters.length < 3) {
      shooters.push({
        x: Math.random()*.8, y: Math.random()*.35,
        len: Math.random()*130+50,
        spd: Math.random()*.004+.002,
        a: 1,
      });
    }
    setTimeout(spawnShooter, Math.random()*5000+3500);
  }

  function drawShooters() {
    for (let i = shooters.length-1; i >= 0; i--) {
      const s = shooters[i];
      s.x += s.spd; s.y += s.spd*.45; s.a -= .011;
      if (s.a <= 0) { shooters.splice(i,1); continue; }
      const x1=s.x*W, y1=s.y*H;
      const g = cx.createLinearGradient(x1, y1, x1-s.len, y1-s.len*.45);
      g.addColorStop(0, `rgba(180,220,255,${s.a})`);
      g.addColorStop(.3,`rgba(120,180,255,${s.a*.5})`);
      g.addColorStop(1, "rgba(80,130,255,0)");
      cx.beginPath(); cx.strokeStyle=g; cx.lineWidth=1.6;
      cx.moveTo(x1,y1); cx.lineTo(x1-s.len, y1-s.len*.45); cx.stroke();
      const hg = cx.createRadialGradient(x1,y1,0,x1,y1,3);
      hg.addColorStop(0,`rgba(255,255,255,${s.a})`);
      hg.addColorStop(1,"rgba(255,255,255,0)");
      cx.beginPath(); cx.arc(x1,y1,3,0,Math.PI*2);
      cx.fillStyle=hg; cx.fill();
    }
  }

  function frame() {
    t += .005;
    drawBase();
    drawMilkyWay();
    drawNebulae();
    drawGrid();
    drawStars();
    drawShooters();
    requestAnimationFrame(frame);
  }

  resize();
  window.addEventListener("resize", resize);
  setTimeout(spawnShooter, 2000);
  frame();
})();


/* ══════════════════════════════════════════════════════════
   NAV ACTIVE ON SCROLL
══════════════════════════════════════════════════════════ */
(function() {
  const secs = document.querySelectorAll("section[id]");
  const navs = document.querySelectorAll(".hnav");
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const id = "#" + e.target.id;
        navs.forEach(n => n.classList.toggle("active", n.getAttribute("href") === id));
      }
    });
  }, { threshold: .35 });
  secs.forEach(s => obs.observe(s));
})();


/* ══════════════════════════════════════════════════════════
   PREDICT FORM
══════════════════════════════════════════════════════════ */
const FIELDS = [
  {id:"planet_radius",min:.1,max:30},{id:"planet_mass",min:.01,max:5000},
  {id:"orbital_period",min:.1,max:100000},{id:"semi_major_axis",min:.001,max:100},
  {id:"equilibrium_temperature",min:10,max:5000},{id:"orbital_eccentricity",min:0,max:1},
  {id:"planet_density",min:0,max:100},{id:"insolation_flux",min:0,max:100000},
  {id:"star_temperature",min:2000,max:50000},{id:"star_luminosity",min:-5,max:6},
  {id:"star_metallicity",min:-3,max:1.5},{id:"star_mass",min:.05,max:150},
  {id:"habitability_index",min:0,max:1},{id:"stellar_compatibility",min:0,max:1},
  {id:"orbital_stability",min:0,max:1},
];

const EXAMPLE = {
  planet_radius:1.2,planet_mass:1.1,orbital_period:365,semi_major_axis:1.0,
  equilibrium_temperature:280,orbital_eccentricity:.02,planet_density:5.5,insolation_flux:1.0,
  star_temperature:5778,star_luminosity:0,star_metallicity:0,star_mass:1.0,
  habitability_index:.85,stellar_compatibility:.9,orbital_stability:.95,
  star_type:"G",
};

const BATCH_SAMPLE = [
  {name:"Kepler-442b",planet_radius:1.34,planet_mass:2.3,orbital_period:112.3,semi_major_axis:.409,equilibrium_temperature:233,orbital_eccentricity:.04,planet_density:6.1,insolation_flux:.73,star_temperature:4402,star_luminosity:-.63,star_metallicity:.14,star_mass:.61,habitability_index:.78,stellar_compatibility:.88,orbital_stability:.91,star_G:0,star_K:1,star_M:0,star_Unknown:0},
  {name:"TRAPPIST-1e",planet_radius:.91,planet_mass:.69,orbital_period:6.1,semi_major_axis:.029,equilibrium_temperature:251,orbital_eccentricity:.02,planet_density:7.6,insolation_flux:.66,star_temperature:2559,star_luminosity:-3.28,star_metallicity:.04,star_mass:.09,habitability_index:.82,stellar_compatibility:.79,orbital_stability:.85,star_G:0,star_K:0,star_M:1,star_Unknown:0},
  {name:"Proxima Cen b",planet_radius:1.1,planet_mass:1.27,orbital_period:11.2,semi_major_axis:.0485,equilibrium_temperature:270,orbital_eccentricity:.1,planet_density:5.8,insolation_flux:.65,star_temperature:3050,star_luminosity:-1.49,star_metallicity:.21,star_mass:.123,habitability_index:.71,stellar_compatibility:.75,orbital_stability:.8,star_G:0,star_K:0,star_M:1,star_Unknown:0},
];

function validate() {
  let ok = true;
  FIELDS.forEach(({id,min,max}) => {
    const el = document.getElementById(id);
    const v  = parseFloat(el.value);
    const bad = el.value===""||isNaN(v)||v<min||v>max;
    el.classList.toggle("invalid",bad);
    if (bad) ok = false;
  });
  const st  = document.querySelector('input[name="stype"]:checked');
  const err = document.getElementById("stErr");
  if (!st) { err.classList.remove("d-none"); ok=false; }
  else       err.classList.add("d-none");
  return ok;
}

function buildPayload() {
  const p = {};
  FIELDS.forEach(({id}) => { p[id]=parseFloat(document.getElementById(id).value); });
  const st = document.querySelector('input[name="stype"]:checked').value;
  p.star_G=st==="G"?1:0; p.star_K=st==="K"?1:0;
  p.star_M=st==="M"?1:0; p.star_Unknown=st==="Unknown"?1:0;
  return p;
}

function showResult(data) {
  const {habitable,category,confidence_score,confidence_label,description} = data.prediction;
  const pct = Math.round(confidence_score*100);
  document.getElementById("resultBox").classList.remove("d-none");
  document.getElementById("errBox").classList.add("d-none");

  const banner = document.getElementById("resultBanner");
  banner.className = "result-banner "+(habitable?"hab":"nohab");
  banner.textContent = (habitable?"✓  ":"✗  ")+category+"  —  "+description;

  const rv = document.getElementById("rv");
  rv.textContent = habitable ? "HABITABLE" : "NON-HABITABLE";
  rv.style.color = habitable ? "var(--green)" : "var(--red)";

  document.getElementById("rc_val").textContent = pct+"%";
  const bar = document.getElementById("cBar");
  bar.style.background = pct>=80?"var(--green)":pct>=50?"var(--amber)":"var(--red)";
  bar.style.boxShadow  = pct>=80?"0 0 8px var(--green)":pct>=50?"0 0 8px var(--amber)":"0 0 8px var(--red)";
  setTimeout(()=>bar.style.width=pct+"%",100);

  const rl = document.getElementById("rl");
  rl.textContent = confidence_label.toUpperCase();
  rl.style.color = confidence_label==="High"?"var(--green)":confidence_label==="Moderate"?"var(--amber)":"var(--red)";

  document.getElementById("rBody").innerHTML=`
    <tr><td>STATUS</td><td style="color:${habitable?"var(--green)":"#fca5a5"}">${habitable?"✓ POTENTIALLY HABITABLE":"✗ NON-HABITABLE"}</td></tr>
    <tr><td>CATEGORY</td><td>${category.toUpperCase()}</td></tr>
    <tr><td>CONFIDENCE</td><td>${confidence_score.toFixed(4)} (${pct}%)</td></tr>
    <tr><td>LEVEL</td><td>${confidence_label.toUpperCase()}</td></tr>
    <tr><td>DESCRIPTION</td><td>${description}</td></tr>
  `;
  document.getElementById("resultBox").scrollIntoView({behavior:"smooth",block:"nearest"});
}

function showErr(msg) {
  document.getElementById("errBox").classList.remove("d-none");
  document.getElementById("resultBox").classList.add("d-none");
  document.getElementById("errMsg").textContent = msg;
}

document.getElementById("predictForm").addEventListener("submit", async e => {
  e.preventDefault();
  if (!validate()) return;
  const btn  = document.getElementById("subBtn");
  const lbl  = document.getElementById("subLbl");
  const spin = document.getElementById("subSpin");
  btn.disabled=true; lbl.textContent="ANALYZING"; spin.classList.remove("d-none");
  try {
    const res  = await fetch(API+"/predict",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(buildPayload())});
    const data = await res.json();
    if (!res.ok||data.status==="error") showErr(data.message||"SERVER ERROR");
    else showResult(data);
  } catch {
    showErr("CANNOT REACH FLASK SERVER AT "+API+" — RUN: python app.py");
  } finally {
    btn.disabled=false; lbl.textContent="ANALYZE"; spin.classList.add("d-none");
  }
});

function fillExample() {
  Object.entries(EXAMPLE).forEach(([k,v])=>{
    if (k==="star_type") {
      const r=document.querySelector(`input[name="stype"][value="${v}"]`);
      if(r) r.checked=true;
    } else {
      const el=document.getElementById(k);
      if(el){el.value=v;el.classList.remove("invalid");}
    }
  });
  document.getElementById("stErr").classList.add("d-none");
}

function resetForm() {
  document.getElementById("predictForm").reset();
  FIELDS.forEach(({id})=>document.getElementById(id).classList.remove("invalid"));
  document.getElementById("stErr").classList.add("d-none");
  document.getElementById("resultBox").classList.add("d-none");
  document.getElementById("errBox").classList.add("d-none");
  document.getElementById("cBar").style.width="0";
}

FIELDS.forEach(({id,min,max})=>{
  document.getElementById(id).addEventListener("input",function(){
    if(!this.classList.contains("invalid")) return;
    const v=parseFloat(this.value);
    if(!isNaN(v)&&v>=min&&v<=max) this.classList.remove("invalid");
  });
});

/* ══════════════════════════════════════════════════════════
   BATCH
══════════════════════════════════════════════════════════ */
function swTab(t) {
  document.getElementById("tj").classList.toggle("active",t==="json");
  document.getElementById("tc").classList.toggle("active",t==="csv");
  document.getElementById("pj").classList.toggle("d-none",t!=="json");
  document.getElementById("pc").classList.toggle("d-none",t!=="csv");
}
function loadSample() {
  document.getElementById("bJson").value=JSON.stringify(BATCH_SAMPLE,null,2);
  swTab("json");
}
function handleCsv(input) {
  const f=input.files[0]; if(!f) return;
  const reader=new FileReader();
  reader.onload=e=>{
    document.getElementById("bJson").value=e.target.result.split("\n").slice(0,5).join("\n");
    swTab("json");
  };
  reader.readAsText(f);
}
async function runBatch() {
  const raw=document.getElementById("bJson").value.trim();
  if(!raw){alert("LOAD SAMPLE DATA FIRST");return;}
  let planets;
  try{planets=JSON.parse(raw);}catch{alert("INVALID JSON FORMAT");return;}
  if(!Array.isArray(planets)||!planets.length){alert("MUST BE A JSON ARRAY");return;}
  const btn=document.getElementById("bBtn");
  const spin=document.getElementById("bSpin");
  btn.disabled=true; spin.classList.remove("d-none");
  const results=await Promise.all(planets.map(async(p,i)=>{
    const name=p.name||`PLANET_${i+1}`;
    const payload={...p};delete payload.name;
    if(!payload.star_G&&!payload.star_K&&!payload.star_M&&!payload.star_Unknown) payload.star_G=1;
    try{
      const r=await fetch(API+"/predict",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
      const d=await r.json();
      if(d.status==="success") return{name,...d.prediction};
      return{name,error:d.message};
    }catch{return{name,error:"CONNECTION FAILED"};}
  }));
  const out=document.getElementById("bOut");
  out.classList.remove("d-none");
  out.innerHTML=results.map(r=>r.error
    ?`<div class="bi"><span class="bi-n">${r.name}</span><span style="color:#fca5a5;font-size:9px;font-family:var(--font-m)">${r.error}</span></div>`
    :`<div class="bi"><span class="bi-n">${r.name}</span><span class="bi-s">${(r.confidence_score*100).toFixed(1)}%</span><span class="${r.habitable?"bi-bh":"bi-bn"}">${r.habitable?"HABITABLE":"NON-HAB"}</span></div>`
  ).join("");
  btn.disabled=false; spin.classList.add("d-none");
}

/* ══════════════════════════════════════════════════════════
   RANKING
══════════════════════════════════════════════════════════ */
const RANK_DATA = [
  {name:"Kepler-442b",   hi:.78,sc:.88,os:.91,t:233,r:1.34,m:2.3, op:112.3,ax:.409,e:.04,d:6.1,f:.73,st:4402,sl:-.63,sm:.14,ss:.61,K:1},
  {name:"Earth-Twin-1",  hi:.95,sc:.96,os:.98,t:288,r:1.0, m:1.0, op:365,  ax:1.0, e:.017,d:5.5,f:1.0,st:5778,sl:0,   sm:0,  ss:1.0, G:1},
  {name:"TRAPPIST-1e",   hi:.82,sc:.79,os:.85,t:251,r:.91, m:.69, op:6.1,  ax:.029,e:.02, d:7.6,f:.66,st:2559,sl:-3.28,sm:.04,ss:.09, M:1},
  {name:"TOI-700d",      hi:.76,sc:.80,os:.87,t:268,r:1.19,m:1.57,op:37.4, ax:.163,e:.04, d:5.3,f:.87,st:3480,sl:-2.3, sm:.0, ss:.415,M:1},
  {name:"Kepler-62f",    hi:.68,sc:.72,os:.88,t:208,r:1.41,m:2.8, op:267,  ax:.718,e:.09, d:5.1,f:.41,st:4925,sl:-.78,sm:-.37,ss:.69,K:1},
  {name:"Proxima Cen b", hi:.71,sc:.75,os:.80,t:270,r:1.1, m:1.27,op:11.2, ax:.0485,e:.1,d:5.8,f:.65,st:3050,sl:-1.49,sm:.21,ss:.123,M:1},
  {name:"Kepler-1649c",  hi:.74,sc:.82,os:.83,t:234,r:1.06,m:1.2, op:19.5, ax:.0855,e:.04,d:5.8,f:.75,st:3240,sl:-2.87,sm:.0,ss:.198,M:1},
  {name:"Gliese-667Cc",  hi:.65,sc:.70,os:.76,t:277,r:1.5, m:3.7, op:28.1, ax:.125,e:.002,d:5.5,f:.88,st:3350,sl:-1.9,sm:.27,ss:.31, M:1},
];

async function loadRank() {
  const min   = parseFloat(document.getElementById("rmin").value);
  const count = parseInt(document.getElementById("rcnt").value);
  const empty = document.getElementById("rankEmpty");
  const out   = document.getElementById("rankOut");
  empty.textContent = "LOADING..."; out.classList.add("d-none");

  const results = await Promise.all(RANK_DATA.slice(0,count).map(async p=>{
    const payload = {
      planet_radius:p.r, planet_mass:p.m, orbital_period:p.op, semi_major_axis:p.ax,
      equilibrium_temperature:p.t, orbital_eccentricity:p.e, planet_density:p.d,
      insolation_flux:p.f, star_temperature:p.st, star_luminosity:p.sl,
      star_metallicity:p.sm, star_mass:p.ss,
      habitability_index:p.hi, stellar_compatibility:p.sc, orbital_stability:p.os,
      star_G:p.G||0, star_K:p.K||0, star_M:p.M||0, star_Unknown:0,
    };
    try {
      const r=await fetch(API+"/predict",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
      const d=await r.json();
      if(d.status==="success") return{name:p.name,...d.prediction};
    } catch {}
    return{name:p.name,habitable:p.hi>.7,confidence_score:p.hi,confidence_label:p.hi>=.8?"High":p.hi>=.6?"Moderate":"Low",category:p.hi>.7?"Potentially Habitable":"Non-Habitable"};
  }));

  const filtered = results
    .filter(r=>r.confidence_score>=min)
    .sort((a,b)=>b.confidence_score-a.confidence_score)
    .slice(0,count);

  empty.textContent = filtered.length?"":"NO PLANETS MEET MINIMUM SCORE";
  if (filtered.length) {
    out.classList.remove("d-none");
    out.innerHTML=`
      <table class="rank-tbl">
        <thead><tr><th>#</th><th>PLANET</th><th>SCORE</th><th>LEVEL</th><th>STATUS</th></tr></thead>
        <tbody>${filtered.map((r,i)=>`
          <tr>
            <td style="color:var(--text-s)">${String(i+1).padStart(2,"0")}</td>
            <td>${r.name}</td>
            <td style="color:var(--cyan)">${(r.confidence_score*100).toFixed(1)}%</td>
            <td>${r.confidence_label.toUpperCase()}</td>
            <td><span class="${r.habitable?"rbh":"rbn"}">${r.habitable?"HAB":"NON-HAB"}</span></td>
          </tr>`).join("")}
        </tbody>
      </table>`;
  }
}
