// Main app controller for Marcus Savings
(function(){
  let currentPage = '';

  function detectPage(){
    const path = window.location.pathname;
    if(path.includes('goals.html')) return 'goals';
    if(path.includes('friends.html')) return 'friends';
    if(path.includes('profile.html')) return 'profile';
    return 'dashboard';
  }

  function initGoalsPage(){
    const formSection = document.getElementById('goalFormSection');
    const toggleBtn = document.getElementById('toggleGoalForm');
    const cancelBtn = document.getElementById('cancelCreate');
    const goalForm = document.getElementById('goalForm');
    
    // Form validation elements
    const nameInput = document.getElementById('goalName');
    const amountInput = document.getElementById('targetAmount');
    const dateInput = document.getElementById('targetDate');
    const nameError = document.getElementById('goalNameError');
    const amountError = document.getElementById('targetAmountError');
    const dateError = document.getElementById('targetDateError');
    const limitError = document.getElementById('limitError');

    // Set minimum date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    dateInput.min = tomorrow.toISOString().split('T')[0];

    // Toggle form visibility
    function showForm(){
      formSection.classList.remove('hidden');
      toggleBtn.textContent = 'Cancel';
      nameInput.focus();
    }

    function hideForm(){
      formSection.classList.add('hidden');
      toggleBtn.textContent = '+ Create New Goal';
      goalForm.reset();
      clearErrors();
    }    function clearErrors(){
      nameError.textContent = '';
      amountError.textContent = '';
      dateError.textContent = '';
      limitError.textContent = '';
      [nameInput, amountInput, dateInput].forEach(input => {
        input.classList.remove('border-red-500');
      });
    }

    function showFieldError(field, message){
      const errorEl = document.getElementById(field + 'Error');
      const inputEl = document.getElementById(field);
      if(errorEl && inputEl){
        errorEl.textContent = message;
        inputEl.classList.add('border-red-500');
      }
    }

    // Real-time validation
    const debouncedValidation = MarcusUtils.debounce(() => {
      const formData = {
        name: nameInput.value,
        targetAmount: amountInput.value,
        endDate: dateInput.value
      };
      
      const { errors } = MarcusGoals.validateGoalForm(formData);
      clearErrors();
      
      Object.keys(errors).forEach(field => {
        if(field === 'limit') limitError.textContent = errors[field];
        else showFieldError(field, errors[field]);
      });
    }, 300);

    // Event listeners
    toggleBtn.addEventListener('click', () => {
      formSection.classList.contains('hidden') ? showForm() : hideForm();
    });
    
    cancelBtn.addEventListener('click', hideForm);
    
    [nameInput, amountInput, dateInput].forEach(input => {
      input.addEventListener('input', debouncedValidation);
    });    // Form submission
    goalForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const formData = {
        name: nameInput.value.trim(),
        category: document.getElementById('goalCategory').value,
        targetAmount: amountInput.value,
        endDate: dateInput.value
      };

      const { isValid, errors } = MarcusGoals.validateGoalForm(formData);
      
      if(!isValid){
        clearErrors();
        Object.keys(errors).forEach(field => {
          if(field === 'limit') limitError.textContent = errors[field];
          else showFieldError(field, errors[field]);
        });
        return;
      }

      try {
        MarcusGoals.createGoal(formData);
        MarcusUtils.showToast('Goal created successfully!', 'success');
        hideForm();
        renderGoalsPage();
      } catch(error) {
        MarcusUtils.showToast(error.message, 'error');
      }
    });

    renderGoalsPage();
  }

  function renderGoalsPage(){
    const stats = MarcusGoals.getGoalStats();
    
    // Update stats
    document.getElementById('activeCount').textContent = stats.active;
    document.getElementById('completedCount').textContent = stats.completed;
    
    // Render active goals
    const activeContainer = document.getElementById('activeGoals');
    activeContainer.innerHTML = stats.goals.active.map(renderGoalCard).join('');
    
    // Render completed goals
    const completedContainer = document.getElementById('completedGoals');
    completedContainer.innerHTML = stats.goals.completed.map(renderGoalCard).join('');
  }  function renderGoalCard(goal){
    const percentage = MarcusUtils.calculatePercentage(goal.currentAmount, goal.targetAmount);
    const daysLeft = MarcusUtils.calculateDaysLeft(goal.endDate);
    const isOverdue = daysLeft < 0;
    
    // Add dashboard-specific class if we're on dashboard
    const cardClass = currentPage === 'dashboard' ? 'dashboard-goal-card' : '';
    
    const progressBarClass = percentage >= 100 ? 'progress-complete' : percentage >= 75 ? 'progress-bar-glow' : '';
    const goalCompleteClass = goal.isCompleted ? 'goal-complete-animation' : '';
    
    return `
      <div class="bg-white rounded-xl p-4 shadow-sm card-enter hover-lift ${cardClass} ${goalCompleteClass}" data-goal-id="${goal.id}">
        <div class="flex justify-between items-start mb-3">
          <div>
            <h3 class="font-bold text-lg">${goal.name}</h3>
            <p class="text-sm text-gray-600">${goal.category}</p>
          </div>
          <div class="flex gap-2">
            <button onclick="shareGoal('${goal.id}')" class="share-btn hover-scale" title="Share goal">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.50-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
              </svg>
            </button>
            <button onclick="deleteGoalConfirm('${goal.id}')" class="text-red-500 hover:text-red-700 p-1 hover-scale transition-all duration-200">🗑️</button>
          </div>
        </div>
        
        <div class="mb-3">
          <div class="flex justify-between text-2xl font-bold mb-1">
            <span class="${goal.isCompleted ? 'text-green-600' : ''}">${MarcusUtils.formatCurrency(goal.currentAmount)}</span>
            <span class="text-gray-400 text-base">of ${MarcusUtils.formatCurrency(goal.targetAmount)}</span>
          </div>
          <div class="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div class="h-3 bg-blue-600 rounded-full progress-fill ${progressBarClass}" style="width: ${percentage}%"></div>
          </div>
          <p class="text-right text-sm text-gray-600 mt-1 font-medium">${percentage}%</p>
        </div>
        
        <div class="flex justify-between items-center">
          <span class="text-sm ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-600'}">
            📅 ${isOverdue ? 'Overdue' : `${daysLeft} days left`}
          </span>
          ${!goal.isCompleted 
            ? `<button onclick="showAddProgress('${goal.id}')" class="bg-blue-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-800 transition-all duration-200 hover:-translate-y-0.5">Add Progress</button>` 
            : '<span class="text-green-600 font-medium flex items-center gap-1"><span class="animate-pulse">✅</span> Completed</span>'
          }
        </div>
      </div>
    `;
  }

  // Global functions for onclick handlers
  window.deleteGoalConfirm = function(goalId){
    if(confirm('Are you sure you want to delete this goal?')){
      MarcusGoals.deleteGoal(goalId);
      MarcusUtils.showToast('Goal deleted', 'info');
      if(currentPage === 'goals') renderGoalsPage();
    }
  };

  window.showAddProgress = function(goalId){
    const amount = prompt('Enter progress amount ($):');
    if(amount && !isNaN(amount) && Number(amount) > 0){
      try {
        const oldPercentage = MarcusUtils.calculatePercentage(MarcusGoals.getGoalStats().goals.all.find(g => g.id === goalId)?.currentAmount || 0, MarcusGoals.getGoalStats().goals.all.find(g => g.id === goalId)?.targetAmount || 1);
        const updatedGoal = MarcusGoals.addProgressToGoal(goalId, amount);
        const newPercentage = MarcusUtils.calculatePercentage(updatedGoal.currentAmount, updatedGoal.targetAmount);
        
        MarcusUtils.showToast(`Added ${MarcusUtils.formatCurrency(amount)} to ${updatedGoal.name}!`, 'success');
        
        // Check for celebrations
        if(updatedGoal.isCompleted){
          setTimeout(() => {
            MarcusCelebration.showGoalCompleteCelebration(updatedGoal.name, updatedGoal.currentAmount);
          }, 500);
        } else {
          // Check for milestone celebrations
          const milestoneReached = MarcusCelebration.triggerProgressCelebration(newPercentage);
          if(!milestoneReached && newPercentage > oldPercentage){
            // Add confetti burst for any progress
            setTimeout(() => {
              const goalCard = document.querySelector(`[onclick*="${goalId}"]`)?.closest('.card-enter');
              if(goalCard){
                const rect = goalCard.getBoundingClientRect();
                MarcusCelebration.createConfettiBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 10);
              }
            }, 300);
          }
        }
        
        if(currentPage === 'goals') renderGoalsPage();
        if(currentPage === 'dashboard') renderDashboard();
      } catch(error) {
        MarcusUtils.showToast(error.message, 'error');
      }
    }
  };

  window.shareGoal = function(goalId){
    const goals = MarcusStorage.getGoals();
    const goal = MarcusStorage.findGoal(goals, goalId);
    if(!goal) return;

    const percentage = MarcusUtils.calculatePercentage(goal.currentAmount, goal.targetAmount);
    const daysLeft = MarcusUtils.calculateDaysLeft(goal.endDate);
    
    const shareText = `🎯 Check out my savings progress!\n\n` +
      `Goal: ${goal.name}\n` +
      `Progress: ${MarcusUtils.formatCurrency(goal.currentAmount)} of ${MarcusUtils.formatCurrency(goal.targetAmount)} (${percentage}%)\n` +
      `${daysLeft > 0 ? `${daysLeft} days to go!` : 'Goal deadline reached!'}\n\n` +
      `Join me on Marcus Savings Tracker! 💪`;

    if(navigator.share) {
      navigator.share({
        title: 'My Savings Goal Progress',
        text: shareText,
        url: window.location.origin
      }).catch(() => copyToClipboard(shareText));
    } else {
      copyToClipboard(shareText);
    }
  };

  function copyToClipboard(text){
    if(navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        MarcusUtils.showToast('Goal shared to clipboard!', 'success');
      });
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      MarcusUtils.showToast('Goal shared to clipboard!', 'success');
    }
  }  function initDashboard(){
    renderDashboard();
  }

  function renderDashboard(){
    const stats = MarcusGoals.getGoalStats();
    
    // Update summary stats
    document.getElementById('totalSaved').textContent = stats.totalSaved;
    document.getElementById('totalTarget').textContent = stats.totalTarget;
    document.getElementById('overallPercent').textContent = stats.overallProgress;
    document.getElementById('overallBar').style.width = stats.overallProgress + '%';
    
    // Render goal cards
    const container = document.getElementById('goalsContainer');
    const emptyState = document.getElementById('emptyState');
    
    if(stats.goals.active.length === 0){
      container.innerHTML = '';
      emptyState.classList.remove('hidden');
    } else {
      emptyState.classList.add('hidden');
      container.innerHTML = stats.goals.active.map(renderGoalCard).join('');
    }
  }

  function initFriendsPage(){
    // Initialize demo data
    MarcusFriends.initializeDemoData();
    
    // Set up event listeners
    const inviteBtn = document.getElementById('inviteBtn');
    const copyShareBtn = document.getElementById('copyShare');
    const shareInput = document.getElementById('shareInput');
    
    // Generate and display share link
    const shareLink = MarcusFriends.generateShareLink();
    shareInput.value = shareLink;
    
    inviteBtn.addEventListener('click', () => {
      MarcusFriends.shareFriendsInvite();
    });
    
    copyShareBtn.addEventListener('click', () => {
      MarcusFriends.copyToClipboard(shareLink);
    });
    
    renderFriendsPage();
  }

  function renderFriendsPage(){
    const stats = MarcusFriends.getFriendsStats();
    
    // Update stats
    document.getElementById('friendsCount').textContent = stats.totalFriends;
    document.getElementById('friendsActive').textContent = stats.totalActiveGoals;
    document.getElementById('friendsCompleted').textContent = stats.totalCompletedGoals;
    
    // Render friends list
    const friendsList = document.getElementById('friendsList');
    if(stats.friends.length === 0){
      friendsList.innerHTML = `
        <div class="text-center py-12">
          <div class="text-6xl mb-2">👥</div>
          <p class="font-medium text-gray-800 mb-1">No friends yet</p>
          <p class="text-gray-600 text-sm">Invite friends to start sharing your savings journey!</p>
        </div>
      `;
    } else {
      friendsList.innerHTML = stats.friends.map(MarcusFriends.renderFriendCard).join('');
    }
  }

  function initProfilePage(){
    // Initialize profile
    MarcusProfile.initializeProfile();
    
    // Set up event listeners
    const settingsForm = document.getElementById('settingsForm');
    const themeToggle = document.getElementById('themeToggle');
    const clearDataBtn = document.getElementById('clearData');
    const exportDataBtn = document.getElementById('exportData');
    
    settingsForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(settingsForm);
      const settings = {
        theme: document.getElementById('themeSelect').value,
        currency: document.getElementById('currencySelect').value,
        dateFormat: document.getElementById('dateFormatSelect').value
      };
      
      MarcusProfile.updateUserSettings(settings);
      MarcusUtils.showToast('Settings saved successfully!', 'success');
    });
    
    themeToggle.addEventListener('click', () => {
      MarcusUtils.toggleTheme();
    });
    
    clearDataBtn.addEventListener('click', () => {
      MarcusProfile.clearAllUserData();
    });
    
    exportDataBtn.addEventListener('click', () => {
      MarcusProfile.exportUserData();
    });
    
    renderProfilePage();
  }

  function renderProfilePage(){
    const stats = MarcusProfile.getProfileStats();
    
    // Update profile stats
    document.getElementById('profileTotalSaved').textContent = MarcusUtils.formatCurrency(stats.totalSaved);
    document.getElementById('profileAvgProgress').textContent = stats.avgProgress + '%';
    document.getElementById('memberSince').textContent = MarcusUtils.formatDate(stats.profile.joinDate);
    
    // Render achievements
    const achievementsGrid = document.getElementById('achievementsGrid');
    achievementsGrid.innerHTML = MarcusProfile.renderAchievementsGrid();
    
    // Set current settings values
    const profile = stats.profile;
    document.getElementById('themeSelect').value = profile.preferences.theme;
    document.getElementById('currencySelect').value = profile.preferences.currency;
    document.getElementById('dateFormatSelect').value = profile.preferences.dateFormat;
  }

  function initThemeSystem(){
    // Initialize theme from saved preferences
    const currentTheme = MarcusUtils.getThemePreference();
    MarcusUtils.applyTheme(currentTheme);
    
    // Add theme toggle event listener to all pages
    const themeToggle = document.getElementById('themeToggle');
    if(themeToggle){
      themeToggle.addEventListener('click', () => {
        MarcusUtils.toggleTheme();
      });
    }
  }

  function initApp(){
    currentPage = detectPage();
    
    // Initialize theme system first
    initThemeSystem();
    
    if(currentPage === 'dashboard'){
      initDashboard();
    } else if(currentPage === 'goals'){
      initGoalsPage();
    } else if(currentPage === 'friends'){
      initFriendsPage();
    } else if(currentPage === 'profile'){
      initProfilePage();
    }
    
    // Initialize celebrations after page content loads
    setTimeout(() => {
      MarcusCelebration.initCelebrations();
    }, 100);
  }

  // Initialize app
  window.MarcusApp = { init: initApp, renderGoalsPage, renderDashboard };
  document.addEventListener('DOMContentLoaded', initApp);
})();