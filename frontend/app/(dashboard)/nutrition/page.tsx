"use client"

import React, { useState, useEffect } from 'react';
import { 
  Apple, 
  Beef, 
  Wheat, 
  Droplets, 
  Trash2, 
  Plus, 
  UtensilsCrossed 
} from 'lucide-react';

interface Meal {
  id: string;
  name: string;
  type: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  date: string;
}

export default function NutritionPage() {
  const [meals, setMeals] = useState<Meal[]>([]);
  
  // Form State
  const [name, setName] = useState('');
  const [type, setType] = useState('Breakfast');
  const [calories, setCalories] = useState<number | ''>('');
  const [protein, setProtein] = useState<number | ''>('');
  const [carbs, setCarbs] = useState<number | ''>('');
  const [fat, setFat] = useState<number | ''>('');
  const [date, setDate] = useState('');

  useEffect(() => {
    // Set initial date only on client side to avoid hydration mismatch
    setDate(new Date().toISOString().split('T')[0]);
  }, []);

  // Load meals on mount
  useEffect(() => {
    const stored = localStorage.getItem('fittrack_nutrition');
    if (stored) {
      try {
        setMeals(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse nutrition data");
      }
    }
  }, []);

  // Save meals when changed
  useEffect(() => {
    localStorage.setItem('fittrack_nutrition', JSON.stringify(meals));
  }, [meals]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || calories === '') return;
    
    const newMeal: Meal = {
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      name,
      type,
      calories: Number(calories),
      protein: Number(protein || 0),
      carbs: Number(carbs || 0),
      fat: Number(fat || 0),
      date: date || new Date().toISOString().split('T')[0]
    };
    
    setMeals([...meals, newMeal]);
    
    // Reset fields
    setName('');
    setType('Breakfast');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFat('');
  };

  const deleteMeal = (id: string) => {
    setMeals(meals.filter(meal => meal.id !== id));
  };

  // Filter for today
  const todayMeals = meals.filter(meal => meal.date === date);
  
  // Calculate Summaries
  const totalCalories = todayMeals.reduce((acc, meal) => acc + meal.calories, 0);
  const totalProtein = todayMeals.reduce((acc, meal) => acc + meal.protein, 0);
  const totalCarbs = todayMeals.reduce((acc, meal) => acc + meal.carbs, 0);
  const totalFat = todayMeals.reduce((acc, meal) => acc + meal.fat, 0);

  const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <UtensilsCrossed className="w-8 h-8 text-[#00ff87]" />
            Nutrition & Meals
          </h1>
          <p className="text-slate-400 mt-2">Track your daily macronutrients and meals</p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-4">
          <label htmlFor="view-date" className="font-semibold text-slate-300">Viewing Date:</label>
          <input 
            id="view-date"
            type="date" 
            value={date}
            onChange={(e) => setDate(e.target.value)}
            autoComplete="off"
            className="bg-[#0f172a] border border-[#1e293b] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#00ff87]"
          />
        </div>

        {/* Daily Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-6 flex flex-col items-center justify-center space-y-2">
            <div className="flex items-center gap-2 text-slate-400">
              <Apple className="w-5 h-5 text-[#00ff87]" />
              <span className="font-medium">Total Calories</span>
            </div>
            <div className="text-3xl font-bold">{totalCalories} <span className="text-sm text-slate-500 font-normal">kcal</span></div>
          </div>
          
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-6 flex flex-col items-center justify-center space-y-2">
            <div className="flex items-center gap-2 text-slate-400">
              <Beef className="w-5 h-5 text-red-400" />
              <span className="font-medium">Protein</span>
            </div>
            <div className="text-3xl font-bold">{totalProtein} <span className="text-sm text-slate-500 font-normal">g</span></div>
          </div>
          
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-6 flex flex-col items-center justify-center space-y-2">
            <div className="flex items-center gap-2 text-slate-400">
              <Wheat className="w-5 h-5 text-yellow-400" />
              <span className="font-medium">Carbs</span>
              <span className="mx-2">/</span>
              <Droplets className="w-5 h-5 text-blue-400" />
              <span className="font-medium">Fat</span>
            </div>
            <div className="text-3xl font-bold">
              {totalCarbs}<span className="text-sm text-slate-500 font-normal mx-1">g</span> / {totalFat}<span className="text-sm text-slate-500 font-normal ml-1">g</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Log a Meal Form */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#00ff87]" />
                Log a Meal
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label htmlFor="meal-name" className="text-sm text-slate-400">Meal Name</label>
                  <input
                    id="meal-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="off"
                    placeholder="e.g. Chicken Breast"
                    className="w-full bg-[#111827] border border-[#1e293b] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#00ff87]"
                  />
                </div>
                
                <div className="space-y-1">
                  <label htmlFor="meal-type" className="text-sm text-slate-400">Meal Type</label>
                  <select
                    id="meal-type"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    autoComplete="off"
                    className="w-full bg-[#111827] border border-[#1e293b] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#00ff87]"
                  >
                    {mealTypes.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label htmlFor="meal-calories" className="text-sm text-slate-400">Calories</label>
                  <input
                    id="meal-calories"
                    type="number"
                    min="0"
                    required
                    value={calories}
                    onChange={(e) => setCalories(e.target.value ? Number(e.target.value) : '')}
                    autoComplete="off"
                    className="w-full bg-[#111827] border border-[#1e293b] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#00ff87]"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label htmlFor="meal-protein" className="text-sm text-slate-400">Protein (g)</label>
                    <input
                      id="meal-protein"
                      type="number"
                      min="0"
                      value={protein}
                      onChange={(e) => setProtein(e.target.value ? Number(e.target.value) : '')}
                      autoComplete="off"
                      className="w-full bg-[#111827] border border-[#1e293b] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00ff87]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="meal-carbs" className="text-sm text-slate-400">Carbs (g)</label>
                    <input
                      id="meal-carbs"
                      type="number"
                      min="0"
                      value={carbs}
                      onChange={(e) => setCarbs(e.target.value ? Number(e.target.value) : '')}
                      autoComplete="off"
                      className="w-full bg-[#111827] border border-[#1e293b] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00ff87]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="meal-fat" className="text-sm text-slate-400">Fat (g)</label>
                    <input
                      id="meal-fat"
                      type="number"
                      min="0"
                      value={fat}
                      onChange={(e) => setFat(e.target.value ? Number(e.target.value) : '')}
                      autoComplete="off"
                      className="w-full bg-[#111827] border border-[#1e293b] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00ff87]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="meal-date" className="text-sm text-slate-400">Date</label>
                  <input
                    id="meal-date"
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    autoComplete="off"
                    className="w-full bg-[#111827] border border-[#1e293b] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#00ff87]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#00ff87] text-[#0a0f1e] font-bold py-3 px-4 rounded-lg hover:bg-[#00e67a] transition-colors mt-4 flex justify-center items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add Meal
                </button>
              </form>
            </div>
          </div>

          {/* Today's Meals */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Apple className="w-5 h-5 text-[#00ff87]" />
              Today's Meals
            </h2>
            
            {todayMeals.length === 0 ? (
              <div className="bg-[#0f172a] border border-[#1e293b] border-dashed rounded-xl p-12 text-center text-slate-400 flex flex-col items-center">
                <UtensilsCrossed className="w-12 h-12 mb-4 opacity-50" />
                <p>No meals logged for this date yet.</p>
                <p className="text-sm mt-1">Use the form to add a meal!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {mealTypes.map(mType => {
                  const typeMeals = todayMeals.filter(m => m.type === mType);
                  if (typeMeals.length === 0) return null;
                  
                  const typeCals = typeMeals.reduce((acc, m) => acc + m.calories, 0);

                  return (
                    <div key={mType} className="space-y-3">
                      <div className="flex justify-between items-center border-b border-[#1e293b] pb-2">
                        <h3 className="text-lg font-semibold text-slate-200">{mType}</h3>
                        <span className="text-sm text-slate-400">{typeCals} kcal</span>
                      </div>
                      <div className="grid gap-3">
                        {typeMeals.map(meal => (
                          <div key={meal.id} className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-4 flex justify-between items-center group hover:border-[#00ff87]/50 transition-colors">
                            <div>
                              <p className="font-semibold">{meal.name}</p>
                              <div className="flex items-center gap-3 mt-2 text-xs">
                                <span className="bg-[#111827] px-2 py-1 rounded border border-[#1e293b] text-slate-300">
                                  {meal.calories} kcal
                                </span>
                                <span className="bg-[#111827] px-2 py-1 rounded border border-[#1e293b] text-red-400">
                                  {meal.protein}g P
                                </span>
                                <span className="bg-[#111827] px-2 py-1 rounded border border-[#1e293b] text-yellow-400">
                                  {meal.carbs}g C
                                </span>
                                <span className="bg-[#111827] px-2 py-1 rounded border border-[#1e293b] text-blue-400">
                                  {meal.fat}g F
                                </span>
                              </div>
                            </div>
                            <button 
                              onClick={() => deleteMeal(meal.id)}
                              className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                              aria-label={`Delete ${meal.name}`}
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
