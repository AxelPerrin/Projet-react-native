# StudyFlow

**StudyFlow** est une application mobile d'agenda scolaire pensée pour les étudiants. Elle centralise cours, devoirs et examens au même endroit, aide à suivre les échéances et propose une vue planning de la semaine en cours. L'interface est entièrement en français.

## À propos du projet

StudyFlow répond au besoin d'organiser sa vie scolaire sans multiplier les outils. Chaque utilisateur dispose d'un compte personnel : après connexion, il retrouve son agenda, peut filtrer ses entrées selon leur statut, consulter son planning hebdomadaire et gérer son profil. Les données sont stockées dans Supabase et isolées par utilisateur grâce aux règles de sécurité (RLS).

Ce dépôt correspond au projet mobile développé avec Expo et React Native dans le cadre d'un projet scolaire.

## Fonctionnalités

- **Authentification** — connexion et inscription par e-mail et mot de passe via Supabase, avec session persistante et redirection automatique selon l'état de connexion
- **Agenda** — liste des entrées avec filtres (tous, à faire, en retard, cette semaine, terminés) ; création, modification, suppression et marquage comme terminé
- **Catégories** — chaque entrée est classée en Cours, Devoir ou Examen, avec date d'échéance optionnelle
- **Planning** — vue semaine regroupant les entrées par jour, avec indication des éléments en retard
- **Notifications** — rappels locaux planifiés la veille à 9 h pour les entrées ayant une date limite ; possibilité de tester une notification depuis l'agenda
- **Profil** — affichage de l'e-mail, photo de profil via la caméra, déconnexion sécurisée
- **Sécurité** — chaque utilisateur n'accède qu'à ses propres données (politiques RLS Supabase)

## Stack technique

| Couche | Technologies |
|--------|--------------|
| Mobile | Expo ~54, React Native, TypeScript, Expo Router |
| Backend | Supabase (authentification et base de données) |
| État global | Zustand |
| Formulaires | react-hook-form |
| Divers | expo-notifications, expo-image-picker, sélecteur de date natif |

## Installation et lancement

1. Installer les dépendances du projet avec la commande d'installation npm à la racine du dépôt.
2. Copier le fichier d'exemple d'environnement (.env.example) vers un fichier .env à la racine, puis y renseigner l'URL et la clé anonyme de votre projet Supabase (disponibles dans les paramètres API du tableau de bord Supabase).
3. Lancer l'application en mode développement avec Expo (commande de démarrage Expo ou script npm start), puis ouvrir l'app sur un émulateur ou un appareil via Expo Go.

Variables d'environnement requises : EXPO_PUBLIC_SUPABASE_URL et EXPO_PUBLIC_SUPABASE_ANON_KEY.

## Configuration Supabase

L'application s'appuie sur une table notes avec les colonnes de base (identifiant, titre, description, identifiant utilisateur, date de création). Pour StudyFlow, trois colonnes supplémentaires sont nécessaires :

| Colonne | Type | Description |
|---------|------|-------------|
| category | texte | course, homework ou exam |
| due_date | horodatage | date d'échéance (facultatif) |
| completed | booléen | statut terminé (défaut false) |

Si votre projet Supabase existait avant ces ajouts, ajoutez ces colonnes depuis l'éditeur SQL du tableau de bord Supabase. Vérifiez également que les politiques RLS limitent l'accès aux notes de l'utilisateur connecté.

## Structure de l'application

L'application est organisée autour de trois onglets principaux :

- **Agenda** — écran d'accueil avec filtres, carte des notifications et liste des entrées
- **Planning** — vue hebdomadaire des entrées groupées par jour
- **Profil** — informations du compte, photo et déconnexion

En dehors des onglets, un écran de connexion et d'inscription gère l'authentification. Le code est réparti entre les écrans (dossier app), les composants réutilisables (notes, authentification, profil, interface), les hooks et services (appels Supabase, notifications, caméra), le store Zustand pour l'état des notes, et les utilitaires partagés (formatage, thème, gestion des erreurs).

```bash
npm start
npm run android
npm run ios
npm run web
```
