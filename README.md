# Projet React Native

Application mobile de prise de notes, développée avec Expo et Supabase dans le cadre d'un projet scolaire.

## Technologies

Expo, React Native, TypeScript, Expo Router, Supabase, Zustand, react-hook-form, expo-notifications, expo-image-picker.

## Fonctionnalités

- Connexion et inscription par e-mail et mot de passe
- Session conservée entre les ouvertures de l'application, avec redirection automatique selon l'état de connexion
- Écran d'accueil : liste, création, modification et suppression de notes personnelles stockées dans Supabase
- Chaque utilisateur ne voit que ses propres notes (politiques RLS côté Supabase)
- Test de notification locale depuis l'écran d'accueil
- Photo de profil prise avec la caméra de l'appareil
- Écran profil : informations utilisateur et déconnexion
- Trois écrans principaux — Connexion, Accueil et Profil — avec navigation par onglets entre Accueil et Profil
