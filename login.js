<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Connexion</title>
  <link rel="stylesheet" href="style.css">
  <style>
    body { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; background: #222; color: #fff;}
    form { background: #333; padding: 2rem; border-radius: 10px; box-shadow: 0 0 10px #0005;}
    input { display: block; margin: 1rem 0; padding: 0.5rem; border-radius: 5px; border: none; width: 100%;}
    button { width: 100%; padding: 0.7rem; background: #00bfff; color: #fff; border: none; border-radius: 8px; font-size: 1.2rem; cursor: pointer;}
    button:hover { background: #0077b6;}
    .error { color: #ff5252; margin-bottom: 1rem; text-align: center;}
  </style>
</head>
<body>
  <h1>Connexion</h1>
  <form id="loginForm">
    <input type="email" id="email" placeholder="Email" required autocomplete="username">
    <input type="password" id="password" placeholder="Mot de passe" required autocomplete="current-password">
    <div class="error" id="errorMsg"></div>
    <button type="submit">Se connecter</button>
  </form>
  <script type="module" src="firebase-auth.js"></script>
</body>
</html>