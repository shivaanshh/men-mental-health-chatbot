// mood.js – handles saving and displaying mood journal entries using localStorage

document.addEventListener('DOMContentLoaded', () => {
    const moodSelect = document.getElementById('mood');
    const entryTextarea = document.getElementById('entry');
    const saveButton = document.getElementById('save-entry');
    const entriesList = document.getElementById('entries-list');
  
    // Load existing entries from localStorage
    let entries = [];
    const stored = localStorage.getItem('journalEntries');
    if (stored) {
      try {
        entries = JSON.parse(stored);
      } catch (e) {
        console.error("Error parsing stored entries", e);
        entries = [];
      }
    }
  
    // Function to display all entries on the page
    function renderEntries() {
      entriesList.innerHTML = "";
      if (entries.length === 0) {
        entriesList.innerHTML = "<li>No entries yet. Your saved reflections will appear here.</li>";
        return;
      }
      entries.forEach((entry) => {
        const li = document.createElement('li');
        const dateSpan = document.createElement('div');
        dateSpan.className = 'entry-date';
        dateSpan.textContent = entry.date;
        const contentSpan = document.createElement('div');
        contentSpan.className = 'entry-content';
        contentSpan.textContent = `${entry.mood} ${entry.text}`;
        li.appendChild(dateSpan);
        li.appendChild(contentSpan);
        entriesList.appendChild(li);
      });
    }
  
    // Initial render
    renderEntries();
  
    // Save new entry
    saveButton.addEventListener('click', () => {
      const mood = moodSelect.value;
      const text = entryTextarea.value.trim();
      if (!text) {
        alert("Please write something for your journal entry.");
        return;
      }
      const now = new Date();
      const entry = {
        date: now.toLocaleString(),
        mood: mood,
        text: text
      };
      entries.push(entry);
      localStorage.setItem('journalEntries', JSON.stringify(entries));
      entryTextarea.value = "";
      renderEntries();
    });
  });
  