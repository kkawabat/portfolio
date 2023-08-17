//ref https://www.w3schools.com/howto/tryit.asp?filename=tryhow_js_scroll_to_top

// Get the button
var totop_btn = document.getElementById("jumpToTopBtn");

// When the user scrolls down 20px from the top of the document, show the button
window.onscroll = function() {scrollFunction()};

function scrollFunction() {
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    totop_btn.style.display = "block";
  } else {
    totop_btn.style.display = "none";
  }
}

// When the user clicks on the button, scroll to the top of the document
function topFunction() {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
}