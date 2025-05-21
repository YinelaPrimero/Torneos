// // Simulación de autenticación
// const auth = {
//   currentUser: null,
  
//   login: function(email, password) {
//     // En una aplicación real, esto haría una petición al backend
//     return new Promise((resolve, reject) => {
//       setTimeout(() => {
//         if (email && password) {
//           this.currentUser = {
//             id: 1,
//             email: email,
//             name: 'Usuario Demo',
//             isAdmin: email.includes('admin'), // o recibirlo del backend
//             avatar: 'https://via.placeholder.com/40'
//           };
//           localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
//           resolve(this.currentUser);
//         } else {
//           reject(new Error('Email y contraseña son requeridos'));
//         }
//       }, 500);
//     });
//   },
  
//   logout: function() {
//     this.currentUser = null;
//     localStorage.removeItem('currentUser');
//     window.location.href = '../login.html';
//   },
  
//   checkAuth: function() {
//     const user = localStorage.getItem('currentUser');
//     if (user) {
//       this.currentUser = JSON.parse(user);
//       return true;
//     }
//     return false;
//   },
  
//   getCurrentUser: function() {
//     return this.currentUser;
//   }
// };

// // Verificar autenticación en páginas protegidas
// document.addEventListener('DOMContentLoaded', function() {
//   const protectedPages = ['dashboard_admin', 'dashboard_jugador'];
//   const currentPath = window.location.pathname.split('/').pop().replace('.html', '');
  
//   if (protectedPages.includes(currentPath) && !auth.checkAuth()) {
//     window.location.href = '../login.html';
//   }
  
//   // Configurar logout button
//   const logoutBtn = document.getElementById('logout-btn');
//   if (logoutBtn) {
//     logoutBtn.addEventListener('click', auth.logout);
//   }
  
//   // Mostrar información del usuario
//   const user = auth.getCurrentUser();
//   if (user) {
//     const playerNameElements = document.querySelectorAll('#player-name, #full-name');
//     playerNameElements.forEach(el => {
//       if (el) el.textContent = user.name;
//     });
    
//     const playerAvatarElements = document.querySelectorAll('#player-avatar, .user-menu img');
//     playerAvatarElements.forEach(el => {
//       if (el) el.src = user.avatar;
//     });
//   }
// });