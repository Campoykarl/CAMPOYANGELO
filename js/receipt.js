(function(){
  const raw = sessionStorage.getItem('ya_booking_receipt');
  const root = document.getElementById('content');
  const meta = document.getElementById('meta');
  if (!raw) {
    meta.textContent = '';
    root.innerHTML = '<div class="small">No booking data found. <a class="link" href="index.html">Return to booking</a></div>';
    return;
  }
  let data;
  try {
    data = JSON.parse(raw);
  } catch(err) {
    meta.textContent = '';
    root.innerHTML = '<div class="small">Invalid booking data. <a class="link" href="index.html">Return to booking</a></div>';
    return;
  }

  meta.innerHTML = `Booking reference: <strong>${data.ref}</strong> • Date: ${new Date(data.createdAt).toLocaleString()}`;

  const lines = [];
  lines.push('<div class="section">');
  lines.push('<div style="font-weight:700">Flight details</div>');
  lines.push('<div class="row"><div>' + (data.from || '-') + ' → ' + (data.to || '-') + '</div><div class="small">' + (data.tripType === 'round' ? 'Round Trip' : 'One Way') + '</div></div>');
  lines.push('<table><thead><tr><th>Leg</th><th>Flight No</th><th>Depart</th><th>Time</th><th>Destination</th><th>Hours</th><th>Fare</th><th>Price</th></tr></thead><tbody>');
  if (data.depart) {
    lines.push('<tr><td>Depart</td><td>' + (data.depart.flightNo || '-') + '</td><td>' + (data.depart.departDate || '-') + '</td><td>' + (data.depart.departTime || '-') + '</td><td>' + (data.depart.to || '-') + '</td><td>' + (data.depart.hours || '-') + 'h</td><td>' + (data.depart.fare || '-') + '</td><td>₱' + ((data.depart.price||0).toLocaleString()) + '</td></tr>');
  }
  if (data.tripType === 'round' && data.return) {
    lines.push('<tr><td>Return</td><td>' + (data.return.flightNo || '-') + '</td><td>' + (data.return.departDate || '-') + '</td><td>' + (data.return.departTime || '-') + '</td><td>' + (data.return.to || '-') + '</td><td>' + (data.return.hours || '-') + 'h</td><td>' + (data.return.fare || '-') + '</td><td>₱' + ((data.return.price||0).toLocaleString()) + '</td></tr>');
  }
  lines.push('</tbody></table>');
  lines.push('</div>');

  lines.push('<div class="section"><div style="font-weight:700">Passengers (' + (data.passengers?.length || 0) + ')</div>');
  (data.passengers || []).forEach((p,i)=>{
    lines.push('<div class="pass small">' + (i+1) + '. ' + (p.name||'-') + ' • ' + (p.email||'-') + ' • ' + (p.phone||'-') + '</div>');
  });
  lines.push('</div>');

  lines.push('<div class="section"><div class="row"><div class="small">Subtotal</div><div>₱' + (data.total || 0).toLocaleString() + '</div></div></div>');

  root.innerHTML = lines.join('');

  // optional: clear sessionStorage so receipt isn't reused
  // sessionStorage.removeItem('ya_booking_receipt');
})();
