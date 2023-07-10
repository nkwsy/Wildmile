/**
 * mod dependencies.
 */
const express = require('express');
const compression = require('compression');
const session = require('express-session');
const bodyParser = require('body-parser');
const logger = require('morgan');
const errorHandler = require('errorhandler');
const lusca = require('lusca');
const dotenv = require('dotenv');
const MongoStore = require('connect-mongo');
const flash = require('express-flash');
const path = require('path');
const mongoose = require('mongoose');
const passport = require('passport');
const expressValidator = require('express-validator');
const expressStatusMonitor = require('express-status-monitor');
const sass = require('node-sass-middleware');
const multer = require('multer');

const upload = multer({ dest: path.join(__dirname, 'uploads') });

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.config({ path: '.env' });

/**
 * Controllers (route handlers).
 */
const homeController = require('./controllers/home');
const userController = require('./controllers/user');
const apiController = require('./controllers/api');
const contactController = require('./controllers/contact');

const plantController = require('./controllers/plant');
const modController = require('./controllers/mod');
const modInfoController = require('./controllers/modInfo');
const pdfController = require('./controllers/pdfGen');
const trashController = require('./controllers/trash');

/**
 * API keys and Passport configuration.
 */
const passportConfig = require('./config/passport');

/**
 * Create Express server.
 */
const app = express();

/**
 * Connect to MongoDB.
 */
// mongoose.set('useFindAndModify', false);
// mongoose.set('useCreateIndex', true);
// mongoose.set('useNewUrlParser', true);, {useUnifiedTopology: true}
mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.on('error', (err) => {
  console.error(err);
  console.log('%s MongoDB connection error. Please make sure MongoDB is running.');
  process.exit();
});

/**
 * Express configuration.
 */
