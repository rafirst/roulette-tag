(function(){
  var TAU=Math.PI*2,RED='#EB0A1E',CHARC='#1E1E24',WHITE='#FFFFFF',CHROME='#CBD5E1';
  var items=[],history=[],rot=0,spinning=false,lastIdx=-1,audio=null,dragging=null,dragPointerId=null;
  var $=function(id){return document.getElementById(id)};
  var cv=$('wheel'),ctx=cv.getContext('2d');

  try{var s=JSON.parse(localStorage.getItem('tag-items-v2'));if(Array.isArray(s)&&s.length)items=s.slice(0,40).map(function(x){return typeof x==='string'?{t:x,f:false}:{t:String(x.t),f:!!x.f}});}catch(e){}
  function save(){try{localStorage.setItem('tag-items-v2',JSON.stringify(items))}catch(e){}}

  // merah = hadiah utama; selain itu putih/arang bergantian; segmen terakhir perak bila jumlah ganjil
  function fill(i,n){if(items[i].f)return RED;if(n%2&&i===n-1&&n>1)return CHROME;return i%2?CHARC:WHITE}
  function ink(f){return(f===WHITE||f===CHROME)?'#141414':'#fff'}
  function size(){var r=cv.getBoundingClientRect(),d=Math.min(window.devicePixelRatio||1,2);cv.width=Math.round(r.width*d);cv.height=Math.round(r.height*d);draw()}
  function chromeGrad(c){
    if(ctx.createConicGradient){var g=ctx.createConicGradient(0.5,c,c);['#f8fafc','#94a3b8','#e2e8f0','#64748b','#f1f5f9','#94a3b8','#cbd5e1','#64748b','#f8fafc'].forEach(function(k,i,a){g.addColorStop(i/(a.length-1),k)});return g}
    var l=ctx.createLinearGradient(0,0,c*2,c*2);l.addColorStop(0,'#f8fafc');l.addColorStop(.5,'#64748b');l.addColorStop(1,'#f8fafc');return l;
  }
  function lines(t,maxW,fs){
    ctx.font='700 '+fs+'px "Plus Jakarta Sans",sans-serif';
    if(ctx.measureText(t).width<=maxW)return{l:[t],fs:fs};
    var w=t.split(' ');
    if(w.length>1){
      var best=null,bw=1e9;
      for(var k=1;k<w.length;k++){var a=w.slice(0,k).join(' '),b=w.slice(k).join(' '),m=Math.max(ctx.measureText(a).width,ctx.measureText(b).width);if(m<bw){bw=m;best=[a,b]}}
      fs*=.86;ctx.font='700 '+fs+'px "Plus Jakarta Sans",sans-serif';
      var l=best;
      while(Math.max(ctx.measureText(l[0]).width,ctx.measureText(l[1]).width)>maxW&&fs>8){fs*=.93;ctx.font='700 '+fs+'px "Plus Jakarta Sans",sans-serif'}
      return{l:l,fs:fs};
    }
    while(ctx.measureText(t).width>maxW&&t.length>2)t=t.slice(0,-2);
    return{l:[t.trim()+'…'],fs:fs};
  }

  function draw(){
    var W=cv.width,c=W/2,Rf=c*0.98,R=c*0.86,n=items.length,i;
    ctx.clearRect(0,0,W,W);
    // velg alloy: bingkai krom
    ctx.beginPath();ctx.arc(c,c,Rf,0,TAU);ctx.arc(c,c,R,0,TAU,true);ctx.fillStyle=chromeGrad(c);ctx.fill();
    var rg=ctx.createRadialGradient(c,c,R,c,c,Rf);rg.addColorStop(0,'rgba(0,0,0,.4)');rg.addColorStop(.4,'rgba(255,255,255,.2)');rg.addColorStop(1,'rgba(0,0,0,.35)');
    ctx.beginPath();ctx.arc(c,c,Rf,0,TAU);ctx.arc(c,c,R,0,TAU,true);ctx.fillStyle=rg;ctx.fill();
    ctx.strokeStyle='#0c0c0e';ctx.lineWidth=W*0.005;ctx.beginPath();ctx.arc(c,c,R,0,TAU);ctx.stroke();ctx.beginPath();ctx.arc(c,c,Rf,0,TAU);ctx.stroke();
    // garis skala ala speedometer
    ctx.strokeStyle='rgba(20,20,24,.6)';
    for(i=0;i<72;i++){var a=i*TAU/72,L=i%6===0?W*0.022:W*0.012,r1=Rf-W*0.007;ctx.lineWidth=i%6===0?W*0.004:W*0.0025;
      ctx.beginPath();ctx.moveTo(c+Math.cos(a)*r1,c+Math.sin(a)*r1);ctx.lineTo(c+Math.cos(a)*(r1-L),c+Math.sin(a)*(r1-L));ctx.stroke();}
    // kilau specular
    var mid=(R+Rf)/2;ctx.save();ctx.lineCap='round';ctx.shadowColor='#fff';ctx.shadowBlur=W*0.015;
    ctx.strokeStyle='rgba(255,255,255,.85)';ctx.lineWidth=W*0.012;ctx.beginPath();ctx.arc(c,c,mid,Math.PI*1.06,Math.PI*1.4);ctx.stroke();
    ctx.strokeStyle='rgba(255,255,255,.45)';ctx.lineWidth=W*0.008;ctx.beginPath();ctx.arc(c,c,mid,Math.PI*0.06,Math.PI*0.3);ctx.stroke();ctx.restore();

    if(!n){ctx.beginPath();ctx.arc(c,c,R,0,TAU);ctx.fillStyle=CHARC;ctx.fill();ctx.fillStyle='#98a2b3';ctx.textAlign='center';ctx.font='600 '+W*0.035+'px "Plus Jakarta Sans",sans-serif';ctx.fillText('Tambahkan hadiah',c,c*0.7);return}
    var arc=TAU/n;
    for(i=0;i<n;i++){
      var a0=rot+i*arc,a1=a0+arc,f=fill(i,n);
      ctx.beginPath();ctx.moveTo(c,c);ctx.arc(c,c,R,a0,a1);ctx.closePath();ctx.fillStyle=f;ctx.fill();
      ctx.strokeStyle=CHROME;ctx.lineWidth=Math.max(2,W*0.004);ctx.stroke();
      ctx.save();ctx.translate(c,c);ctx.rotate(a0+arc/2);ctx.textAlign='right';ctx.textBaseline='middle';
      var fs=Math.max(W*0.026,Math.min(W*0.05,R*arc*0.3)),res=lines(items[i].t,R*0.56,fs);
      ctx.font='700 '+res.fs+'px "Plus Jakarta Sans",sans-serif';ctx.fillStyle=ink(f);
      res.l.forEach(function(tx,k){ctx.fillText(tx,R*0.93,(k-(res.l.length-1)/2)*res.fs*1.12)});
      ctx.restore();
    }
    // kedalaman permukaan
    var ig=ctx.createRadialGradient(c,c,R*0.6,c,c,R);ig.addColorStop(0,'rgba(0,0,0,0)');ig.addColorStop(1,'rgba(0,0,0,.35)');
    ctx.beginPath();ctx.arc(c,c,R,0,TAU);ctx.fillStyle=ig;ctx.fill();
    var gl=ctx.createRadialGradient(c*0.7,c*0.5,0,c*0.7,c*0.5,R*1.1);gl.addColorStop(0,'rgba(255,255,255,.16)');gl.addColorStop(1,'rgba(255,255,255,0)');
    ctx.beginPath();ctx.arc(c,c,R,0,TAU);ctx.fillStyle=gl;ctx.fill();
    // cincin krom di bawah tombol tengah
    ctx.save();ctx.shadowColor='rgba(0,0,0,.6)';ctx.shadowBlur=W*0.025;ctx.beginPath();ctx.arc(c,c,W*0.135,0,TAU);ctx.fillStyle='#0c0c0e';ctx.fill();ctx.restore();
  }

  function idxAt(r){var n=items.length,arc=TAU/n,v=((-Math.PI/2-r)%TAU+TAU)%TAU;return Math.floor(v/arc)%n}

  function ac(){
    if(!$('sound').checked)return null;
    try{audio=audio||new (window.AudioContext||window.webkitAudioContext)();if(audio.state==='suspended')audio.resume();}catch(e){return null}
    return audio;
  }
  function tone(f,d,type,v,t0,f2){
    var a=ac();if(!a)return;var o=a.createOscillator(),g=a.createGain(),t=a.currentTime+(t0||0);
    o.type=type;o.frequency.setValueAtTime(f,t);if(f2)o.frequency.linearRampToValueAtTime(f2,t+d);
    g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);
    o.connect(g);g.connect(a.destination);o.start(t);o.stop(t+d);
  }
  function click(){tone(2600,.018,'square',.045);tone(170,.045,'sine',.09);var p=$('needle');p.classList.remove('hit');void p.offsetWidth;p.classList.add('hit')}
  function celebrate(){tone(110,.7,'sawtooth',.045,0,520);[784,988,1175,1568].forEach(function(f,i){tone(f,.4,'triangle',.07,.65+i*.09)})}

  // confetti merah, putih, perak
  var fx=$('fx'),fctx=fx.getContext('2d'),parts=[],fxRun=false;
  function confetti(){
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    var d=window.devicePixelRatio||1,pal=[RED,RED,'#fff','#fff',CHROME];fx.width=innerWidth*d;fx.height=innerHeight*d;
    for(var i=0;i<170;i++){
      var left=i%2===0,ang=-Math.PI/2+(left?1:-1)*(0.2+Math.random()*0.7),sp=(11+Math.random()*14)*d;
      parts.push({x:(left?0.04:0.96)*fx.width,y:fx.height*0.9,vx:Math.cos(ang)*sp,vy:Math.sin(ang)*sp,w:(6+Math.random()*7)*d,h:(4+Math.random()*5)*d,
        r:Math.random()*TAU,vr:(Math.random()-.5)*.4,c:pal[Math.floor(Math.random()*pal.length)],life:0,round:Math.random()<.25});
    }
    if(!fxRun){fxRun=true;requestAnimationFrame(stepFx)}
  }
  function stepFx(){
    fctx.clearRect(0,0,fx.width,fx.height);var d=window.devicePixelRatio||1;
    parts=parts.filter(function(p){return p.y<fx.height+40&&p.life<260});
    parts.forEach(function(p){
      p.vy+=0.35*d;p.vx*=0.992;p.vy*=0.992;p.x+=p.vx;p.y+=p.vy;p.r+=p.vr;p.life++;
      fctx.save();fctx.translate(p.x,p.y);fctx.rotate(p.r);fctx.globalAlpha=Math.min(1,(260-p.life)/60);fctx.fillStyle=p.c;
      if(p.round){fctx.beginPath();fctx.arc(0,0,p.w/2,0,TAU);fctx.fill()}else fctx.fillRect(-p.w/2,-p.h/2,p.w,p.h);
      fctx.restore();
    });
    if(parts.length)requestAnimationFrame(stepFx);else{fxRun=false;fctx.clearRect(0,0,fx.width,fx.height)}
  }

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
      var i=idxAt(rot);if(i!==lastIdx){lastIdx=i;click()}
      draw();
      if(p<1)requestAnimationFrame(frame);else finish(win);
    })(t0);
  }
  function finish(win){
    spinning=false;
    var it=items[win];
    history.unshift(it.t);if(history.length>30)history.pop();
    $('winName').textContent=it.t;$('badge').hidden=!it.f;$('live').textContent='Pemenang: '+it.t;
    $('overlay').classList.add('show');$('again').focus();celebrate();confetti();
    if($('removeWin').checked){items.splice(win,1);save();draw();}
    renderList();renderHist();
  }

  function moveItem(from,to){
    if(spinning||to<0||to>=items.length)return;
    var moved=items.splice(from,1)[0];items.splice(to,0,moved);
    save();renderList();draw();
    $('items').children[to].querySelector('.move-handle').focus();
    $('live').textContent='Urutan hadiah diperbarui: '+moved.t;
  }

  function dragMove(e){
    if(!dragging||e.pointerId!==dragPointerId)return;
    e.preventDefault();
    var ul=$('items'),rect=ul.getBoundingClientRect(),edge=Math.min(32,rect.height/4);
    if(e.clientY<rect.top+edge)ul.scrollTop-=Math.ceil((rect.top+edge-e.clientY)/3);
    else if(e.clientY>rect.bottom-edge)ul.scrollTop+=Math.ceil((e.clientY-(rect.bottom-edge))/3);
    var target=document.elementFromPoint(e.clientX,e.clientY),targetLi=target&&target.closest('#items li');
    if(!targetLi||targetLi===dragging)return;
    var targetRect=targetLi.getBoundingClientRect();
    ul.insertBefore(dragging,e.clientY<targetRect.top+targetRect.height/2?targetLi:targetLi.nextSibling);
  }
  function endDrag(e){
    if(!dragging||e.pointerId!==dragPointerId)return;
    var ul=$('items'),item=dragging;
    item.classList.remove('dragging');dragging=null;dragPointerId=null;
    document.removeEventListener('pointermove',dragMove);
    document.removeEventListener('pointerup',endDrag);
    document.removeEventListener('pointercancel',endDrag);
    var order=Array.prototype.map.call(ul.children,function(node){return Number(node.dataset.index)});
    if(order.some(function(index,position){return index!==position})){
      var to=order.indexOf(Number(item.dataset.index));
      items=order.map(function(index){return items[index]});
      save();renderList();draw();
      $('items').children[to].querySelector('.move-handle').focus();
      $('live').textContent='Urutan hadiah diperbarui: '+item.querySelector('span').textContent;
    }
  }

  function renderList(){
    var ul=$('items');ul.innerHTML='';
    items.forEach(function(it,i){
      var li=document.createElement('li');li.dataset.index=String(i);li.style.setProperty('--c',fill(i,items.length));
      var handle=document.createElement('button');handle.className='move-handle';handle.type='button';handle.textContent='⠿';
      handle.setAttribute('aria-label','Geser '+it.t+' untuk mengubah urutan');
      handle.addEventListener('pointerdown',function(e){
        if(spinning||dragging||e.isPrimary===false||(e.pointerType==='mouse'&&e.button!==0))return;
        e.preventDefault();dragging=li;dragPointerId=e.pointerId;li.classList.add('dragging');
        document.addEventListener('pointermove',dragMove);
        document.addEventListener('pointerup',endDrag);
        document.addEventListener('pointercancel',endDrag);
      });
      handle.addEventListener('keydown',function(e){
        var to=e.key==='ArrowUp'?i-1:e.key==='ArrowDown'?i+1:i;
        if(to===i)return;
        e.preventDefault();moveItem(i,to);
      });
      var s=document.createElement('span');s.textContent=it.t;
      var st=document.createElement('button');st.className='star';st.type='button';st.textContent='★';st.setAttribute('aria-pressed',it.f);st.setAttribute('aria-label','Tandai '+it.t+' sebagai hadiah utama');
      st.onclick=function(){if(spinning)return;it.f=!it.f;save();renderList();draw()};
      var b=document.createElement('button');b.className='x';b.type='button';b.textContent='×';b.setAttribute('aria-label','Hapus '+it.t);
      b.onclick=function(){if(spinning)return;items.splice(i,1);save();renderList();draw()};
      li.appendChild(handle);li.appendChild(s);li.appendChild(st);li.appendChild(b);ul.appendChild(li);
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
    items.push({t:v,f:false});$('newItem').value='';save();renderList();draw();$('newItem').focus();
  }

  $('spinBtn').onclick=spin;$('again').onclick=spin;$('addBtn').onclick=add;
  $('toggleList').onclick=function(){
    var expanded=this.getAttribute('aria-expanded')!=='true',side=$('side');
    this.setAttribute('aria-expanded',String(expanded));
    this.textContent=expanded?'Daftar':' Daftar';
    $('mainLayout').classList.toggle('sidebar-hidden',!expanded);
    side.setAttribute('aria-hidden',String(!expanded));
    side.inert=!expanded;
  };
  $('newItem').addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();add()}});
  $('clear').onclick=function(){if(spinning)return;items=[];save();renderList();draw()};
  $('clearHist').onclick=function(){history=[];renderHist()};
  $('close').onclick=function(){$('overlay').classList.remove('show')};
  $('overlay').addEventListener('click',function(e){if(e.target===this)this.classList.remove('show')});
  document.addEventListener('keydown',function(e){if(e.key==='Escape')$('overlay').classList.remove('show')});
  window.addEventListener('resize',size);

  renderList();renderHist();size();
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(draw);
})();