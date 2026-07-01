(function(){
"use strict";
const D = window.SURGCHECK;
const $ = (s,r=document)=>r.querySelector(s);
const $$ = (s,r=document)=>Array.from(r.querySelectorAll(s));
const FRAMES_DIR = "static/images/frames/";
const CUE_ORDER = ["box","arrow","position","word"];
const CUE_META = {
  box:{name:"Red Box", dots:4, desc:"A red bounding box is drawn directly on the target region — the most explicit visual pointer."},
  arrow:{name:"Red Arrow", dots:4, desc:"A red arrow points straight at the target, giving direct visual localization."},
  position:{name:"Spatial Position", dots:3, desc:"Describes the target's approximate location in the frame (e.g. “bottom-right of the image”) — coarse spatial grounding."},
  word:{name:"Periphrasis", dots:2, desc:"Identifies the target through a contextual relationship (e.g. “the tool used by the operator's right hand”) without revealing its name — the least explicit cue."}
};

/* ---------- reveal on scroll ---------- */
const io = new IntersectionObserver((es)=>{
  es.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add("in"); io.unobserve(e.target);} });
},{threshold:.12});
$$(".reveal").forEach(el=>io.observe(el));

/* ---------- nav shadow ---------- */
const nav=$("#nav");
addEventListener("scroll",()=>{ nav.classList.toggle("scrolled", scrollY>10); },{passive:true});

