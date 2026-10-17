import fs from 'fs';
let content = fs.readFileSync('src/lib/activity.ts', 'utf-8');

const importStatement = `import { checkAndAwardBadges } from './badges';\n`;
content = importStatement + content;

const oldEnd = `  } catch (err) {
    console.error('Failed to record activity:', err);
  }
}`;

const newEnd = `    // 3. Check for newly earned badges
    const newBadges = await checkAndAwardBadges(studentId);
    if (newBadges && newBadges.length > 0) {
       // Dispatch custom event to trigger toast in UI
       if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('badgesAwarded', { detail: newBadges }));
       }
    }
  } catch (err) {
    console.error('Failed to record activity:', err);
  }
}`;

content = content.replace(oldEnd, newEnd);
fs.writeFileSync('src/lib/activity.ts', content);
