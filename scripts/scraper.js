const axios = require('axios');
const cheerio = require('cheerio');
const mongoose = require('mongoose');
// Cần chỉ định đường dẫn đến file .env vì script này nằm trong thư mục con
require('dotenv').config({ path: __dirname + '/../.env' });

const Course = require('../models/Course');

/**
 * Hàm này cào dữ liệu các khóa học từ một URL.
 * LƯU Ý: Các selector (ví dụ: '.course-card') hoàn toàn phụ thuộc vào cấu trúc HTML của trang web bạn muốn cào.
 * Bạn cần phải "Inspect" (Kiểm tra phần tử) trên trình duyệt để tìm đúng selector.
 */
async function scrapeCourses(url) {
    try {
        console.log(`[SCRAPER] Fetching data from: ${url}`);
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        const scrapedCourses = [];

        // Ví dụ: Mỗi khóa học nằm trong một div có class 'course-item'
        $('.course-item').each((index, element) => {
            const title = $(element).find('h3.course-title').text().trim();
            const description = $(element).find('p.course-description').text().trim();
            // Lấy URL hình ảnh, có thể từ thẻ <img> hoặc background-image
            const thumbnailUrl = $(element).find('img').attr('src');
            // Lấy cấp độ, có thể từ một thẻ span hoặc data-attribute
            const level = $(element).find('.course-level').text().trim().toLowerCase();

            // Chỉ thêm vào nếu có đủ thông tin cơ bản
            if (title && description && thumbnailUrl && ['beginner', 'intermediate', 'advanced'].includes(level)) {
                scrapedCourses.push({
                    title,
                    description,
                    thumbnailUrl,
                    level,
                    isPublished: true, // Mặc định cho hiển thị luôn
                });
            }
        });

        console.log(`[SCRAPER] Found ${scrapedCourses.length} potential courses.`);
        return scrapedCourses;
    } catch (error) {
        console.error(`[SCRAPER] Error during scraping: ${error.message}`);
        return [];
    }
}

async function seedData() {
    try {
        console.log('[SEEDER] Connecting to database...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('[SEEDER] Database connected.');

        // Xóa dữ liệu cũ để tránh trùng lặp
        await Course.deleteMany({});
        console.log('[SEEDER] Old courses deleted.');

        // URL của trang bạn muốn cào dữ liệu
        const targetUrl = 'https://www.example-english-site.com/courses'; // <-- THAY THẾ BẰNG URL THẬT
        const coursesToSave = await scrapeCourses(targetUrl);

        if (coursesToSave.length > 0) {
            await Course.insertMany(coursesToSave);
            console.log(`[SEEDER] Successfully inserted ${coursesToSave.length} courses into the database.`);
        } else {
            console.log('[SEEDER] No courses were scraped or saved.');
        }

    } catch (error) {
        console.error(`[SEEDER] An error occurred: ${error.message}`);
    } finally {
        await mongoose.disconnect();
        console.log('[SEEDER] Database disconnected.');
    }
}

seedData();