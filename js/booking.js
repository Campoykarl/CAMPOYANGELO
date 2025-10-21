// simple helper
const $ = id => document.getElementById(id);

// step handling
const steps = ['step1','step2','step3','step4'];
function goTo(stepIndex) {
  steps.forEach((s,i)=>{ $(s).classList.toggle('active', i===stepIndex); document.getElementById('step'+(i+1)+'badge').classList.toggle('active', i===stepIndex); });
}

// schedule generator (arrays)
function buildSchedules({from,to,date,legs=3}) {
  // create 3 default schedules for given date
  const baseTimes = ['06:00','09:10','15:30','20:45'];
  const fares = ['Promo Fare','Standard'];
  const results = [];
  for (let i=0;i<legs;i++){
    const hour = baseTimes[i % baseTimes.length];
    results.push({
      id: `${Math.floor(Math.random()*9000)+100}-${i}`,
      flightNo: ['5J','PX','PR'][i%3] + ' ' + (560+i),
      departDate: date,
      departTime: hour,
      from, to,
      price: Math.floor(15000 + (i*2500)), // sample
      seats: 5 + i*3,
      hours: 6 + i,
      fare: fares[i%2]
    });
  }
  return results;
}

// state
const state = {
  from:'', to:'', tripType:'round', departDate:'', returnDate:'', passengers:1,
  departOptions:[], returnOptions:[],
  selectedDepart:null, selectedReturn:null,
  passengerData: []
};

// init UI
document.addEventListener('DOMContentLoaded', ()=>{
  // trip type toggle
  document.querySelectorAll('input[name="tripType"]').forEach(r=>{
    r.addEventListener('change', (e)=>{
      state.tripType = e.target.value;
      $('returnField').style.display = state.tripType==='round' ? 'block' : 'none';
    });
  });
  // default hide if one-way
  $('returnField').style.display = 'block';

  $('searchFlightsBtn').addEventListener('click', onSearchFlights);
  $('backToDetails').addEventListener('click', ()=> goTo(0));
  $('toPassengerBtn').addEventListener('click', ()=> { buildPassengerForms(); goTo(2); });
  $('backToFlights').addEventListener('click', ()=> goTo(1));
  $('toSummaryBtn').addEventListener('click', onToSummary);
  $('backToPassenger').addEventListener('click', ()=> goTo(2));
  $('bookNowFinal').addEventListener('click', onBookNow);

  // prefill if URL params present (index->booking)
  const params = new URLSearchParams(window.location.search);
  if (params.get('from')) $('fromInput').value = params.get('from');
  if (params.get('to')) $('toInput').value = params.get('to');
  if (params.get('passengers')) $('passengersSelect').value = params.get('passengers');
  // no attempt to parse date range here; user fills dates on this page
});

function onSearchFlights(e){
  // validate
  state.from = $('fromInput').value.trim();
  state.to = $('toInput').value.trim();
  state.tripType = document.querySelector('input[name="tripType"]:checked').value;
  state.departDate = $('departDate').value;
  state.returnDate = $('returnDate').value;
  state.passengers = parseInt($('passengersSelect').value,10) || 1;

  if (!state.from || !state.to) { alert('Please enter From and To'); return; }
  if (!state.departDate) { alert('Please choose Depart Date'); return; }
  if (state.tripType === 'round' && !state.returnDate) { alert('Please choose Return Date for round trip'); return; }
  if (state.tripType === 'round' && new Date(state.returnDate) < new Date(state.departDate)) { alert('Return date must be the same or after depart date'); return; }

  // generate options arrays using chosen dates
  state.departOptions = buildSchedules({from:state.from,to:state.to,date:state.departDate, legs:3});
  if (state.tripType === 'round') {
    state.returnOptions = buildSchedules({from:state.to,to:state.from,date:state.returnDate, legs:3});
  } else {
    state.returnOptions = [];
  }

  renderFlights();
  goTo(1);
}

function renderFlights(){
  const container = $('flightsContainer'); container.innerHTML = '';
  // Depart options
  const departTitle = document.createElement('div'); departTitle.style.fontWeight='700'; departTitle.textContent = `Depart (${state.departDate})`; container.appendChild(departTitle);
  state.departOptions.forEach(opt=>{
    const card = createFlightCard(opt, false);
    container.appendChild(card);
  });

  if (state.tripType==='round') {
    const returnTitle = document.createElement('div'); returnTitle.style.fontWeight='700'; returnTitle.style.marginTop='8px'; returnTitle.textContent = `Return (${state.returnDate})`; container.appendChild(returnTitle);
    state.returnOptions.forEach(opt=>{
      const card = createFlightCard(opt, true);
      container.appendChild(card);
    });
  }
  // enable continue only when selection ready
  updateContinueButton();
}

