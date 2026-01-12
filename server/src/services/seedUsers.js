import bcrypt from 'bcryptjs';
import db from './db.js';

// Default users list - 12 users with auto-generated credentials
const defaultUsers = [
    { username: 'admin', password: 'Admin123!', name: 'Главный енот' },
    { username: 'user1', password: 'Foxy_Jump_2024*', name: 'Смешная лисичка' },
    { username: 'user2', password: 'Mushroom_Power_55', name: 'Бодрый подберезовик' },
    { username: 'user3', password: 'Meow_Dance_Party!', name: 'Танцующий кот' },
    { username: 'user4', password: 'Slow_Sloth_777#', name: 'Ленивый ленивец' },
    { username: 'user5', password: 'Tricky_Dumpling_1', name: 'Хитрый пельмень' },
    { username: 'user6', password: 'Sad_Cucumber_404', name: 'Грустный огурчик' },
    { username: 'user7', password: 'Happy_Capy_888', name: 'Веселый капибара' },
    { username: 'user8', password: 'Wise_Sage_101!', name: 'Мудрый шалфей' },
    { username: 'user9', password: 'Jumping_Penguin_2', name: 'Прыгучий пингвин' },
    { username: 'user10', password: 'Sleepy_Hamster_Zz', name: 'Сонный хомяк' },
    { username: 'user11', password: 'Tiny_Terror_666', name: 'Грозный хомячок' }
];

/**
 * Seed users into the database
 * Creates new users or updates existing ones
 */
export async function seedUsers() {
    try {
        for (const user of defaultUsers) {
            // Check if user already exists
            const existing = await db.execute({
                sql: 'SELECT id FROM users WHERE username = ?',
                args: [user.username]
            });

            const passwordHash = await bcrypt.hash(user.password, 10);

            if (existing.rows.length === 0) {
                // Create new user
                await db.execute({
                    sql: 'INSERT INTO users (username, password_hash, name) VALUES (?, ?, ?)',
                    args: [user.username, passwordHash, user.name]
                });
                console.log(`Created user: ${user.username}`);
            } else {
                // Update existing user's password and name
                await db.execute({
                    sql: 'UPDATE users SET password_hash = ?, name = ? WHERE username = ?',
                    args: [passwordHash, user.name, user.username]
                });
                console.log(`Updated user: ${user.username}`);
            }
        }
        console.log('User seeding completed');
    } catch (error) {
        console.error('Error seeding users:', error);
        throw error;
    }
}

/**
 * Get user credentials for display/documentation
 */
export function getUserCredentials() {
    return defaultUsers.map(u => ({ username: u.username, password: u.password, name: u.name }));
}

export default defaultUsers;
