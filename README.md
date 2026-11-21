# Atelier Fiches — application web reliée à l'API OpenAI

**Version 2.0 — Génération avec OpenAI Responses API.** Application francophone qui crée une fiche pédagogique à partir d'un cours, de documents d'activités, d'une fiche exemplaire et des textes de référence (programme et orientations pédagogiques).

## Fonctions disponibles

- Import de **PDF textuels, DOCX, TXT et MD** pour quatre catégories : cours, fiche modèle, orientations pédagogiques et programme.
- Extraction locale des textes PDF/Word, détection indicative des rubriques et des couleurs du modèle.
- Personnalisation de la discipline, du niveau, du chapitre, du nombre et de la durée des séances.
- **Générer avec OpenAI** : appel serveur à `POST /api/generate` via la **Responses API**, avec réponse JSON structurée et vérification des durées.
- Contrôle et édition de la fiche dans le navigateur, export Word (.docx) et PDF (via le navigateur).
- Trame sans IA, qui continue de fonctionner si l'API est indisponible.

L'application utilise le **cours pour le contenu scientifique**, le **programme et les orientations pour les prescriptions** et la **fiche exemplaire pour la structure et les couleurs**. La structure est reproduite de façon approchée, et les contenus doivent être relus par un enseignant avant diffusion.

## 1. Créer votre clé API OpenAI

1. Ouvrez **https://platform.openai.com/api-keys** avec votre compte OpenAI, puis créez une clé de projet.
2. Configurez si nécessaire la facturation et les limites de dépenses sur **https://platform.openai.com/**.
3. **Ne collez jamais cette clé dans la page web, un fichier HTML, JavaScript client ou une conversation.** Elle doit être installée uniquement comme variable secrète du serveur.

> **Important :** ChatGPT Plus/Pro et les appels à l'API OpenAI sont des services à facturation distincte. L'abonnement ChatGPT ne remplace pas une clé API.

## 2A. Utilisation locale (avec serveur)

Prérequis : Node.js **22 ou supérieur**.

```bash
# À la racine du dossier de l'application :
cp .env.example .env
# Ouvrir .env et y remplacer la valeur fictive par votre clé réelle.
npm run dev
```

Ouvrir ensuite **http://localhost:8080**.

Exemple de fichier `.env` (à ne pas publier) :

```dotenv
OPENAI_API_KEY=sk-votre_cle_de_projet_ici
OPENAI_MODEL=gpt-6.2-sol
APP_ACCESS_CODE=code_prive_facultatif
```

Le modèle est configurable avec `OPENAI_MODEL` selon les droits disponibles dans votre projet API (par exemple `gpt-6.2-astra` pour davantage de qualité, à un coût supérieur).

Le bouton **« Tester la configuration »** indique si une clé est présente, mais **ne vérifie pas les crédits ni la validité de la clé**. Seule une génération réelle valide l'appel au service. En cas de `APP_ACCESS_CODE` activé, renseignez ce code dans le champ correspondant de l'application : ce n'est pas la clé API.

La page `Ouvrir_hors_ligne.html` permet de préparer la trame et les exports sans serveur, **mais ne peut pas appeler l'API OpenAI directement**. Utilisez `npm run dev` pour activer l'IA.

## 2B. Déploiement sur Vercel

1. Créez un projet Vercel et importez **le dossier de l'application**, avec `index.html`, `assets/`, `api/generate.js`, `vendor/` et `vercel.json`.
2. Framework **Other** (pas de commande de build nécessaire).
3. Dans **Settings > Environment Variables**, ajoutez :
   - `OPENAI_API_KEY` = votre clé OpenAI secrète ;
   - `OPENAI_MODEL` = `gpt-6.2-sol` (facultatif) ;
   - `APP_ACCESS_CODE` = un code privé fort, **vivement recommandé pour un site public**.
4. Déployez et ouvrez l'application via son URL HTTPS. Vérifiez la configuration dans l'étape **Production**.
5. Importez les documents, puis cliquez sur **Générer avec OpenAI**.

**Protection des coûts :** une clé serveur cachée ne suffit pas à empêcher des visiteurs non autorisés d'utiliser le générateur. Si le site doit être public, activez un contrôle d'accès (au minimum `APP_ACCESS_CODE`, et idéalement une authentification et une limitation de fréquence côté serveur), ainsi que les budgets/limites de facturation du projet OpenAI.

## Données et confidentialité

- Les fichiers restent dans le navigateur au moment de l'import.
- Uniquement au clic sur **Générer avec OpenAI**, des **extraits de texte** des références sont transmis au serveur, puis à l'API OpenAI. Les fichiers binaires d'origine ne sont pas envoyés par ce bouton.
- La requête à OpenAI utilise `store: false` pour ne pas stocker l'objet de réponse côté API. Cela **ne constitue pas** une garantie d'absence totale de conservation selon toutes les politiques du fournisseur.
- Aucun historique des fichiers n'est conservé dans une base de données de l'application.
- Les PDF scannés doivent être traités par OCR avant import ; les figures et schémas non textuels ne sont pas analysés par ce générateur.
- Les documents très longs sont **tronqués** afin de maîtriser le coût et le délai ; vérifier que les extraits contiennent bien les parties pertinentes.

## Vérification technique

```bash
npm run check
npm test
```

`GET /api/generate` retourne l'état de la configuration et **jamais la clé**. `POST /api/generate` accepte une charge JSON (`settings`, `documents`, `structure`, `names`) et renvoie `fiche`, `alertes` et `sourcesUtilisees` après génération.

**Limite importante :** faute de clé réelle fournie au serveur, on peut vérifier la connexion, la gestion des erreurs et le format via des tests simulés, mais on ne peut pas confirmer une génération de bout en bout sur un compte OpenAI réel avant de configurer votre clé.
