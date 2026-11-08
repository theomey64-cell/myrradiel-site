# Myrradiel — site web et connexion Discord

## Tester immédiatement
1. Installer Node.js 20+ : https://nodejs.org/
2. Ouvrir un terminal dans le dossier `myrradiel_site`.
3. Lancer `node server.js`.
4. Ouvrir http://localhost:3000 — la maquette fonctionne sans configuration Discord.

## Activer la connexion Discord
1. Aller sur https://discord.com/developers/applications et créer une application « Myrradiel ».
2. Dans **OAuth2**, copier le Client ID et générer/copier le Client Secret (à garder secret).
3. Ajouter une **Redirect URI** exacte : `http://localhost:3000/auth/callback` pour les essais.
4. Définir les variables d'environnement `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`, `SESSION_SECRET`, `BASE_URL`. Le fichier `.env.example` est un modèle : Node ne le charge pas automatiquement.
5. Sur Windows PowerShell :
   ```powershell
   $env:DISCORD_CLIENT_ID="VOTRE_ID"
   $env:DISCORD_CLIENT_SECRET="VOTRE_SECRET"
   $env:SESSION_SECRET="UNE_CLE_LONGUE_ET_ALEATOIRE"
   $env:BASE_URL="http://localhost:3000"
   node server.js
   ```
6. Cliquer sur « Lier mon Discord » puis autoriser l'application. Le pseudo Discord et l'avatar apparaissent.

## Mettre en ligne sur myrradiel.fr
- Prendre un hébergement Node.js (VPS, Render, Railway, etc.). Déployer le dossier du projet.
- Ajouter les variables d'environnement dans le tableau de bord de l'hébergeur, avec `BASE_URL=https://myrradiel.fr` et `NODE_ENV=production`.
- Ajouter `https://myrradiel.fr/auth/callback` aux Redirect URIs de Discord.
- Configurer les DNS du domaine vers l'hébergement et activer HTTPS.
- Ne jamais publier le Client Secret ni SESSION_SECRET dans les fichiers publics.

## À savoir
- Le site contient une page d'accueil fonctionnelle, un menu responsive, des sections de démonstration et l'authentification Discord.
- Les pages Règlement, Lore, Wiki, QCM, Galerie et Boutique sont des emplacements à remplir, pas encore des services complets.
- Les sessions sont stockées en mémoire : elles sont perdues au redémarrage. Pour une mise en production sérieuse, ajouter une base de données ou un stockage de sessions persistant, une politique de confidentialité et une protection contre les abus.
- L'application demande uniquement la permission OAuth2 `identify`. Elle ne rejoint pas un serveur Discord automatiquement.


## Contenu ajouté

- **Règlement** : texte intégral de `Markdown collé (2).md` dans la rubrique Règlement.
- **Wiki** : texte intégral « Comprendre votre baguette » de `Markdown collé.md` dans la rubrique Wiki.
- Les autres rubriques et la connexion Discord conservent leur fonctionnement précédent.
- Pour tester : dans `myrradiel_site`, lancer `node server.js` puis ouvrir http://localhost:3000. Si le port 3000 est occupé, fermer l’ancien serveur avec Ctrl+C.
- Pour Discord, compléter les variables d’environnement comme indiqué plus haut ; aucune clé secrète n’est incluse.
