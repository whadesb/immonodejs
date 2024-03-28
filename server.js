const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const flash = require('connect-flash');
const app = express();
const phpExpress = require('php-express')();

// Configuration de MongoDB
mongoose.connect('mongodb://localhost:27017/immo', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Configuration d'Express
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({ secret: 'votreSecret', resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash()); // Ajout du support pour flash messages

// Définition du schéma utilisateur MongoDB
const User = mongoose.model('User', {
  username: String,
  email: String,
  password: String,
});

// Configuration de Passport
passport.use(new LocalStrategy(async (username, password, done) => {
  try {
    const user = await User.findOne({ username: username }).exec();
    if (!user) return done(null, false, { message: 'Nom d\'utilisateur incorrect.' });
    if (!bcrypt.compareSync(password, user.password)) return done(null, false, { message: 'Mot de passe incorrect.' });
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id)
    .then(user => {
      done(null, user);
    })
    .catch(err => {
      done(err);
    });
});

// Middleware pour passer la variable user à toutes les vues
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

//php
app.engine('php', phpExpress.engine);
app.set('view engine', 'php');
app.use(phpExpress.router);

// Définir le répertoire racine pour les fichiers PHP
phpExpress.root(__dirname + '/php');

// Utiliser phpExpress.router pour gérer les requêtes PHP
app.all(/.+\.php$/, phpExpress.router);

// Routes
app.get('/', (req, res) => {
  res.render('index');
});

app.get('/inscription', (req, res) => {
  res.render('inscription');
});

app.post('/inscription', async (req, res) => {
  try {
    const { username, email, password, passwordConfirmation } = req.body;

    // Vérifier si les mots de passe correspondent
    if (password !== passwordConfirmation) {
      return res.render('inscription', { message: 'Les mots de passe ne correspondent pas.' });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      username: username,
      email: email,
      password: hashedPassword,
    });

    await user.save();
    
    // Rediriger vers la page de connexion
    res.redirect('/connexion');
  } catch (error) {
    res.render('inscription', { message: 'Erreur lors de l\'inscription.' });
  }
});

app.get('/connexion', (req, res) => {
  res.render('connexion');
});

app.post('/connexion', passport.authenticate('local', {
  successRedirect: '/dashboard',
  failureRedirect: '/connexion',
  failureFlash: true,
}));

app.get('/dashboard', (req, res) => {
  if (!req.isAuthenticated()) return res.redirect('/connexion');
  res.render('dashboard');
});

app.get('/deconnexion', (req, res) => {
  req.logout(function(err) {
    if (err) {
      // Gérer l'erreur ici si nécessaire
      console.error(err);
    }
    res.redirect('/connexion'); // Rediriger vers la page de connexion après la déconnexion
  });
});

app.listen(3000, () => {
  console.log('Le serveur est en écoute sur le port 3000');
});
