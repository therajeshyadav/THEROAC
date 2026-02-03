const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { User } = require('../models');

// Serialize user for the session (though we might use JWT immediately)
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findByPk(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

// Google Strategy
if (process.env.GMAIL_CLIENT_ID && process.env.GMAIL_CLIENT_SECRET) {
    // const callback = `${process.env.BACKEND_URL}/api/auth/google/callback`;
    // console.log('>>> GOOGLE CALLBACK USED:', callback);
    passport.use(new GoogleStrategy({
        clientID: process.env.GMAIL_CLIENT_ID,
        clientSecret: process.env.GMAIL_CLIENT_SECRET,
        callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`,
    },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Check if user already exists
                let user = await User.findOne({ where: { email: profile.emails[0].value } });

                if (user) {
                    // Update user's googleId if not set
                    if (!user.googleId) {
                        user.googleId = profile.id;
                        // Optionally update avatar if missing
                        if (!user.profilePicture && profile.photos && profile.photos[0]) {
                            user.profilePicture = profile.photos[0].value;
                        }
                        await user.save();
                    }
                    return done(null, user);
                }

                const fullName = `${profile.name.givenName} ${profile.name.familyName}`.trim() || profile?.displayName;

                user = await User.create({
                    firstName: profile.name.givenName,
                    lastName: profile.name.familyName,
                    fullName,
                    email: profile.emails[0].value,
                    googleId: profile.id,
                    role: 'candidate',
                    isVerified: true,
                    emailVerifiedAt: new Date(),
                    profilePicture: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
                    lastLoginAt: new Date(),
                });

                return done(null, user);
            } catch (error) {
                return done(error, null);
            }
        }
    ));
} else {
    console.warn("⚠️  GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is missing. Google Auth disabled.");
}

module.exports = passport;
