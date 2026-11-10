// Temporary script to add missing fields to all reviewer entries
const fs = require('fs');

const storageFile = 'server/storage.ts';
let content = fs.readFileSync(storageFile, 'utf8');

// Add missing authentication fields to reviewer entries that don't have them
const reviewerPattern = /{\s*jobFamily:\s*"[^"]*",\s*completed:\s*\d+,\s*inProgress:\s*\d+,\s*responsible:\s*"[^"]*",\s*createdAt:\s*now,\s*updatedAt:\s*now,\s*},/g;

content = content.replace(reviewerPattern, (match) => {
  if (!match.includes('username:')) {
    return match.replace(
      'responsible: "',
      'responsible: "'
    ).replace(
      'createdAt: now,',
      'username: null,\n        fullName: null,\n        email: null,\n        createdAt: now,'
    );
  }
  return match;
});

fs.writeFileSync(storageFile, content);
// console.log('Fixed storage authentication fields');