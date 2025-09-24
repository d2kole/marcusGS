// Goal management for Marcus Savings
(function(){
  const MAX_GOALS = 4;

  function createGoal(goalData){
    const goals = MarcusStorage.getGoals();
    
    // Validate goal limit
    const activeGoals = goals.filter(g => !g.isCompleted);
    if(activeGoals.length >= MAX_GOALS){
      throw new Error(`Maximum of ${MAX_GOALS} active goals allowed`);
    }

    // Create goal object
    const goal = {
      id: Date.now().toString(),
      name: goalData.name.trim(),
      category: goalData.category,
      targetAmount: Number(goalData.targetAmount),
      currentAmount: 0,
      endDate: goalData.endDate,
      createdAt: new Date().toISOString(),
      progressHistory: [],
      isCompleted: false,
      completedAt: null
    };

    return MarcusStorage.upsertGoal(goal);
  }

  function addProgressToGoal(goalId, amount){
    const goals = MarcusStorage.getGoals();
    const goal = MarcusStorage.findGoal(goals, goalId);
    if(!goal) throw new Error('Goal not found');
    if(goal.isCompleted) throw new Error('Cannot add progress to completed goal');

    const progressAmount = Number(amount);
    if(progressAmount <= 0) throw new Error('Progress amount must be positive');

    // Add to progress history
    const progressEntry = MarcusStorage.addProgress(goalId, progressAmount);
    
    // Update goal
    goal.currentAmount += progressAmount;
    goal.progressHistory.push(progressEntry);
    
    // Check completion
    if(goal.currentAmount >= goal.targetAmount){
      goal.isCompleted = true;
      goal.completedAt = new Date().toISOString();
    }

    MarcusStorage.upsertGoal(goal);
    return goal;
  }  function deleteGoal(goalId){
    MarcusStorage.deleteGoal(goalId);
  }

  function getGoalStats(){
    const goals = MarcusStorage.getGoals();
    const active = goals.filter(g => !g.isCompleted);
    const completed = goals.filter(g => g.isCompleted);
    
    const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
    const totalTarget = active.reduce((sum, g) => sum + g.targetAmount, 0);
    const overallProgress = totalTarget > 0 ? MarcusUtils.calculatePercentage(totalSaved, totalTarget) : 0;

    return {
      active: active.length,
      completed: completed.length,
      totalSaved,
      totalTarget,
      overallProgress,
      goals: { active, completed, all: goals }
    };
  }

  function validateGoalForm(formData){
    const goals = MarcusStorage.getGoals();
    const errors = {};

    // Validate name
    const nameErrors = MarcusUtils.validateGoalName(formData.name, goals);
    if(nameErrors.length) errors.name = nameErrors[0];

    // Validate amount
    const amountErrors = MarcusUtils.validateTargetAmount(formData.targetAmount);
    if(amountErrors.length) errors.targetAmount = amountErrors[0];

    // Validate date
    const dateErrors = MarcusUtils.validateTargetDate(formData.endDate);
    if(dateErrors.length) errors.endDate = dateErrors[0];

    // Check goal limit
    const activeGoals = goals.filter(g => !g.isCompleted);
    if(activeGoals.length >= MAX_GOALS){
      errors.limit = `Maximum of ${MAX_GOALS} active goals allowed. Complete or delete existing goals first.`;
    }

    return { isValid: Object.keys(errors).length === 0, errors };
  }

  window.MarcusGoals = {
    MAX_GOALS,
    createGoal,
    addProgressToGoal,
    deleteGoal,
    getGoalStats,
    validateGoalForm
  };
})();