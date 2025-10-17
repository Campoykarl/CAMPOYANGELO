// Handle booking form
document.getElementById("bookingForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const from = document.getElementById("from").value;
  const to = document.getElementById("to").value;
  const date = document.getElementById("date").value;

  alert(`Booking Details:
  From: ${from}
  To: ${to}
  Date: ${date}`);

  console.log({ from, to, date });
});
