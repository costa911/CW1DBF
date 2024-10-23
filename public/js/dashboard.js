
document.addEventListener('DOMContentLoaded', function() {
    const phpMyAdminLink = document.querySelector('.phpmyadmin-link');
    if (phpMyAdminLink) {
        phpMyAdminLink.addEventListener('click', function(e) {
            if (!confirm('You are about to open phpMyAdmin in a new window. Continue?')) {
                e.preventDefault();
            }
        });
    }
});