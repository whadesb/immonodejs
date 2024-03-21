const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const flash = require('connect-flash');
const app = express();

// Configuration de MongoDB 
mongoose.connect('mongodb://18.132.63.195:27017/mydatabase');

// Configuration d'Express
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({ secret: 'votreSecret', resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash()); 

// Définition du schéma utilisateur MongoDB
const UserSchema = mongoose.Schema({
  username: String,
  email: String,
  password: String,
  firstName: String, // Champ prénom
  lastName: String, // Champ nom
});

const User = mongoose.model('User', UserSchema);

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

// Middleware pour passer ma variable user à toutes les vues
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

// Routes
app.get('/', (req, res) => {
  res.render('index');
});

app.get('/inscription', (req, res) => {
  res.render('inscription');
});

app.post('/inscription', async (req, res) => {
  try {
    const { username, email, password, passwordConfirmation, firstName, lastName } = req.body;

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
      firstName: firstName, // Enregistrer le prénom
      lastName: lastName, // Enregistrer le nom
    });

    await user.save();
    
    // Rediriger vers ma page de connexion
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
      // Gérer mon erreur  si nécessaire
      console.error(err);
    }
    res.redirect('/connexion'); // Rediriger vers ma page de connexion après la déconnexion
  });
});

app.listen(3000, () => {
  console.log('Le serveur est en écoute sur le port 3000');
});