function createFlightCard(f, isReturn){
  const card = document.createElement('div'); card.className='flight-card';
  const left = document.createElement('div'); left.className='flight-info';
  const times = document.createElement('div'); times.innerHTML = `<div style="font-weight:700">${f.departTime}</div><div class="flight-meta">${f.departDate}</div>`;
  const meta = document.createElement('div'); meta.innerHTML = `<div style="font-weight:700">${f.from} → ${f.to}</div><div class="flight-meta">${f.flightNo} • ${f.hours}h • ${f.fare} • Seats: ${f.seats}</div>`;
  left.appendChild(times); left.appendChild(meta);

  const right = document.createElement('div'); right.className='flight-right';
  const price = document.createElement('div'); price.className='price'; price.textContent = '₱' + f.price.toLocaleString();
  const btn = document.createElement('button'); btn.className='btn'; btn.textContent = 'Select';
  btn.addEventListener('click', ()=> {
    // set selection
    if (isReturn) { state.selectedReturn = f; } else { state.selectedDepart = f; }
    // visually mark chosen
    // remove any selected highlight for same leg
    document.querySelectorAll('.flight-card').forEach(c=> c.style.borderColor = 'rgba(0,0,0,0.03)');
    // highlight selected cards
    // find matching by id
    setTimeout(()=> {
      // highlight specific matching cards
      document.querySelectorAll('.flight-card').forEach(el=>{
        if (el._flightId === state.selectedDepart?._id || el._flightId === state.selectedReturn?._id){} // noop
      });
    },0);
    // simple visual: set outline on this card
    card.style.borderColor = 'rgba(255,123,0,0.6)';
    card.style.boxShadow = '0 12px 28px rgba(255,123,0,0.08)';
    updateContinueButton();
  });

  // attach id for potential styling
  card._flightId = f.id;
  right.appendChild(price); right.appendChild(btn);
  card.appendChild(left); card.appendChild(right);
  return card;
}

function updateContinueButton(){
  const btn = $('toPassengerBtn');
  if (state.tripType==='round') {
    btn.disabled = !(state.selectedDepart && state.selectedReturn);
  } else {
    btn.disabled = !state.selectedDepart;
  }
}

function buildPassengerForms(){
  const container = $('passengersContainer'); container.innerHTML='';
  state.passengerData = [];
  const n = state.passengers;
  for (let i=0;i<n;i++){
    const div = document.createElement('div'); div.className='passenger';
    div.innerHTML = `<div style="min-width:40px;font-weight:700">P${i+1}</div>
      <div style="flex:1"><input placeholder="Full name" class="pname" required/></div>
      <div style="flex:1"><input placeholder="Email" class="pemail" type="email" required/></div>
      <div style="flex:1"><input placeholder="Phone" class="pphone" required/></div>`;
    container.appendChild(div);
  }
}

function onToSummary(){
  // validate passenger forms
  const names = Array.from(document.querySelectorAll('.pname')).map(i=>i.value.trim());
  const emails = Array.from(document.querySelectorAll('.pemail')).map(i=>i.value.trim());
  const phones = Array.from(document.querySelectorAll('.pphone')).map(i=>i.value.trim());
  for (let i=0;i<names.length;i++){
    if (!names[i]) { alert('Enter passenger full name for passenger ' + (i+1)); return; }
    if (!emails[i] || !/^\S+@\S+\.\S+$/.test(emails[i])) { alert('Enter valid email for passenger ' + (i+1)); return; }
  }
  state.passengerData = names.map((n,idx)=>({name:n,email:emails[idx],phone:phones[idx]}));
  renderSummary();
  goTo(3);
}

function renderSummary(){
  const container = $('summaryContainer'); container.innerHTML='';
  // flights
  const flightBlock = document.createElement('div'); flightBlock.innerHTML = `<strong>Flight</strong><div style="margin-top:8px">${state.from} → ${state.to}</div>`;
  const dep = document.createElement('div'); dep.style.marginTop='8px';
  dep.innerHTML = `<div><strong>Depart:</strong> ${state.selectedDepart ? state.selectedDepart.departDate + ' ' + state.selectedDepart.departTime : '-'}</div>
                   <div class="flight-meta">Flight No: ${state.selectedDepart?.flightNo || '-' } • Terminal: 1</div>`;
  flightBlock.appendChild(dep);
  if (state.tripType==='round') {
    const ret = document.createElement('div'); ret.style.marginTop='8px';
    ret.innerHTML = `<div><strong>Return:</strong> ${state.selectedReturn ? state.selectedReturn.departDate + ' ' + state.selectedReturn.departTime : '-'}</div>
                     <div class="flight-meta">Flight No: ${state.selectedReturn?.flightNo || '-'} • Terminal: 2</div>`;
    flightBlock.appendChild(ret);
  }
  container.appendChild(flightBlock);

  // passengers
  const pBlock = document.createElement('div'); pBlock.style.marginTop='12px';
  pBlock.innerHTML = `<strong>Passengers (${state.passengerData.length})</strong>`;
  state.passengerData.forEach((p,i)=>{
    const row = document.createElement('div'); row.className='row';
    row.innerHTML = `<div>${i+1}. ${p.name}</div><div>${p.email} • ${p.phone}</div>`;
    pBlock.appendChild(row);
  });
  container.appendChild(pBlock);

  // price calc
  let total = 0;
  if (state.selectedDepart) total += state.selectedDepart.price;
  if (state.selectedReturn) total += state.selectedReturn.price;
  total = total * (state.passengerData.length || 1);
  $('totalPrice').textContent = '₱' + total.toLocaleString();
}

function onBookNow(){
  // final validation
  if (!state.selectedDepart) return alert('Choose a departure flight');
  if (state.tripType==='round' && !state.selectedReturn) return alert('Choose a return flight');

  // prepare data
  const bookingRef = 'YA' + Math.floor(100000 + Math.random() * 900000);
  const now = new Date().toISOString();
  const total = ( (state.selectedDepart?.price || 0) + (state.selectedReturn?.price || 0) ) * (state.passengerData.length || 1);

  const payload = {
    ref: bookingRef,
    createdAt: now,
    from: state.from,
    to: state.to,
    tripType: state.tripType,
    depart: state.selectedDepart || null,
    return: state.selectedReturn || null,
    passengers: state.passengerData,
    total
  };

  // save to sessionStorage and navigate to receipt page
  try {
    sessionStorage.setItem('ya_booking_receipt', JSON.stringify(payload));
    window.location.href = 'receipt.html'; // open receipt in same tab
  } catch (err) {
    console.error('Storage error', err);
    alert('Unable to store booking data. Please try again.');
  }
}
