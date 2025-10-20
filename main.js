document.addEventListener('DOMContentLoaded', function () {
  const bookNowBtn = document.getElementById('bookNowBtn');

  if (bookNowBtn) {
    bookNowBtn.addEventListener('click', function (e) {
      e.preventDefault();
      // open booking page in the same tab
      window.location.href = 'booking.html';
    });
  }

  // existing booking-details form handler (kept for backwards compatibility if used)
  const bookingDetails = document.getElementById('bookingDetails');
  const bookingForm = document.getElementById('bookingDetailsForm');

  if (bookingForm) {
    bookingForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const from = bookingForm.querySelector('#from')?.value || '';
      const to = bookingForm.querySelector('#to')?.value || '';
      const date = bookingForm.querySelector('#date')?.value || '';
      alert(`Booking Details:\nFrom: ${from}\nTo: ${to}\nDate: ${date}`);
      console.log({ from, to, date });
    });
  }
});
