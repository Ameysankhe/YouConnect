import passport from 'passport';
import LocalStrategy from 'passport-local';
import bcrypt from 'bcryptjs';
import pool from './db.js';

passport.use(new LocalStrategy({
  usernameField: 'email', 
  passwordField: 'password'
}, async (email, password, done) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    if (!user) return done(null, false, { message: 'No user with that email' });

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (isMatch) return done(null, user);

    return done(null, false, { message: 'Incorrect password' });
  } catch (err) {
    return done(err);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    done(null, result.rows[0]);
  } catch (err) {
    done(err);
  }
});

export default passport;
