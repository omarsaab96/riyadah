
$(document).ready(function () {
    document.getElementById("year").textContent = new Date().getFullYear();

    AOS.init();
    $('.loader').fadeOut();
})
