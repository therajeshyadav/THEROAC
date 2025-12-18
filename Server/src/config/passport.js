const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
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
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.BASE_URL || 'http://localhost:4000'}/api/auth/google/callback`
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

                // Create new user (role defaulting to 'candidate' or based on flow)
                // Note: We might need to ask for role. For now, default to candidate.
                user = await User.create({
                    firstName: profile.name.givenName,
                    lastName: profile.name.familyName,
                    email: profile.emails[0].value,
                    googleId: profile.id,
                    role: 'candidate', // Default role
                    isVerified: true, // Google emails are verified
                    profilePicture: profile.photos && profile.photos[0] ? profile.photos[0].value : null
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

// LinkedIn Strategy
if (process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET) {
    passport.use(new LinkedInStrategy({
        clientID: process.env.LINKEDIN_CLIENT_ID,
        clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
        callbackURL: `${process.env.BASE_URL || 'http://localhost:4000'}/api/auth/linkedin/callback`,
        scope: ['openid', 'profile', 'email']
    },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // LinkedIn profile structure varies, adjust accessors as needed
                const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;

                if (!email) {
                    return done(new Error('No email found from LinkedIn profile'), null);
                }

                let user = await User.findOne({ where: { email } });

                if (user) {
                    if (!user.linkedinId) {
                        user.linkedinId = profile.id;
                        if (!user.profilePicture && profile.photos && profile.photos[0]) {
                            user.profilePicture = profile.photos[0].value;
                        }
                        await user.save();
                    }
                    return done(null, user);
                }

                user = await User.create({
                    firstName: profile.name.givenName,
                    lastName: profile.name.familyName,
                    email: email,
                    linkedinId: profile.id,
                    role: 'candidate',
                    isVerified: true,
                    profilePicture: profile.photos && profile.photos[0] ? profile.photos[0].value : null
                });

                return done(null, user);
            } catch (error) {
                return done(error, null);
            }
        }
    ));
} else {
    console.warn("⚠️  LINKEDIN_CLIENT_ID or LINKEDIN_CLIENT_SECRET is missing. LinkedIn Auth disabled.");
}

module.exports = passport;
