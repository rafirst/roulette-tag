(function(){
  var COLORS=['#00F0FF','#FF0055','#FAFF00'];
  var SAMPLE=['Voucher Game','Skin Langka','Merchandise','Zonk','Top-up 50K','Headset RGB','Stiker Neon','Coba Lagi'];
  var items=[],history=[],rot=0,spinning=false,lastIdx=-1,audio=null;
  var $=function(id){return document.getElementById(id)};
  var cv=$('wheel'),ctx=cv.getContext('2d');

  try{var s=JSON.parse(localStorage.getItem('neon-items'));if(Array.isArray(s)&&s.length)items=s.slice(0,40);}catch(e){}
  if(!items.length)items=SAMPLE.slice();
  function save(){try{localStorage.setItem('neon-items',JSON.stringify(items))}catch(e){}}

  function color(i){return COLORS[i%3]}
  function size(){
    var r=cv.getBoundingClientRect(),d=Math.min(window.devicePixelRatio||1,2);
    cv.width=Math.round(r.width*d);cv.height=Math.round(r.height*d);draw();
  }
  function hexA(h,a){var n=parseInt(h.slice(1),16);return 'rgba('+(n>>16)+','+((n>>8)&255)+','+(n&255)+','+a+')'}

  function draw(){
    var W=cv.width,c=W/2,R=c*0.93,n=items.length;
    ctx.clearRect(0,0,W,W);
    // outer ring
    ctx.save();ctx.shadowColor='#00F0FF';ctx.shadowBlur=W*0.04;
    ctx.beginPath();ctx.arc(c,c,R+W*0.02,0,7);ctx.strokeStyle='#00F0FF';ctx.lineWidth=W*0.008;ctx.stroke();ctx.restore();
    if(!n){
      ctx.beginPath();ctx.arc(c,c,R,0,7);ctx.fillStyle='rgba(10,14,22,.9)';ctx.fill();
      ctx.fillStyle='#7f93a8';ctx.textAlign='center';ctx.font='600 '+W*0.04+'px Rajdhani,sans-serif';
      ctx.fillText('Tambahkan hadiah ',c,c);return;
    }
    var arc=Math.PI*2/n;
    for(var i=0;i<n;i++){
      var a0=rot+i*arc,a1=a0+arc,col=color(i);
      ctx.beginPath();ctx.moveTo(c,c);ctx.arc(c,c,R,a0,a1);ctx.closePath();
      var g=ctx.createRadialGradient(c,c,R*0.1,c,c,R);
      g.addColorStop(0,'rgba(11,14,20,.95)');g.addColorStop(1,hexA(col,.28));
      ctx.fillStyle=g;ctx.fill();
      ctx.save();ctx.shadowColor=col;ctx.shadowBlur=W*0.012;
      ctx.strokeStyle=col;ctx.lineWidth=Math.max(1.5,W*0.003);ctx.stroke();ctx.restore();
      // label
      ctx.save();ctx.translate(c,c);ctx.rotate(a0+arc/2);
      var fs=Math.max(W*0.026,Math.min(W*0.055,R*arc*0.3));
      ctx.font='700 '+fs+'px Rajdhani,sans-serif';ctx.textAlign='right';ctx.textBaseline='middle';
      var t=items[i],maxW=R*0.66;
      while(ctx.measureText(t).width>maxW&&t.length>2)t=t.slice(0,-2);
      if(t!==items[i])t=t.trim()+'…';
      ctx.shadowColor=col;ctx.shadowBlur=W*0.012;ctx.fillStyle='#fff';
      ctx.fillText(t,R*0.92,0);ctx.restore();
    }
    // tick dots on rim
    for(var j=0;j<n;j++){
      var a=rot+j*arc;ctx.beginPath();ctx.arc(c+Math.cos(a)*(R+W*0.02),c+Math.sin(a)*(R+W*0.02),W*0.007,0,7);
      ctx.fillStyle='#FAFF00';ctx.shadowColor='#FAFF00';ctx.shadowBlur=W*0.02;ctx.fill();ctx.shadowBlur=0;
    }
    // hub
    ctx.save();ctx.shadowColor='#FF0055';ctx.shadowBlur=W*0.03;
    ctx.beginPath();ctx.arc(c,c,W*0.07,0,7);ctx.fillStyle='#0B0E14';ctx.fill();
    ctx.strokeStyle='#FF0055';ctx.lineWidth=W*0.008;ctx.stroke();ctx.restore();
    ctx.beginPath();ctx.arc(c,c,W*0.02,0,7);ctx.fillStyle='#FAFF00';ctx.fill();
  }

  function idxAt(r){
    var n=items.length,arc=Math.PI*2/n,v=((-Math.PI/2-r)%(Math.PI*2)+Math.PI*2)%(Math.PI*2);
    return Math.floor(v/arc)%n;
  }

  // ---- audio
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
  function tick(){tone(900,.05,'square',.04);var p=$('pointer');p.classList.remove('hit');void p.offsetWidth;p.classList.add('hit')}
  function fanfare(){[523,659,784,1047].forEach(function(f,i){tone(f,.25,'sawtooth',.05,i*.1)})}

  // ---- spin
  function spin(){
    if(spinning||items.length<2)return;
    $('overlay').classList.remove('show');
    spinning=true;$('spinBtn').disabled=true;ac();
    var n=items.length,arc=Math.PI*2/n,win=Math.floor(Math.random()*n);
    var jitter=(Math.random()-.5)*arc*0.7;
    var want=((-Math.PI/2-(win+.5)*arc+jitter)%(Math.PI*2)+Math.PI*2)%(Math.PI*2);
    var cur=((rot%(Math.PI*2))+Math.PI*2)%(Math.PI*2);
    var delta=((want-cur)+Math.PI*2)%(Math.PI*2)+Math.PI*2*(6+Math.floor(Math.random()*3));
    var start=rot,dur=5200,t0=performance.now();lastIdx=idxAt(rot);
    (function frame(now){
      var p=Math.min((now-t0)/dur,1),e=1-Math.pow(1-p,4);
      rot=start+delta*e;
      var i=idxAt(rot);if(i!==lastIdx){lastIdx=i;tick()}
      draw();
      if(p<1)requestAnimationFrame(frame);else finish(win);
    })(t0);
  }
  function finish(win){
    spinning=false;$('spinBtn').disabled=items.length<2;
    var name=items[win];
    history.unshift(name);if(history.length>30)history.pop();
    $('winName').textContent=name;$('live').textContent='Pemenang: '+name;
    $('overlay').classList.add('show');$('again').focus();fanfare();
    if($('removeWin').checked){items.splice(win,1);save();renderList();draw();}
    renderHist();
  }

  // ---- list UI
  function renderList(){
    var ul=$('items');ul.innerHTML='';
    items.forEach(function(t,i){
      var li=document.createElement('li');li.style.setProperty('--c',color(i));
      var s=document.createElement('span');s.textContent=t;
      var b=document.createElement('button');b.className='x';b.type='button';b.textContent='×';b.setAttribute('aria-label','Hapus '+t);
      b.onclick=function(){if(spinning)return;items.splice(i,1);save();renderList();draw()};
      li.appendChild(s);li.appendChild(b);ul.appendChild(li);
    });
    $('count').textContent=items.length+' item';
    $('spinBtn').disabled=spinning||items.length<2;
  }
  function renderHist(){
    var ul=$('history');ul.innerHTML='';
    history.forEach(function(t,i){
      var li=document.createElement('li'),b=document.createElement('b'),s=document.createElement('span');
      b.textContent='#'+(history.length-i);s.textContent=t;li.appendChild(b);li.appendChild(s);ul.appendChild(li);
    });
    $('histEmpty').style.display=history.length?'none':'block';
  }
  function add(){
    var v=$('newItem').value.trim();if(!v||spinning||items.length>=40)return;
    items.push(v);$('newItem').value='';save();renderList();draw();$('newItem').focus();
  }

  $('spinBtn').onclick=spin;
  $('toggleList').onclick=function(){
    var expanded=this.getAttribute('aria-expanded')!=='true';
    this.setAttribute('aria-expanded',String(expanded));
    this.textContent=expanded?'DAFTAR':'DAFTAR';
    $('mainLayout').classList.toggle('sidebar-hidden',!expanded);
    $('side').setAttribute('aria-hidden',String(!expanded));
    $('side').inert=!expanded;
  };
  $('addBtn').onclick=add;
  $('newItem').addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();add()}});
  $('sample').onclick=function(){if(spinning)return;items=SAMPLE.slice();save();renderList();draw()};
  $('clear').onclick=function(){if(spinning)return;items=[];save();renderList();draw()};
  $('clearHist').onclick=function(){history=[];renderHist()};
  $('again').onclick=spin;
  $('close').onclick=function(){$('overlay').classList.remove('show')};
  $('overlay').addEventListener('click',function(e){if(e.target===this)this.classList.remove('show')});
  document.addEventListener('keydown',function(e){if(e.key==='Escape')$('overlay').classList.remove('show')});
  window.addEventListener('resize',size);

  renderList();renderHist();size();
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(draw);
})();