/* ---------- count-up ---------- */
function countUp(el){
  const target=parseFloat(el.dataset.count);
  const suffix=el.dataset.suffix||"";
  const isFloat=el.dataset.count.includes(".");
  const dur=1400, t0=performance.now();
  function step(t){
    const p=Math.min(1,(t-t0)/dur);
    const e=1-Math.pow(1-p,3);
    let v=target*e;
    let txt = isFloat ? v.toFixed(1) : Math.round(v).toLocaleString();
    el.textContent = (suffix==="pt"? "−"+txt : txt) + (suffix&&suffix!=="pt"?suffix:"");
    if(p<1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
const ioc=new IntersectionObserver((es)=>{
  es.forEach(e=>{ if(e.isIntersecting){ countUp(e.target); ioc.unobserve(e.target);} });
},{threshold:.5});
$$(".stat .num").forEach(el=>ioc.observe(el));

/* ---------- word diff highlight ---------- */
function tokset(s){ return new Set(s.toLowerCase().replace(/[^a-z0-9' ]/g," ").split(/\s+/).filter(Boolean)); }
function highlight(sentence, otherSet, cls){
  return sentence.split(/(\s+)/).map(tok=>{
    const clean=tok.toLowerCase().replace(/[^a-z0-9']/g,"");
    if(clean && !otherSet.has(clean)) return `<span class="${cls}">${tok}</span>`;
    return tok;
  }).join("");
}

/* ---------- PAIRED-QUESTION EXPLORER ---------- */
const EX = { frame:0, cue:"box", cat:null };
function exFrame(){ return D.explorer[EX.frame]; }
function exAvailCues(){ return CUE_ORDER.filter(c=>exFrame().cues[c]); }
function exCats(){ const c=exFrame().cues[EX.cue]; return c?Object.keys(c.cats):[]; }

function buildThumbs(){
  const wrap=$("#exp-thumbs"); wrap.innerHTML="";
  D.explorer.forEach((f,i)=>{
    const rep = (f.cues.word||f.cues.position||Object.values(f.cues)[0]).img;
    const img=document.createElement("img");
    img.src=FRAMES_DIR+rep; img.loading="lazy"; img.alt="frame "+(i+1);
    img.className = i===EX.frame?"active":"";
    img.onclick=()=>{ EX.frame=i; if(!exFrame().cues[EX.cue]) EX.cue=exAvailCues()[0]; EX.cat=null; renderExplorer(); };
    wrap.appendChild(img);
  });
}
function chip(label,active,on){
  const b=document.createElement("button");
  b.className="chip"+(active?" active":""); b.textContent=label; b.onclick=on; return b;
}
function renderExplorer(){
  // cue chips
  const cueWrap=$("#exp-cues"); cueWrap.innerHTML="";
  exAvailCues().forEach(c=>cueWrap.appendChild(chip(CUE_META[c].name, c===EX.cue, ()=>{ EX.cue=c; EX.cat=null; renderExplorer(); })));
  // cat chips
  const cats=exCats();
  if(!EX.cat || !cats.includes(EX.cat)) EX.cat=cats[0];
  const catWrap=$("#exp-cats"); catWrap.innerHTML="";
  cats.forEach(ct=>catWrap.appendChild(chip(ct, ct===EX.cat, ()=>{ EX.cat=ct; renderExplorer(); })));
  // content
  const cueObj=exFrame().cues[EX.cue];
  const qa=cueObj.cats[EX.cat];
  $("#exp-img").src=FRAMES_DIR+cueObj.img;
  const so=tokset(qa.orig), sl=tokset(qa.less);
  $("#exp-q-orig").innerHTML=highlight(qa.orig, sl, "hl");
  $("#exp-q-less").innerHTML=highlight(qa.less, so, "hl-less");
  $("#exp-answer").textContent=qa.answer;
  $("#exp-answer-badge").textContent="answer: "+qa.answer;
  // thumbs active state
  $$("#exp-thumbs img").forEach((im,i)=>im.classList.toggle("active",i===EX.frame));
}

/* ---------- CUE TABS (explainer) ---------- */
let CUE_TAB="box";
function cueExampleQA(cue){
  // find a frame with this cue + Action (fallback first cat)
  for(const f of D.explorer){
    const c=f.cues[cue];
    if(c){ const cat=c.cats["Action"]?"Action":Object.keys(c.cats)[0]; return {qa:c.cats[cat], img:c.img}; }
  }
  return null;
}
function buildCueTabs(){
  const wrap=$("#cue-tabs"); wrap.innerHTML="";
  CUE_ORDER.forEach(c=>{
    const m=CUE_META[c];
    const t=document.createElement("div");
    t.className="cue-tab"+(c===CUE_TAB?" active":"");
    t.innerHTML=`<b>${m.name}</b><span>${c==="box"||c==="arrow"?"visual pointer":"textual reference"}</span>`;
    t.onclick=()=>{ CUE_TAB=c; renderCue(); };
    wrap.appendChild(t);
  });
}
function renderCue(){
  $$("#cue-tabs .cue-tab").forEach((t,i)=>t.classList.toggle("active",CUE_ORDER[i]===CUE_TAB));
  const m=CUE_META[CUE_TAB];
  const ex=cueExampleQA(CUE_TAB);
  $("#cue-name").textContent=m.name;
  $("#cue-desc").textContent=m.desc;
  $("#cue-bar").innerHTML=`<span class="dots">${"●".repeat(m.dots)}${"○".repeat(4-m.dots)}</span>`;
  if(ex){
    $("#cue-img").src=FRAMES_DIR+ex.img;
    const so=tokset(ex.qa.orig), sl=tokset(ex.qa.less);
    $("#cue-q-orig").innerHTML=highlight(ex.qa.orig, sl, "hl");
    $("#cue-q-less").innerHTML=highlight(ex.qa.less, so, "hl-less");
  }
}

/* ---------- SORTABLE TABLES ---------- */
function buildTable(id, spec, deltaPairs){
  const el=$("#"+id);
  const {cols,rows}=spec;
  const state={col:null,dir:1};
  // column max for bars (numeric cols)
  function colMax(ci){ return Math.max(...rows.map(r=>Math.abs(+r[ci]||0))); }
  function render(){
    const data=rows.slice();
    if(state.col!==null){
      data.sort((a,b)=>{
        let x=a[state.col],y=b[state.col];
        if(typeof x==="number") return (x-y)*state.dir;
        return String(x).localeCompare(String(y))*state.dir;
      });
    }
    let h="<thead><tr>"+cols.map((c,ci)=>{
      let cl=""; if(state.col===ci) cl=state.dir>0?"sort-asc":"sort-desc";
      return `<th class="${cl}" data-ci="${ci}">${c}</th>`;
    }).join("")+"</tr></thead><tbody>";
    data.forEach(r=>{
      h+="<tr>"+r.map((v,ci)=>{
        if(ci===0) return `<td>${v}</td>`;
        const mx=colMax(ci); const w=mx?Math.round(Math.abs(v)/mx*100):0;
        let delta="";
        const dp=deltaPairs&&deltaPairs.find(p=>p.less===ci);
        if(dp){ const d=(v-r[dp.orig]); const cls=d<0?"down":"up";
          delta=`<span class="delta ${cls}">${d<0?"▼":"▲"}${Math.abs(d).toFixed(2)}</span>`; }
        return `<td><span class="cell">${(+v).toFixed(2)}${delta}<span class="bar-cell" style="width:${w}%"></span></span></td>`;
      }).join("")+"</tr>";
    });
    h+="</tbody>";
    el.innerHTML=h;
    $$("thead th",el).forEach(th=>th.onclick=()=>{
      const ci=+th.dataset.ci;
      if(state.col===ci) state.dir*=-1; else {state.col=ci;state.dir=(ci===0?1:-1);}
      render();
    });
  }
  render();
}

/* ---------- RADAR CHARTS ---------- */
Chart.defaults.font.family="Inter, sans-serif";
Chart.defaults.color="#5c6b73";
const BLUE="#3f7fb0", GREEN="#8bab54";
function makeRadar(canvasId, btnId, spec){
  const models=Object.keys(spec.models);
  let cur=models.find(m=>m.includes("LLaVA"))||models[0];
  const ctx=$("#"+canvasId).getContext("2d");
  const chart=new Chart(ctx,{
    type:"radar",
    data:{labels:spec.axes,datasets:[]},
    options:{
      responsive:true,maintainAspectRatio:true,
      animation:{duration:600},
      scales:{r:{suggestedMin:0,suggestedMax:Math.max(...Object.values(spec.models).flatMap(m=>m.orig.concat(m.less)))*1.05,
        ticks:{backdropColor:"transparent",stepSize:20},grid:{color:"#e2e8ea"},angleLines:{color:"#e2e8ea"},
        pointLabels:{font:{size:12,weight:"600"},color:"#16232b"}}},
      plugins:{legend:{position:"bottom"},tooltip:{callbacks:{label:c=>`${c.dataset.label}: ${c.formattedValue}`}}}
    }
  });
  function update(){
    const m=spec.models[cur];
    chart.data.datasets=[
      {label:"Original",data:m.orig,borderColor:BLUE,backgroundColor:"rgba(63,127,176,.22)",borderWidth:2,pointBackgroundColor:BLUE},
      {label:"Less-biased",data:m.less,borderColor:GREEN,backgroundColor:"rgba(139,171,84,.22)",borderWidth:2,pointBackgroundColor:GREEN}
    ];
    chart.update();
  }
  const bwrap=$("#"+btnId);
  models.forEach(m=>{
    bwrap.appendChild(chip(spec.models[m].disp, m===cur, ()=>{ cur=m; $$(".chip",bwrap).forEach((b,i)=>b.classList.toggle("active",models[i]===cur)); update(); }));
  });
  update();
}

/* ---------- ABLATION BAR ---------- */
function makeAblation(){
  const a=D.ablation;
  new Chart($("#barAbl").getContext("2d"),{
    type:"bar",
    data:{labels:a.cats,datasets:[
      {label:"Original (image)",data:a["Original"],backgroundColor:BLUE},
      {label:"Text-only (no image)",data:a["Text-only"],backgroundColor:"#e8c58c"},
      {label:"Less-biased (image)",data:a["Less-bias"],backgroundColor:GREEN}
    ]},
    options:{responsive:true,maintainAspectRatio:false,animation:{duration:800},
      scales:{y:{beginAtZero:true,max:90,title:{display:true,text:"F1-Score"},grid:{color:"#eef2f3"}},x:{grid:{display:false}}},
      plugins:{legend:{position:"bottom"},tooltip:{callbacks:{label:c=>`${c.dataset.label}: ${c.formattedValue}`}}}}
  });
}

/* ---------- BIBTEX COPY ---------- */
$("#copy-bib").onclick=function(){
  navigator.clipboard.writeText($("#bibtex").textContent).then(()=>{
    this.textContent="Copied!"; this.classList.add("done");
    setTimeout(()=>{this.textContent="Copy";this.classList.remove("done");},1600);
  });
};

/* ---------- INIT ---------- */
buildThumbs(); renderExplorer();
buildCueTabs(); renderCue();
buildTable("table1", D.table1, [{orig:1,less:2},{orig:3,less:4}]);
buildTable("table2", D.table2, [{orig:1,less:2},{orig:3,less:4}]);
makeRadar("radarCat","cat-model-btns",D.radarCategory);
makeRadar("radarCue","cue-model-btns",D.radarCue);
makeAblation();
})();
