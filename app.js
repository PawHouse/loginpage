// Minimal app.js to manage localStorage data and page behaviors
// Data keys: paw_users, paw_animals, paw_donations, paw_volunteers, paw_adoptions, paw_session
(function(){
  // helper
  function uid(){ return Date.now().toString(36) + Math.random().toString(36).slice(2,7); }
  function load(key, def){ try{ const s=localStorage.getItem(key); return s?JSON.parse(s):def;}catch(e){return def;} }
  function save(key, v){ localStorage.setItem(key, JSON.stringify(v)); }

  // init default data if not exist
  if(!localStorage.getItem('paw_users')){
    const users = [
      {id: uid(), username:'admin', email:'admin@pawhouse', password:'admin123', isAdmin:true},
      {id: uid(), username:'user', email:'user@pawhouse', password:'user123', isAdmin:false}
    ];
    save('paw_users', users);
  }
  if(!localStorage.getItem('paw_animals')){
    const animals = [
      {id: uid(), name:'Kiko', species:'Anjing', age:'2 tahun', status:'available', description:'Ramah dan suka bermain'},
      {id: uid(), name:'Mimi', species:'Kucing', age:'1 tahun', status:'available', description:'Pendiam, suka dipeluk'}
    ];
    save('paw_animals', animals);
  }
  if(!localStorage.getItem('paw_donations')) save('paw_donations', []);
  if(!localStorage.getItem('paw_volunteers')) save('paw_volunteers', []);
  if(!localStorage.getItem('paw_adoptions')) save('paw_adoptions', []);

  // Authentication functions
  window.registerUser = function(username, email, password){
    const users = load('paw_users', []);
    if(!username || !email || !password) return {success:false, message:'Semua field wajib diisi'};
    if(password.length < 4) return {success:false, message:'Password minimal 4 karakter'};
    if(users.find(u=>u.username===username || u.email===email)) return {success:false, message:'Username atau email sudah terpakai'};
    const newU = {id: uid(), username, email, password, isAdmin:false};
    users.push(newU); save('paw_users', users);
    return {success:true, user:newU};
  };

  window.loginUser = function(userOrEmail, password){
    const users = load('paw_users', []);
    const u = users.find(x => x.username === userOrEmail || x.email === userOrEmail);
    if(!u || u.password !== password) return {success:false, message:'Username/email atau password salah'};
    save('paw_session', {uid:u.id, isAdmin: !!u.isAdmin});
    return {success:true, isAdmin: !!u.isAdmin};
  };

  window.logout = function(){ localStorage.removeItem('paw_session'); updateNav(); };

  window.getCurrentUser = function(){
    const s = load('paw_session', null);
    if(!s) return null;
    const users = load('paw_users', []);
    return users.find(u=>u.id===s.uid) || null;
  };

  window.isAdminLogged = function(){ const s = load('paw_session', null); return s && s.isAdmin; };

  window.updateNav = function(){
    const cur = getCurrentUser();
    const navLogin = document.getElementById('nav-login');
    const navLogin2 = document.getElementById('nav-login2');
    const navLogin3 = document.getElementById('nav-login3');
    const navLogin4 = document.getElementById('nav-login4');
    const navLogin5 = document.getElementById('nav-login5');
    const navLogin6 = document.getElementById('nav-login6');
    const navLogin7 = document.getElementById('nav-login7');
    const navLogin8 = document.getElementById('nav-login8');
    const els = [navLogin, navLogin2, navLogin3, navLogin4, navLogin5, navLogin6, navLogin7, navLogin8];
    els.forEach(el=>{ if(el) el.textContent = cur ? (cur.isAdmin ? cur.username + ' (Admin)' : cur.username) : 'Login'; if(el) el.href = cur ? (cur.isAdmin ? 'admin-dashboard.html' : 'index.html') : 'login.html'; });
  };

  // Animal render and operations
  window.renderAnimalsPreview = function(){
    const list = document.getElementById('animals-list');
    if(!list) return;
    const animals = load('paw_animals', []);
    list.innerHTML = animals.filter(a=>a.status==='available').slice(0,4).map(a=>`
      <li class="card"><h4>${a.name}</h4><p>${a.species} • ${a.age}</p><p>${a.description}</p><div><a class="btn" href="animal-detail.html?id=${a.id}">Detail</a></div></li>
    `).join('') || '<li class="card">Belum ada hewan</li>';
  };

  window.renderAnimalsFull = function(){
    const list = document.getElementById('animals-full');
    if(!list) return;
    const animals = load('paw_animals', []);
    list.innerHTML = animals.map(a=>`
      <li class="card"><h4>${a.name}</h4><p>${a.species} • ${a.age}</p><p>${a.description}</p><div><a class="btn" href="animal-detail.html?id=${a.id}">Detail</a> <a class="btn ghost" href="adopt.html?adopt=${a.id}">Ajukan Adopsi</a></div></li>
    `).join('') || '<li class="card">Belum ada hewan</li>';
  };

  window.renderAnimalDetailFromQuery = function(){
    const el = document.getElementById('animal-detail-card');
    if(!el) return;
    const params = new URLSearchParams(location.search);
    const id = params.get('id') || params.get('adopt');
    const animals = load('paw_animals', []);
    const a = animals.find(x=>x.id===id);
    if(!a){ el.innerHTML = '<p>Hewan tidak ditemukan.</p>'; return; }
    el.innerHTML = `<div class="card"><h3>${a.name}</h3><p>${a.species} • ${a.age}</p><p>${a.description}</p>${a.status==='available'?'<div><a class="btn" href="adopt.html?adopt='+a.id+'">Ajukan Adopsi</a></div>':'<p>Status: '+a.status+'</p>'}</div>`;
  };

  // submit donation
  window.submitDonation = function(name, amount, proof){
    if(!name || amount<=0) return {success:false, message:'Isi nama dan nominal yang benar'};
    const donations = load('paw_donations', []);
    donations.push({id:uid(), donor_name:name, amount, proof, verified:false, created_at:new Date().toISOString()});
    save('paw_donations', donations);
    return {success:true, message:'Donasi terkirim, menunggu verifikasi admin.'};
  };

  // volunteer
  window.submitVolunteer = function(name, activity){
    if(!name || !activity) return {success:false, message:'Isi nama dan kegiatan'};
    const vols = load('paw_volunteers', []);
    vols.push({id:uid(), name, activity, verified:false, created_at:new Date().toISOString()});
    save('paw_volunteers', vols);
    return {success:true, message:'Pendaftaran volunteer terkirim, menunggu verifikasi admin.'};
  };

  // admin functions: animals CRUD, render admin lists
  window.renderAdminAll = function(){
    const animals = load('paw_animals', []);
    const dons = load('paw_donations', []);
    const vols = load('paw_volunteers', []);
    const adopts = load('paw_adoptions', []);
    document.getElementById('admin-animals').innerHTML = animals.map(a=>`<li class="card"><strong>${a.name}</strong><p>${a.species} • ${a.age}</p><p>${a.description}</p><div><button onclick="editAnimal('${a.id}')">edit</button> <button onclick="deleteAnimal('${a.id}')">hapus</button></div></li>`).join('')||'<li class="card">Belum ada hewan</li>';
    document.getElementById('admin-donations').innerHTML = dons.map(d=>`<li class="card"><strong>${d.donor_name}</strong><p>Rp ${d.amount}</p><p>Verified: ${d.verified}</p><div>${d.verified? '':'<button onclick="verifyDonation(\''+d.id+'\')">verify</button>'}</div></li>`).join('')||'<li class="card">Belum ada donasi</li>';
    document.getElementById('admin-vols').innerHTML = vols.map(v=>`<li class="card"><strong>${v.name}</strong><p>${v.activity}</p><p>Verified: ${v.verified}</p><div>${v.verified? '':'<button onclick="verifyVolunteer(\''+v.id+'\')">verify</button>'}</div></li>`).join('')||'<li class="card">Belum ada volunteer</li>';
    document.getElementById('admin-adopts').innerHTML = adopts.map(ad=>{ const u = load('paw_users',[]).find(x=>x.id===ad.user_id); const a = animals.find(x=>x.id===ad.animal_id); return `<li class="card"><strong>${u?u.username:'(user)'} - ${a? a.name : '(hewan)'}</strong><p>Status: ${ad.status}</p><div>${ad.status==='pending'?'<button onclick="approveAdopt(\''+ad.id+'\')">approve</button> <button onclick="rejectAdopt(\''+ad.id+'\')">reject</button>':''}</div></li>` }).join('')||'<li class="card">Belum ada adopsi</li>';
  };

  window.saveAnimalFromForm = function(){
    const id = document.getElementById('a-id').value;
    const name = document.getElementById('a-name').value.trim();
    const species = document.getElementById('a-species').value.trim();
    const age = document.getElementById('a-age').value.trim();
    const desc = document.getElementById('a-desc').value.trim();
    if(!name) return alert('Nama hewan kosong');
    const animals = load('paw_animals', []);
    if(id){
      const idx = animals.findIndex(x=>x.id===id);
      if(idx>-1){ animals[idx] = {...animals[idx], name, species, age, description:desc}; }
    } else {
      animals.push({id:uid(), name, species, age, status:'available', description:desc});
    }
    save('paw_animals', animals);
    clearAnimalForm();
    renderAdminAll();
    alert('Data hewan tersimpan');
  };

  window.clearAnimalForm = function(){
    document.getElementById('a-id').value='';
    document.getElementById('a-name').value='';
    document.getElementById('a-species').value='';
    document.getElementById('a-age').value='';
    document.getElementById('a-desc').value='';
  };

  window.editAnimal = function(id){
    const animals = load('paw_animals', []);
    const a = animals.find(x=>x.id===id);
    if(!a) return alert('Tidak ditemukan');
    document.getElementById('a-id').value = a.id;
    document.getElementById('a-name').value = a.name;
    document.getElementById('a-species').value = a.species;
    document.getElementById('a-age').value = a.age;
    document.getElementById('a-desc').value = a.description;
    window.scrollTo(0,0);
  };

  window.deleteAnimal = function(id){
    if(!confirm('Hapus hewan ini?')) return;
    const animals = load('paw_animals', []).filter(x=>x.id!==id);
    save('paw_animals', animals); renderAdminAll();
  };

  window.verifyDonation = function(id){
    const dons = load('paw_donations', []);
    const d = dons.find(x=>x.id===id); if(d){ d.verified=true; save('paw_donations',dons); renderAdminAll(); alert('Donasi diverifikasi'); }
  };

  window.verifyVolunteer = function(id){
    const vols = load('paw_volunteers', []);
    const v = vols.find(x=>x.id===id); if(v){ v.verified=true; save('paw_volunteers',vols); renderAdminAll(); alert('Volunteer diverifikasi'); }
  };

  window.approveAdopt = function(id){
    const adopts = load('paw_adoptions', []);
    const ad = adopts.find(x=>x.id===id); if(!ad) return;
    ad.status='approved';
    const animals = load('paw_animals', []);
    const a = animals.find(x=>x.id===ad.animal_id); if(a) a.status='adopted';
    save('paw_adoptions', adopts); save('paw_animals', animals); renderAdminAll(); alert('Adopsi disetujui');
  };

  window.rejectAdopt = function(id){
    const adopts = load('paw_adoptions', []);
    const ad = adopts.find(x=>x.id===id); if(!ad) return;
    ad.status='rejected'; save('paw_adoptions', adopts); renderAdminAll(); alert('Adopsi ditolak');
  };

  // adoption form on adopt.html when ?adopt=id passed
  (function handleAdoptForm(){
    if(location.pathname.endsWith('adopt.html')){
      const params = new URLSearchParams(location.search);
      const aid = params.get('adopt');
      if(aid){
        // find animal and show simple confirmation
        const animals = load('paw_animals', []);
        const a = animals.find(x=>x.id===aid);
        if(a){
          // replace form when submit
          const el = document.querySelector('main.container');
          el.insertAdjacentHTML('afterbegin', `<div class="card"><h3>Ajukan Adopsi: ${a.name}</h3><form id="adopt-form"><label>Alasan adopsi<textarea id="adopt-note" required></textarea></label><button class="btn" type="submit">Kirim Permohonan</button><p id="adopt-msg" class="msg"></p></form></div>`);
          document.getElementById('adopt-form').addEventListener('submit', function(e){ e.preventDefault(); const cur = getCurrentUser(); if(!cur){ alert('Silakan login sebelum mengajukan adopsi'); window.location.href='login.html'; return; } const note = document.getElementById('adopt-note').value.trim(); const adopts = load('paw_adoptions', []); adopts.push({id:uid(), user_id:cur.id, animal_id:aid, reason:note, status:'pending', created_at:new Date().toISOString()}); save('paw_adoptions', adopts); document.getElementById('adopt-msg').textContent = 'Permohonan terkirim, menunggu verifikasi admin.'; setTimeout(()=>{ window.location.href='index.html'; },900); });
        }
      }
    }
  })();

  // expose helper for admin-check login
  window.isAdminLogged = function(){ const s = load('paw_session', null); return s && s.isAdmin; };

  // simple protection on admin-dashboard load handled in page script

  // update nav on load
  document.addEventListener('DOMContentLoaded', ()=> updateNav() );

})();