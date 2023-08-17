// ref https://www.w3schools.com/howto/tryit.asp?filename=tryhow_css_modal_img
function popup(modalId) {
    var modal = document.getElementById(modalId);
    modal.style.display = "block";
    var span = document.getElementsByClassName("close")[0];
    span.onclick = function() {
      modal.style.display = "none";
    }
}