app.set('host', process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0');
app.set('port', process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Custom SSL fowarder
function requireHTTPS(req, res, next) {
  // The 'x-forwarded-proto' check is for Heroku
  if (!req.secure && req.get('x-forwarded-proto') !== 'https' && process.env.NODE_ENV !== 'development') {
    return res.redirect('https://' + req.get('host') + req.url);
  }
  next();
}
// app.use(requireHTTPS);
//
app.use(expressStatusMonitor());
app.use(compression());
app.use(sass({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public')
}));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: process.env.SESSION_SECRET,
  cookie: { maxAge: 1209600000 }, // Two weeks in milliseconds
  store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use((req, res, next) => {
  if (req.path === '/api/upload') {
    next();
  } else {
    lusca.csrf()(req, res, next);
  }
});
app.use(lusca.xframe('SAMEORIGIN'));
app.use(lusca.xssProtection(true));
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});
app.use((req, res, next) => {
  // After successful login, redirect back to the intended page
  if (!req.user
    && req.path !== '/login'
    && req.path !== '/signup'
    && !req.path.match(/^\/auth/)
    && !req.path.match(/\./)) {
    req.session.returnTo = req.originalUrl;
  } else if (req.user
    && (req.path === '/account' || req.path.match(/^\/api/))) {
    req.session.returnTo = req.originalUrl;
  }
  next();
});
app.use('/', express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));
app.use('/js/lib', express.static(path.join(__dirname, 'node_modules/popper.js/dist/umd'), { maxAge: 31557600000 }));
app.use('/js/lib', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js'), { maxAge: 31557600000 }));
app.use('/js/lib', express.static(path.join(__dirname, 'node_modules/jquery/dist'), { maxAge: 31557600000 }));
app.use('/webfonts', express.static(path.join(__dirname, 'node_modules/@fortawesome/fontawesome-free/webfonts'), { maxAge: 31557600000 }));
/**
 * Primary app routes.
 */
app.get('/', homeController.index);
app.get('/login', userController.getLogin);
app.post('/login', userController.postLogin);
app.get('/logout', userController.logout);
app.get('/forgot', userController.getForgot);
app.post('/forgot', userController.postForgot);
app.get('/reset/:token', userController.getReset);
app.post('/reset/:token', userController.postReset);
app.get('/signup', userController.getSignup);
app.post('/signup', userController.postSignup);
app.get('/contact', contactController.getContact);
app.post('/contact', contactController.postContact);
app.get('/account', passportConfig.isAuthenticated, userController.getAccount);
app.post('/account/profile', passportConfig.isAuthenticated, userController.postUpdateProfile);
app.post('/account/password', passportConfig.isAuthenticated, userController.postUpdatePassword);
app.post('/account/delete', passportConfig.isAuthenticated, userController.postDeleteAccount);
app.get('/account/unlink/:provider', passportConfig.isAuthenticated, userController.getOauthUnlink);

app.route('/plants')
  .get(plantController.getPlants);

app.post('/plants/delete/:id', passportConfig.isAuthenticated, plantController.postDeletePlant);

app.route('/plantHome')
  .get(plantController.getPlantHome)
  .post(passportConfig.isAdmin, plantController.postPlantsAdmin);

app.route('/plantsadmin')
  .all(passportConfig.isAuthenticated)
  .get(plantController.getPlantsAdmin)
  .post(passportConfig.isAdmin, plantController.postPlantsAdmin);

app.route('/modmap')
  .get(modController.getModMap)
  .post(passportConfig.isAdmin, modController.postMod);

app.route('/module/:x&:y')
  .all(passportConfig.isAuthenticated)
  .get(modController.getMod)
  .post(passportConfig.isAdmin, modController.postMod);

app.route('/modInfo')
  .all(passportConfig.isAuthenticated)
  .get(modInfoController.getModinfo)
  .post(modInfoController.findModInfo);

app.route('/pdf')
  .all(passportConfig.isAuthenticated)
  .get(pdfController.getPdf);

app.route('/api/getInfo')
  .get(modInfoController.updateModInfo);

app.route('/api/getModTags')
  .get(modInfoController.getModTags);

app.post('/module/delete/:id', passportConfig.isAuthenticated, passportConfig.isAdmin, modController.postDeleteMod);
app.post('/module/update', passportConfig.isAuthenticated, passportConfig.isAdmin, modController.postClearModPlants, modController.postUpdateMod);

app.route('/projects/new')
  .all(passportConfig.isAuthenticated, passportConfig.isAdmin)
  .get(modController.getNewProject)
  .post(passportConfig.isAuthenticated, modController.postNewProject)

app.route('/projects/edit/:id')  
  .all(passportConfig.isAuthenticated, passportConfig.isAdmin)
  .get(modController.getUpdateProject)
  .post(passportConfig.isAuthenticated, modController.postUpdateProject)
  .delete(passportConfig.isAuthenticated, modController.deleteProject);

app.route('/projects/:project_id/sections/new')
  .all(passportConfig.isAuthenticated, passportConfig.isAdmin)
  .get(modController.getNewSection)
  .post(passportConfig.isAuthenticated, modController.postNewSection)

app.route('/projects/:project_id/sections/edit/:id')  
  .all(passportConfig.isAuthenticated, passportConfig.isAdmin)
  .get(modController.getUpdateSection)
  .post(passportConfig.isAuthenticated, modController.postUpdateSection)
  .delete(passportConfig.isAuthenticated, modController.deleteSection);


app.route('/trash')
  .all(passportConfig.isAuthenticated)
  .get(trashController.getTrash);

app.route('/trash/trashLogs')
  .all(passportConfig.isAuthenticated)
  .get(trashController.getTrashLogs)
  .post(trashController.postNewTrashLog);

app.route('/trash/trashLog/:logId')
  .all(passportConfig.isAuthenticated)
  .get(trashController.getTrashLog)
  .post(trashController.postClearLogItems, trashController.postTrashLog);

app.route('/api/getTrashLogInfo/:logId')
  .get(trashController.getTrashLogInfo);

app.route('/trash/trashLog/delete/:logId')
  .all(passportConfig.isAuthenticated)
  .get(trashController.postDeleteTrashLog);

app.route('/trash/trashItems')
  .all(passportConfig.isAuthenticated)
  .get(trashController.getTrashItems)
  .post(trashController.postTrashItem);

app.route('/trash/trashInfo')
  .all(passportConfig.isAuthenticated)
  .get(trashController.getTrashInfo);
  // .post(trashController.findTrashInfo);

/**
 * API examples routes.
 */
app.get('/api', apiController.getApi);
app.get('/api/aviary', apiController.getAviary);
app.get('/api/twilio', apiController.getTwilio);
app.post('/api/twilio', apiController.postTwilio);
app.get('/api/clockwork', apiController.getClockwork);
app.post('/api/clockwork', apiController.postClockwork);
app.get('/api/lob', apiController.getLob);
app.get('/api/upload', apiController.getFileUpload);
app.post('/api/upload', upload.single('myFile'), apiController.postFileUpload);
app.get('/api/google-maps', apiController.getGoogleMaps);

/**
 * Error Handler.
 */
if (process.env.NODE_ENV === 'development') {
  // only use in development
  app.use(errorHandler());
} else {
  app.use((err, req, res) => {
    console.error(err);
    res.status(500).send('Server Error');
  });
}

/**
 * Start Express server.
 */
app.listen(app.get('port'), () => {
  console.log('App is running at http://localhost:%d in %s mode', app.get('port'), app.get('env'));
  console.log('  Press CTRL-C to stop\n');
});

module.exports = app;
