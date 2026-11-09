// Point d'entrée pour les hébergeurs cPanel (Phusion Passenger).
// Passenger charge le fichier de démarrage avec require(), qui ne sait pas
// lire directement un fichier ES Module : on passe donc par import().
import('./src/index.js').catch((err) => {
  console.error('Erreur au démarrage de NFlowers :', err);
  process.exit(1);
});
