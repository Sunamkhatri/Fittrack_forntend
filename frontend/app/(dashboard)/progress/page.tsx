"use client";

import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Scale, Trophy, Award, Target, Flame, Calendar, Activity, Utensils } from 'lucide-react';

// Types
type WeightEntry = {
  id: string;
  weight: number;
  date: string;
};

type Workout = {
  id: string;
  type: string;
  duration: number;
  calories: number;
  date: string;
};

type NutritionEntry = {
  id: string;
  mealName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  date: string;
};

export default function ProgressPage() {
  // State
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [nutritionEntries, setNutritionEntries] = useState<NutritionEntry[]>([]);
  
  // Form state
  const [newWeight, setNewWeight] = useState('');
  const [newDate, setNewDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Load data on mount
  useEffect(() => {
    const loadedWeights = JSON.parse(localStorage.getItem('fittrack_weight_log') || '[]');
    const loadedWorkouts = JSON.parse(localStorage.getItem('fittrack_workouts') || '[]');
    const loadedNutrition = JSON.parse(localStorage.getItem('fittrack_nutrition') || '[]');
    
    // Sort weights by date descending
    setWeightEntries(loadedWeights.sort((a: WeightEntry, b: WeightEntry) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setWorkouts(loadedWorkouts.sort((a: Workout, b: Workout) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setNutritionEntries(loadedNutrition.sort((a: NutritionEntry, b: NutritionEntry) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  }, []);

  // Weight form submission
  const handleWeightSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWeight || isNaN(Number(newWeight))) return;

    const entry: WeightEntry = {
      id: crypto.randomUUID(),
      weight: Number(newWeight),
      date: newDate,
    };

    const updated = [...weightEntries, entry].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setWeightEntries(updated);
    localStorage.setItem('fittrack_weight_log', JSON.stringify(updated));
    setNewWeight('');
  };

  // Computed values
  const currentWeight = weightEntries.length > 0 ? weightEntries[0].weight : null;
  const startingWeight = weightEntries.length > 0 ? weightEntries[weightEntries.length - 1].weight : null;
  const weightChange = currentWeight && startingWeight ? currentWeight - startingWeight : 0;

  const totalWorkouts = workouts.length;
  const totalCaloriesBurned = workouts.reduce((sum, w) => sum + Number(w.calories), 0);
  
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const workoutsThisWeek = workouts.filter(w => new Date(w.date) >= oneWeekAgo).length;

  const totalNutritionCalories = nutritionEntries.reduce((sum, n) => sum + Number(n.calories), 0);
  const totalProtein = nutritionEntries.reduce((sum, n) => sum + Number(n.protein), 0);
  
  const uniqueDays = new Set(nutritionEntries.map(n => n.date)).size;
  const avgCalories = uniqueDays > 0 ? Math.round(totalNutritionCalories / uniqueDays) : 0;
  const avgProtein = uniqueDays > 0 ? Math.round(totalProtein / uniqueDays) : 0;

  const maxProteinInADay = Math.max(0, ...Array.from(
    nutritionEntries.reduce((acc, entry) => {
      acc.set(entry.date, (acc.get(entry.date) || 0) + Number(entry.protein));
      return acc;
    }, new Map<string, number>()).values()
  ));

  // Badges logic
  const badges = [
    { id: 'first_workout', name: 'First Workout', description: 'Log your first workout', icon: <Target className="w-6 h-6" />, achieved: totalWorkouts >= 1 },
    { id: '10_workouts', name: '10 Workouts', description: 'Log 10 workouts', icon: <Trophy className="w-6 h-6" />, achieved: totalWorkouts >= 10 },
    { id: 'calorie_crusher', name: 'Calorie Crusher', description: 'Burn 1000+ total calories', icon: <Flame className="w-6 h-6" />, achieved: totalCaloriesBurned >= 1000 },
    { id: 'protein_king', name: 'Protein King', description: 'Log 100g+ protein in a day', icon: <Award className="w-6 h-6" />, achieved: maxProteinInADay >= 100 },
    { id: 'consistent', name: 'Consistent', description: 'Log weight 7+ times', icon: <Scale className="w-6 h-6" />, achieved: weightEntries.length >= 7 },
  ];

  return (
    <div className="min-h-screen p-6 text-white bg-[#0a0f1e] animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <header>
          <h1 className="text-3xl font-bold">Progress Dashboard</h1>
          <p className="text-slate-400 mt-2">Track your weight, workouts, and nutrition.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Weight Tracker Section */}
            <section className="bg-[#0f172a] p-6 rounded-xl border border-[#1e293b]">
              <div className="flex items-center space-x-2 mb-6">
                <Scale className="w-6 h-6 text-[#00ff87]" />
                <h2 className="text-xl font-semibold">Weight Tracker</h2>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-[#111827] p-4 rounded-lg border border-[#1e293b]">
                  <p className="text-slate-400 text-sm mb-1">Current</p>
                  <p className="text-2xl font-bold">{currentWeight ? `${currentWeight} kg` : '-'}</p>
                </div>
                <div className="bg-[#111827] p-4 rounded-lg border border-[#1e293b]">
                  <p className="text-slate-400 text-sm mb-1">Starting</p>
                  <p className="text-2xl font-bold">{startingWeight ? `${startingWeight} kg` : '-'}</p>
                </div>
                <div className="bg-[#111827] p-4 rounded-lg border border-[#1e293b]">
                  <p className="text-slate-400 text-sm mb-1">Change</p>
                  <div className="flex items-center space-x-1">
                    <p className={`text-2xl font-bold ${weightChange > 0 ? 'text-red-400' : weightChange < 0 ? 'text-[#00ff87]' : 'text-white'}`}>
                      {weightChange > 0 ? '+' : ''}{weightChange ? weightChange.toFixed(1) : '-'} kg
                    </p>
                    {weightChange > 0 && <TrendingUp className="w-4 h-4 text-red-400" />}
                    {weightChange < 0 && <TrendingDown className="w-4 h-4 text-[#00ff87]" />}
                  </div>
                </div>
              </div>

              <form onSubmit={handleWeightSubmit} className="flex gap-4 mb-8">
                <div className="flex-1">
                  <label htmlFor="weight" className="block text-sm text-slate-400 mb-1">Weight (kg)</label>
                  <input
                    id="weight"
                    type="number"
                    step="0.1"
                    required
                    autoComplete="off"
                    value={newWeight}
                    onChange={(e) => setNewWeight(e.target.value)}
                    className="w-full bg-[#111827] border border-[#1e293b] rounded-lg px-4 py-2 focus:outline-none focus:border-[#00ff87] text-white"
                  />
                </div>
                <div className="flex-1">
                  <label htmlFor="date" className="block text-sm text-slate-400 mb-1">Date</label>
                  <input
                    id="date"
                    type="date"
                    required
                    autoComplete="off"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full bg-[#111827] border border-[#1e293b] rounded-lg px-4 py-2 focus:outline-none focus:border-[#00ff87] text-white"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="bg-[#00ff87] text-[#0a0f1e] font-semibold px-6 py-2 rounded-lg hover:bg-[#00cc6a] transition-colors h-[42px]"
                  >
                    Log
                  </button>
                </div>
              </form>

              <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {weightEntries.map((entry) => (
                  <div key={entry.id} className="flex justify-between items-center bg-[#111827] p-3 rounded-lg border border-[#1e293b]">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-300">{new Date(entry.date).toLocaleDateString()}</span>
                    </div>
                    <span className="font-semibold text-[#00ff87]">{entry.weight} kg</span>
                  </div>
                ))}
                {weightEntries.length === 0 && (
                  <div className="text-center py-6 text-slate-500">No weight entries logged yet.</div>
                )}
              </div>
            </section>

            {/* Achievements Section */}
            <section className="bg-[#0f172a] p-6 rounded-xl border border-[#1e293b]">
              <div className="flex items-center space-x-2 mb-6">
                <Trophy className="w-6 h-6 text-[#00ff87]" />
                <h2 className="text-xl font-semibold">Achievements</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {badges.map((badge) => (
                  <div 
                    key={badge.id}
                    className={`flex flex-col items-center p-4 rounded-xl border transition-all ${
                      badge.achieved 
                      ? 'bg-[#111827] border-[#00ff87]/50 shadow-[0_0_15px_rgba(0,255,135,0.1)]' 
                      : 'bg-[#111827]/50 border-[#1e293b] opacity-50 grayscale'
                    }`}
                  >
                    <div className={`p-3 rounded-full mb-3 ${badge.achieved ? 'bg-[#00ff87]/20 text-[#00ff87]' : 'bg-[#1e293b] text-slate-400'}`}>
                      {badge.icon}
                    </div>
                    <h3 className="font-medium text-center text-sm">{badge.name}</h3>
                    <p className="text-xs text-slate-400 text-center mt-1">{badge.description}</p>
                  </div>
                ))}
              </div>
            </section>

          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Workout Summary Section */}
            <section className="bg-[#0f172a] p-6 rounded-xl border border-[#1e293b]">
              <div className="flex items-center space-x-2 mb-4">
                <Activity className="w-5 h-5 text-[#00ff87]" />
                <h2 className="text-lg font-semibold">Workout Summary</h2>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Total Workouts</span>
                  <span className="font-bold">{totalWorkouts}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">This Week</span>
                  <span className="font-bold text-[#00ff87]">{workoutsThisWeek}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Calories Burned</span>
                  <span className="font-bold text-orange-400">{totalCaloriesBurned}</span>
                </div>
              </div>

              <h3 className="text-sm font-medium text-slate-400 mb-3 uppercase tracking-wider">Recent Workouts</h3>
              <div className="space-y-2">
                {workouts.slice(0, 5).map(w => (
                  <div key={w.id} className="bg-[#111827] p-3 rounded-lg border border-[#1e293b] flex justify-between items-center text-sm">
                    <div>
                      <p className="font-medium">{w.type}</p>
                      <p className="text-slate-500 text-xs">{new Date(w.date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[#00ff87]">{w.duration} min</p>
                      <p className="text-orange-400 text-xs">{w.calories} cal</p>
                    </div>
                  </div>
                ))}
                {workouts.length === 0 && <p className="text-slate-500 text-sm text-center py-2">No workouts logged.</p>}
              </div>
            </section>

            {/* Nutrition Summary Section */}
            <section className="bg-[#0f172a] p-6 rounded-xl border border-[#1e293b]">
              <div className="flex items-center space-x-2 mb-4">
                <Utensils className="w-5 h-5 text-[#00ff87]" />
                <h2 className="text-lg font-semibold">Nutrition Summary</h2>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Avg Daily Calories</span>
                  <span className="font-bold">{avgCalories}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Avg Daily Protein</span>
                  <span className="font-bold text-[#00ff87]">{avgProtein}g</span>
                </div>
              </div>

              <h3 className="text-sm font-medium text-slate-400 mb-3 uppercase tracking-wider">Recent Meals</h3>
              <div className="space-y-2">
                {nutritionEntries.slice(0, 5).map(n => (
                  <div key={n.id} className="bg-[#111827] p-3 rounded-lg border border-[#1e293b] flex justify-between items-center text-sm">
                    <div>
                      <p className="font-medium truncate max-w-[120px]">{n.mealName}</p>
                      <p className="text-slate-500 text-xs">{new Date(n.date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white">{n.calories} cal</p>
                      <p className="text-[#00ff87] text-xs">{n.protein}g P</p>
                    </div>
                  </div>
                ))}
                {nutritionEntries.length === 0 && <p className="text-slate-500 text-sm text-center py-2">No meals logged.</p>}
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
