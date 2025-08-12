const fs = require('fs');
const path = require('path');

const PHOTO_DIR = path.join(__dirname, 'src', 'photos');
const PHOTO_COUNT = 5;

const photoNames = ["Misty Morning", "City Sunset", "Forest Trail", "Ocean Waves", "Mountain Peak"];
const locations = ["New York, USA", "Paris, France", "Tokyo, Japan", "Sydney, Australia", "Cairo, Egypt"];
const tags = ["travel", "nature", "city", "portrait", "ocean", "mountains", "landscape", "architecture"];

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomDate() {
  const end = new Date();
  const start = new Date();
  start.setFullYear(start.getFullYear() - 5);
  const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return randomDate.toISOString().split('T')[0];
}

function getRandomCoordinates() {
    const latitude = (Math.random() * 180 - 90).toFixed(6);
    const longitude = (Math.random() * 360 - 180).toFixed(6);
    return { latitude, longitude };
}

function getRandomTags() {
    const numTags = Math.floor(Math.random() * 3) + 3; // 3 to 5 tags
    const selectedTags = new Set();
    while (selectedTags.size < numTags) {
        selectedTags.add(getRandomItem(tags));
    }
    return Array.from(selectedTags);
}

function generatePhotoContent(index) {
    const { latitude, longitude } = getRandomCoordinates();
    const content = `---
name: "${getRandomItem(photoNames)} #${index + 1}"
date: ${getRandomDate()}
location: "${getRandomItem(locations)}"
imageUrl: "/images/alaska-trip.png"
tags:
  - photos
${getRandomTags().map(tag => `  - ${tag}`).join('\n')}
latitude: ${latitude}
longitude: ${longitude}
---

This is the body for photo #${index + 1}.
`;
    return content;
}

function createMockPhotos() {
    if (!fs.existsSync(PHOTO_DIR)) {
        fs.mkdirSync(PHOTO_DIR, { recursive: true });
    }

    for (let i = 0; i < PHOTO_COUNT; i++) {
        const filePath = path.join(PHOTO_DIR, `photo-${i + 1}.md`);
        const fileContent = generatePhotoContent(i);
        fs.writeFileSync(filePath, fileContent);
    }

    console.log(`Successfully generated ${PHOTO_COUNT} photo files in ${PHOTO_DIR}`);
}

createMockPhotos();
