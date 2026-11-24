(function(){
  var SAMPLE=['Voucher Game','Skin Langka','Merchandise','Zonk','Top-up 50K','Headset RGB','Stiker Eksklusif','Coba Lagi'];
  var items=[],history=[],rot=0,spinning=false,lastIdx=-1,audio=null;
  var $=function(id){return document.getElementById(id)};
  var cv=$('wheel'),ctx=cv.getContext('2d'),TAU=Math.PI*2;

  try{var s=JSON.parse(localStorage.getItem('velvet-items'));if(Array.isArray(s)&&s.length)items=s.slice(0,40);}catch(e){}
  if(!items.length)items=SAMPLE.slice();
  function save(){try{localStorage.setItem('velvet-items',JSON.stringify(items))}catch(e){}}

  // merah marun / hitam arang bergantian; jika jumlah ganjil, segmen terakhir hijau (seperti kantong nol)
  function segColor(i,n){if(n%2&&i===n-1&&n>1)return '#0A3622';return i%2?'#1A1A1A':'#8B0000'}
  function size(){
    var r=cv.getBoundingClientRect(),d=Math.min(window.devicePixelRatio||1,2);
    cv.width=Math.round(r.width*d);cv.height=Math.round(r.height*d);draw();
  }
  function goldGrad(c,r0,r1){
    if(ctx.createConicGradient){
      var g=ctx.createConicGradient(0.35,c,c);
      ['#8a6a12','#f6e27a','#D4AF37','#7d5e10','#f9eaa0','#D4AF37','#8a6a12'].forEach(function(col,i,a){g.addColorStop(i/(a.length-1),col)});
      return g;
    }
    var l=ctx.createLinearGradient(0,0,c*2,c*2);l.addColorStop(0,'#f6e27a');l.addColorStop(.5,'#8a6a12');l.addColorStop(1,'#f6e27a');return l;
  }

  function draw(){
    var W=cv.width,c=W/2,Rf=c*0.98,R=c*0.84,n=items.length,i;
    ctx.clearRect(0,0,W,W);
    // bingkai emas
    ctx.beginPath();ctx.arc(c,c,Rf,0,TAU);ctx.arc(c,c,R,0,TAU,true);ctx.fillStyle=goldGrad(c);ctx.fill();
    ctx.lineWidth=W*0.004;ctx.strokeStyle='rgba(60,40,0,.7)';ctx.beginPath();ctx.arc(c,c,Rf,0,TAU);ctx.stroke();
    ctx.beginPath();ctx.arc(c,c,R,0,TAU);ctx.stroke();
    // kilau alur di bingkai
    var rg=ctx.createRadialGradient(c,c,R,c,c,Rf);rg.addColorStop(0,'rgba(0,0,0,.35)');rg.addColorStop(.35,'rgba(255,255,255,.18)');rg.addColorStop(1,'rgba(0,0,0,.3)');
    ctx.beginPath();ctx.arc(c,c,Rf,0,TAU);ctx.arc(c,c,R,0,TAU,true);ctx.fillStyle=rg;ctx.fill();
    // paku emas
    for(i=0;i<24;i++){var a=i*TAU/24,pr=(R+Rf)/2,px=c+Math.cos(a)*pr,py=c+Math.sin(a)*pr;
      var sg=ctx.createRadialGradient(px-W*.004,py-W*.004,0,px,py,W*.014);sg.addColorStop(0,'#fff6c8');sg.addColorStop(.5,'#D4AF37');sg.addColorStop(1,'#6b4f0c');
      ctx.beginPath();ctx.arc(px,py,W*0.012,0,TAU);ctx.fillStyle=sg;ctx.fill();}
    if(!n){
      ctx.beginPath();ctx.arc(c,c,R,0,TAU);ctx.fillStyle='#0d1f16';ctx.fill();
      ctx.fillStyle='#9fb8a8';ctx.textAlign='center';ctx.font='500 '+W*0.035+'px Inter,sans-serif';ctx.fillText('Tambahkan hadiah',c,c);return;
    }
    var arc=TAU/n;
    for(i=0;i<n;i++){
      var a0=rot+i*arc,a1=a0+arc;
      ctx.beginPath();ctx.moveTo(c,c);ctx.arc(c,c,R,a0,a1);ctx.closePath();
      ctx.fillStyle=segColor(i,n);ctx.fill();
      ctx.strokeStyle='#D4AF37';ctx.lineWidth=Math.max(1.5,W*0.0035);ctx.stroke();
      ctx.save();ctx.translate(c,c);ctx.rotate(a0+arc/2);ctx.textBaseline='middle';ctx.textAlign='right';
      var fs=Math.max(W*0.018,Math.min(W*0.048,R*arc*0.22));
      ctx.font='600 '+fs*0.75+'px Inter,sans-serif';ctx.fillStyle='#F6E27A';ctx.fillText(String(i+1),R*0.95,0);
      ctx.font='600 '+fs+'px Inter,sans-serif';
      var t=items[i],maxW=R*0.6;
      while(ctx.measureText(t).width>maxW&&t.length>2)t=t.slice(0,-2);
      if(t!==items[i])t=t.trim()+'…';
      ctx.shadowColor='rgba(0,0,0,.7)';ctx.shadowBlur=W*0.006;ctx.fillStyle='#F4EAD0';ctx.fillText(t,R*0.86,0);
      ctx.restore();
    }
    // kedalaman: bayangan dalam di tepi + kilap
    var ig=ctx.createRadialGradient(c,c,R*0.7,c,c,R);ig.addColorStop(0,'rgba(0,0,0,0)');ig.addColorStop(1,'rgba(0,0,0,.45)');
    ctx.beginPath();ctx.arc(c,c,R,0,TAU);ctx.fillStyle=ig;ctx.fill();
    var gl=ctx.createRadialGradient(c*0.7,c*0.55,0,c*0.7,c*0.55,R*1.1);gl.addColorStop(0,'rgba(255,255,255,.2)');gl.addColorStop(.5,'rgba(255,255,255,.04)');gl.addColorStop(1,'rgba(255,255,255,0)');
    ctx.beginPath();ctx.arc(c,c,R,0,TAU);ctx.fillStyle=gl;ctx.fill();
    // hub emas
    ctx.save();ctx.shadowColor='rgba(0,0,0,.6)';ctx.shadowBlur=W*0.02;ctx.shadowOffsetY=W*0.008;
    ctx.beginPath();ctx.arc(c,c,W*0.085,0,TAU);ctx.fillStyle=goldGrad(c);ctx.fill();ctx.restore();
    ctx.lineWidth=W*0.004;ctx.strokeStyle='rgba(60,40,0,.8)';ctx.beginPath();ctx.arc(c,c,W*0.085,0,TAU);ctx.stroke();
    var hg=ctx.createRadialGradient(c-W*.015,c-W*.015,0,c,c,W*0.05);hg.addColorStop(0,'#fff6c8');hg.addColorStop(.6,'#D4AF37');hg.addColorStop(1,'#7d5e10');
    ctx.beginPath();ctx.arc(c,c,W*0.05,0,TAU);ctx.fillStyle=hg;ctx.fill();ctx.stroke();
  }

  function idxAt(r){var n=items.length,arc=TAU/n,v=((-Math.PI/2-r)%TAU+TAU)%TAU;return Math.floor(v/arc)%n}

  function ac(){
    if(!$('sound').checked)return null;
    try{audio=audio||new (window.AudioContext||window.webkitAudioContext)();if(audio.state==='suspended')audio.resume();}catch(e){return null}
    return audio;
  }
  function tone(f,d,type,v,t0){
    var a=ac();if(!a)return;var o=a.createOscillator(),g=a.createGain(),t=a.currentTime+(t0||0);
    o.type=type;o.frequency.value=f;g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);
    o.connect(g);g.connect(a.destination);o.start(t);o.stop(t+d);
  }
  function tick(){tone(1500,.035,'triangle',.06);var p=$('pointer');p.classList.remove('hit');void p.offsetWidth;p.classList.add('hit')}
  function fanfare(){[659,784,988,1319].forEach(function(f,i){tone(f,.5,'sine',.07,i*.12)})}

  function spin(){
    if(spinning||items.length<2)return;
    $('overlay').classList.remove('show');
    spinning=true;$('spinBtn').disabled=true;ac();
    var n=items.length,arc=TAU/n,win=Math.floor(Math.random()*n),jitter=(Math.random()-.5)*arc*0.7;
    var want=((-Math.PI/2-(win+.5)*arc+jitter)%TAU+TAU)%TAU,cur=((rot%TAU)+TAU)%TAU;
    var delta=((want-cur)+TAU)%TAU+TAU*(6+Math.floor(Math.random()*3));
    var start=rot,dur=5600,t0=performance.now();lastIdx=idxAt(rot);
    (function frame(now){
      var p=Math.min((now-t0)/dur,1),e=1-Math.pow(1-p,4);
      rot=start+delta*e;
      var i=idxAt(rot);if(i!==lastIdx){lastIdx=i;tick()}
      draw();
      if(p<1)requestAnimationFrame(frame);else finish(win);
    })(t0);
  }
  function finish(win){
    spinning=false;
    var name=items[win];
    history.unshift(name);if(history.length>30)history.pop();
    $('winName').textContent=name;$('live').textContent='Pemenang: '+name;
    $('overlay').classList.add('show');$('again').focus();fanfare();
    if($('removeWin').checked){items.splice(win,1);save();draw();}
    renderList();renderHist();
  }

  function renderList(){
    var ul=$('items');ul.innerHTML='';
    items.forEach(function(t,i){
      var li=document.createElement('li');li.style.setProperty('--c',segColor(i,items.length)==='#1A1A1A'?'#6d6d6d':segColor(i,items.length)==='#0A3622'?'#1f8f5a':'#c23a3a');
      var k=document.createElement('i');k.textContent=i+1;
      var s=document.createElement('span');s.textContent=t;
      var b=document.createElement('button');b.className='x';b.type='button';b.textContent='×';b.setAttribute('aria-label','Hapus '+t);
      b.onclick=function(){if(spinning)return;items.splice(i,1);save();renderList();draw()};
      li.appendChild(k);li.appendChild(s);li.appendChild(b);ul.appendChild(li);
    });
    $('count').textContent=items.length+' item';
    $('spinBtn').disabled=spinning||items.length<2;
  }
  function renderHist(){
    var ul=$('history');ul.innerHTML='';
    history.forEach(function(t,i){
      var li=document.createElement('li'),b=document.createElement('b'),s=document.createElement('span');
      b.textContent=history.length-i;s.textContent=t;li.appendChild(b);li.appendChild(s);ul.appendChild(li);
    });
    $('histEmpty').style.display=history.length?'none':'block';
  }
  function add(){
    var v=$('newItem').value.trim();if(!v||spinning||items.length>=40)return;
    items.push(v);$('newItem').value='';save();renderList();draw();$('newItem').focus();
  }

  $('spinBtn').onclick=spin;$('again').onclick=spin;$('addBtn').onclick=add;
  $('toggleList').onclick=function(){
    var expanded=this.getAttribute('aria-expanded')!=='true',side=$('side');
    this.setAttribute('aria-expanded',String(expanded));
    $('mainLayout').classList.toggle('sidebar-hidden',!expanded);
    side.setAttribute('aria-hidden',String(!expanded));
    side.inert=!expanded;
  };
  $('newItem').addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();add()}});
  $('sample').onclick=function(){if(spinning)return;items=SAMPLE.slice();save();renderList();draw()};
  $('clear').onclick=function(){if(spinning)return;items=[];save();renderList();draw()};
  $('clearHist').onclick=function(){history=[];renderHist()};
  $('close').onclick=function(){$('overlay').classList.remove('show')};
  $('overlay').addEventListener('click',function(e){if(e.target===this)this.classList.remove('show')});
  document.addEventListener('keydown',function(e){if(e.key==='Escape')$('overlay').classList.remove('show')});
  window.addEventListener('resize',size);

  renderList();renderHist();size();
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(draw);
})();