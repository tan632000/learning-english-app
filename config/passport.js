const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

module.exports = function(passport) {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: '/api/auth/google/callback', // Sử dụng relative path, an toàn hơn
            },
            async (accessToken, refreshToken, profile, done) => {
                // Dữ liệu Google trả về
                const newUser = {
                    googleId: profile.id,
                    // Tạo username duy nhất từ displayName và một phần googleId
                    username: profile.displayName.replace(/\s/g, '') + profile.id.slice(0, 4),
                    email: profile.emails[0].value,
                    avatarUrl: profile.photos[0].value,
                };

                try {
                    // Tìm người dùng trong DB bằng googleId
                    let user = await User.findOne({ googleId: profile.id });

                    if (user) {
                        // Nếu đã có, trả về người dùng đó
                        return done(null, user);
                    } else {
                        // Nếu chưa có, tạo người dùng mới
                        user = await User.create(newUser);
                        return done(null, user);
                    }
                } catch (err) {
                    console.error(err);
                    return done(err, false);
                }
            }
        )
    );

    // Chúng ta không dùng session nên không cần serialize/deserialize
    // passport.serializeUser((user, done) => done(null, user.id));
    // passport.deserializeUser((id, done) => User.findById(id, (err, user) => done(err, user)));
};
