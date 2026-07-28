"use client";

import React, { useState, useEffect } from 'react';
import { Dumbbell, Flame, Clock, Trash2, Plus, Calendar, Type } from 'lucide-react';

interface Workout {
  id: string;
  exerciseName: string;
  category: string;
  duration: number;
  calories: number;
  sets?: number;
  reps?: number;
  weight?: number;
  date: string;
  notes?: string;
}

export default function WorkoutsPage() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isClient, setIsClient] = useState(false);

  // Form State
  const [exerciseName, setExerciseName] = useState('');
  const [category, setCategory] = useState('Strength');
  const [duration, setDuration] = useState('');
  const [calories, setCalories] = useState('');
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    setIsClient(true);
    const stored = localStorage.getItem('fittrack_workouts');
    if (stored) {
      try {
        setWorkouts(JSON.parse(stored));
      } catch (e) {
        console.error('Error parsing workouts', e);
      }
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem('fittrack_workouts', JSON.stringify(workouts));
    }
  }, [workouts, isClient]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newWorkout: Workout = {
      id: crypto.randomUUID(),
      exerciseName,
      category,
      duration: Number(duration),
      calories: Number(calories),
      date,
      notes
    };
    if (category === 'Strength') {
      newWorkout.sets = Number(sets);
      newWorkout.reps = Number(reps);
      newWorkout.weight = Number(weight);
    }
    setWorkouts([newWorkout, ...workouts]);
    
    // Reset form partially
    setExerciseName('');
    setDuration('');
    setCalories('');
    setSets('');
    setReps('');
    setWeight('');
    setNotes('');
  };

  const handleDelete = (id: string) => {
    setWorkouts(workouts.filter(w => w.id !== id));
  };

  // Stats calculation
  const getThisWeekStats = () => {
    const today = new Date();
    // basic "last 7 days" approach
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);

    let totalWorkouts = 0;
    let totalCalories = 0;
    let totalDuration = 0;

    workouts.forEach(w => {
      const wDate = new Date(w.date);
      if (wDate >= sevenDaysAgo && wDate <= today) {
        totalWorkouts++;
        totalCalories += w.calories || 0;
        totalDuration += w.duration || 0;
      }
    });
    return { totalWorkouts, totalCalories, totalDuration };
  };

  const stats = getThisWeekStats();

  if (!isClient) {
    return <div className="min-h-screen bg-[#0a0f1e]"></div>;
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            <Dumbbell className="h-8 w-8 text-[#00ff87]" />
            Workouts
          </h1>
          <p className="text-slate-400 mt-2">Track your training and see your progress over time.</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-6 flex flex-col justify-center items-start">
            <div className="flex items-center gap-2 text-slate-400 mb-2">
              <Dumbbell className="h-5 w-5 text-[#00ff87]" />
              <h3 className="font-semibold">Workouts Last 7 Days</h3>
            </div>
            <p className="text-3xl font-bold">{stats.totalWorkouts}</p>
          </div>
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-6 flex flex-col justify-center items-start">
            <div className="flex items-center gap-2 text-slate-400 mb-2">
              <Flame className="h-5 w-5 text-[#00ff87]" />
              <h3 className="font-semibold">Calories Burned</h3>
            </div>
            <p className="text-3xl font-bold">{stats.totalCalories} kcal</p>
          </div>
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-6 flex flex-col justify-center items-start">
            <div className="flex items-center gap-2 text-slate-400 mb-2">
              <Clock className="h-5 w-5 text-[#00ff87]" />
              <h3 className="font-semibold">Time Active</h3>
            </div>
            <p className="text-3xl font-bold">{stats.totalDuration} min</p>
          </div>
        </div>

        {/* Log Workout Form */}
        <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-6 shadow-xl">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
            <Plus className="h-6 w-6 text-[#00ff87]" />
            Log a Workout
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="space-y-2">
                <label htmlFor="exerciseName" className="block text-sm font-medium text-slate-400">Exercise Name</label>
                <input
                  id="exerciseName"
                  type="text"
                  autoComplete="off"
                  required
                  value={exerciseName}
                  onChange={(e) => setExerciseName(e.target.value)}
                  className="w-full bg-[#111827] border border-[#1e293b] rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#00ff87] focus:border-transparent transition-colors"
                  placeholder="e.g. Bench Press"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="category" className="block text-sm font-medium text-slate-400">Category</label>
                <select
                  id="category"
                  autoComplete="off"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#111827] border border-[#1e293b] rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#00ff87] focus:border-transparent transition-colors"
                >
                  <option value="Strength">Strength</option>
                  <option value="Cardio">Cardio</option>
                  <option value="Flexibility">Flexibility</option>
                  <option value="HIIT">HIIT</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="duration" className="block text-sm font-medium text-slate-400">Duration (minutes)</label>
                <input
                  id="duration"
                  type="number"
                  min="1"
                  autoComplete="off"
                  required
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full bg-[#111827] border border-[#1e293b] rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#00ff87] focus:border-transparent transition-colors"
                  placeholder="30"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="calories" className="block text-sm font-medium text-slate-400">Calories Burned</label>
                <input
                  id="calories"
                  type="number"
                  min="0"
                  autoComplete="off"
                  required
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  className="w-full bg-[#111827] border border-[#1e293b] rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#00ff87] focus:border-transparent transition-colors"
                  placeholder="300"
                />
              </div>

              {category === 'Strength' && (
                <>
                  <div className="space-y-2">
                    <label htmlFor="sets" className="block text-sm font-medium text-slate-400">Sets</label>
                    <input
                      id="sets"
                      type="number"
                      min="1"
                      autoComplete="off"
                      required
                      value={sets}
                      onChange={(e) => setSets(e.target.value)}
                      className="w-full bg-[#111827] border border-[#1e293b] rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#00ff87] focus:border-transparent transition-colors"
                      placeholder="3"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="reps" className="block text-sm font-medium text-slate-400">Reps</label>
                    <input
                      id="reps"
                      type="number"
                      min="1"
                      autoComplete="off"
                      required
                      value={reps}
                      onChange={(e) => setReps(e.target.value)}
                      className="w-full bg-[#111827] border border-[#1e293b] rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#00ff87] focus:border-transparent transition-colors"
                      placeholder="10"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="weight" className="block text-sm font-medium text-slate-400">Weight (kg)</label>
                    <input
                      id="weight"
                      type="number"
                      min="0"
                      autoComplete="off"
                      required
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="w-full bg-[#111827] border border-[#1e293b] rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#00ff87] focus:border-transparent transition-colors"
                      placeholder="50"
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <label htmlFor="date" className="block text-sm font-medium text-slate-400">Date</label>
                <input
                  id="date"
                  type="date"
                  autoComplete="off"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-[#111827] border border-[#1e293b] rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#00ff87] focus:border-transparent transition-colors [color-scheme:dark]"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label htmlFor="notes" className="block text-sm font-medium text-slate-400">Notes (Optional)</label>
                <textarea
                  id="notes"
                  rows={2}
                  autoComplete="off"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-[#111827] border border-[#1e293b] rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#00ff87] focus:border-transparent transition-colors resize-none"
                  placeholder="How did it feel?"
                />
              </div>
            </div>
            
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="bg-[#00ff87] hover:bg-[#00cc6a] text-black font-semibold py-2 px-6 rounded-lg transition-colors flex items-center gap-2"
              >
                <Plus className="h-5 w-5" />
                Log Workout
              </button>
            </div>
          </form>
        </div>

        {/* Workout History */}
        <div>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-white">
            <Clock className="h-6 w-6 text-[#00ff87]" />
            Workout History
          </h2>
          
          {workouts.length === 0 ? (
            <div className="bg-[#0f172a] border border-[#1e293b] border-dashed rounded-xl p-12 text-center flex flex-col items-center justify-center">
              <Dumbbell className="h-12 w-12 text-slate-600 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No workouts logged yet</h3>
              <p className="text-slate-400">Your logged workouts will appear here. Start training!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {workouts.map(workout => (
                <div key={workout.id} className="bg-[#111827] border border-[#1e293b] rounded-xl p-5 hover:border-[#334155] transition-colors relative group flex flex-col h-full shadow-lg">
                  <button 
                    onClick={() => handleDelete(workout.id)}
                    className="absolute top-4 right-4 text-slate-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Delete workout"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                  
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-bold text-white truncate pr-8">{workout.exerciseName}</h3>
                  </div>
                  
                  <div className="mb-4">
                    <span className="inline-block bg-[#0f172a] border border-[#1e293b] text-[#00ff87] text-xs font-semibold px-2 py-1 rounded">
                      {workout.category}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm text-slate-300 flex-grow">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-slate-500" />
                      <span>{workout.duration} min</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Flame className="h-4 w-4 text-slate-500" />
                      <span>{workout.calories} kcal</span>
                    </div>
                    {workout.category === 'Strength' && workout.sets && workout.reps && (
                      <div className="flex items-center gap-2">
                        <Dumbbell className="h-4 w-4 text-slate-500" />
                        <span>{workout.sets} sets × {workout.reps} reps @ {workout.weight || 0} kg</span>
                      </div>
                    )}
                    {workout.notes && (
                      <div className="flex items-start gap-2 pt-2 border-t border-[#1e293b] mt-2 text-slate-400 text-xs">
                        <Type className="h-4 w-4 text-slate-500 flex-shrink-0" />
                        <span className="line-clamp-2">{workout.notes}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 pt-3 border-t border-[#1e293b] text-xs text-slate-500 flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(workout.date).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
