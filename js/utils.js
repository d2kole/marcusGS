// Utility functions for Marcus Savings
(function(){
  function formatCurrency(amount, currency = '$'){
    return `${currency}${Number(amount).toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 0})}`;
  }

  function calculateDaysLeft(endDate){
    const today = new Date();
    const target = new Date(endDate);
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  function calculatePercentage(current, target){
    if(target <= 0) return 0;
    return Math.min(100, Math.round((current / target) * 100 * 10) / 10); // One decimal
  }

  function debounce(func, delay){
    let timeoutId;
    return function(...args){
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  }

  function showToast(message, type = 'info'){
    // Simple toast implementation
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 px-4 py-2 rounded-lg text-white z-50 ${
      type === 'error' ? 'bg-red-500' : type === 'success' ? 'bg-green-500' : 'bg-blue-500'
    }`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  function formatDate(dateStr, format = 'MMM DD, YYYY'){
    const date = new Date(dateStr);
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
  }

  // Simple theme management for all pages
  function getThemePreference(){
    const profile = MarcusStorage.read('marcus_profile', { preferences: { theme: 'light' } });
    return profile.preferences.theme;
  }

  function setThemePreference(theme){
    const profile = MarcusStorage.read('marcus_profile', { preferences: { theme: 'light' } });
    profile.preferences.theme = theme;
    MarcusStorage.write('marcus_profile', profile);
  }

  function applyTheme(theme){
    if(theme === 'dark'){
      document.body.classList.add('dark-theme');
      const themeToggle = document.getElementById('themeToggle');
      if(themeToggle) themeToggle.textContent = '🌙';
    } else {
      document.body.classList.remove('dark-theme');
      const themeToggle = document.getElementById('themeToggle');
      if(themeToggle) themeToggle.textContent = '☀️';
    }
    setThemePreference(theme);
  }

  function toggleTheme(){
    const currentTheme = getThemePreference();
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(newTheme);
    showToast(`Switched to ${newTheme} theme`, 'info');
  }  function validateGoalName(name, existingGoals = []){
    const errors = [];
    if(!name || name.trim().length < 3) errors.push('Goal name must be at least 3 characters');
    if(name && name.trim().length > 30) errors.push('Goal name cannot exceed 30 characters');
    if(name && !/^[a-zA-Z0-9\s]+$/.test(name.trim())) errors.push('Goal name can only contain letters, numbers, and spaces');
    
    const trimmed = name ? name.trim().toLowerCase() : '';
    if(trimmed && existingGoals.some(g => g.name.toLowerCase() === trimmed)){
      errors.push('Goal name already exists');
    }
    return errors;
  }

  function validateTargetAmount(amount){
    const errors = [];
    const num = Number(amount);
    if(!amount || isNaN(num) || num <= 0) errors.push('Target amount must be a positive number');
    if(num > 1000000) errors.push('Target amount cannot exceed $1,000,000');
    return errors;
  }

  function validateTargetDate(dateStr){
    const errors = [];
    if(!dateStr) errors.push('Target date is required');
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0,0,0,0);
    if(date <= today) errors.push('Target date must be in the future');
    
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
    if(date > oneYearFromNow) errors.push('Target date cannot be more than 1 year from now');
    return errors;
  }

  window.MarcusUtils = {
    formatCurrency, calculateDaysLeft, calculatePercentage, debounce, showToast, formatDate,
    getThemePreference, setThemePreference, applyTheme, toggleTheme,
    validateGoalName, validateTargetAmount, validateTargetDate
  };
})();