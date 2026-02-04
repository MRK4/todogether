# ToDoGether

Un outil de **gestion de tâches collaboratif en temps réel**, simple, rapide et multilingue.  
Créez, modifiez et suivez des tâches avec plusieurs utilisateurs sans compte obligatoire — partagez simplement un lien et commencez à collaborer.

---

## Fonctionnalités clés

- **Temps réel** : toutes les actions sur les tâches et les curseurs sont instantanément synchronisées.  
- **Deux types d’utilisateur** :  
  - **Guest** : stockage local dans le navigateur, parfait pour tester rapidement.  
  - **Connecté** : sauvegarde des tâches et tableaux en base de données, consultable depuis n’importe quel appareil.  
- **Lien d’invitation unique** : invitez des participants en un clic.  
- **Gestion des tâches** : créer, modifier, supprimer et compléter.  
- **Interface moderne et multilingue** : flat design, responsive, textes isolés pour faciliter la traduction.

---

## Stack technique

- **Frontend** : Next.js, React, TailwindCSS, shadcn/ui  
- **Temps réel** : Socket.IO  
- **Backend & DB** : Prisma avec SQLite ou PostgreSQL  
- **Stockage local** : pseudo et UUID utilisateur dans `localStorage`  
- **i18n** : interface prête à être traduite facilement

---

## Objectif

Démontrer une **expérience collaborative fluide**, accessible immédiatement, avec persistance pour les utilisateurs connectés et support multilingue, idéale pour un projet de portfolio.

---

## Fonctionnement

Au chargement de l’application, l’utilisateur arrive **directement sur un tableau vierge**, sans page d’accueil intermédiaire.  
Il peut alors **soit se connecter**, soit **continuer en tant qu’invité**, puis commencer immédiatement à organiser son travail.

Une fois cette étape passée, il peut notamment :
- **Créer des colonnes** (par exemple "À faire", "En cours", "Terminé").  
- **Ajouter, modifier, déplacer et supprimer des tâches** dans chaque colonne.  
- **Collaborer en temps réel** avec d’autres utilisateurs présents sur le même tableau (requiert une authentification).

L’objectif est de **rentrer tout de suite dans le vif du sujet** : pas de landing page, on se concentre directement sur le tableau et les tâches.
