const db = supabase.createClient(
  'https://mvovikninvudypyuhdqg.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12b3Zpa25pbnZ1ZHlweXVoZHFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4NTYwMDUsImV4cCI6MjA2MDQzMjAwNX0.--P87UP40-a0y7clZ103CkwoO1kz9wUVK_nHpJ-mC4M'
);

// Toggle dropdown when clicking profile image
const profileImage = document.getElementById('profileImage');
const dropdownMenu = document.getElementById('dropdownMenu');

profileImage.addEventListener('click', () => {
  dropdownMenu.style.display = dropdownMenu.style.display === 'flex' ? 'none' : 'flex';
});
