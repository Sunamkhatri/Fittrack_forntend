"use client";

import React, { useState, useEffect } from 'react';
import { Settings, Target, Bell, Database, Download, Trash2, Info } from 'lucide-react';

type AppSettings = {
  calorieGoal: number;
  proteinGoal: number;
  workoutGoal: number;
  targetWeight: number;
  workoutReminders: boolean;
  mealReminders: boolean;
  weeklyReport: boolean;
  achievements: boolean;
};

const defaultSettings: AppSettings = {
  calorieGoal: 2000,
  proteinGoal: 150,
  workoutGoal: 5,
  targetWeight: 75,
  workoutReminders: true,
  mealReminders: true,
  weeklyReport: true,
  achievements: true,
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isClient, setIsClient] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    setIsClient(true);
    const stored = localStorage.getItem('fittrack_settings');
    if (stored) {
      try {
        setSettings(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse settings', e);
      }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('fittrack_settings', JSON.stringify(settings));
    setSaveMessage('Settings saved successfully!');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const handleExport = () => {
    const data = {
      settings: JSON.parse(localStorage.getItem('fittrack_settings') || 'null'),
      workouts: JSON.parse(localStorage.getItem('fittrack_workouts') || 'null'),
      nutrition: JSON.parse(localStorage.getItem('fittrack_nutrition') || 'null'),
      progress: JSON.parse(localStorage.getItem('fittrack_progress') || 'null'),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fittrack_data_export.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearData = (key: string, name: string) => {
    if (window.confirm(`Are you sure you want to clear all ${name} data? This action cannot be undone.`)) {
      localStorage.removeItem(key);
      alert(`${name} data cleared successfully.`);
    }
  };

  if (!isClient) return null;

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center space-x-3 mb-8">
          <Settings className="w-8 h-8 text-[#00ff87]" />
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>

        {/* Goals Section */}
        <section className="bg-[#0f172a] rounded-xl border border-[#1e293b] p-6 shadow-lg">
          <div className="flex items-center space-x-2 mb-6 border-b border-[#1e293b] pb-4">
            <Target className="w-6 h-6 text-[#00ff87]" />
            <h2 className="text-xl font-semibold">Fitness Goals</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <label htmlFor="calorieGoal" className="block text-sm font-medium text-slate-400">
                Daily Calorie Goal (kcal)
              </label>
              <input
                id="calorieGoal"
                type="number"
                autoComplete="off"
                value={settings.calorieGoal}
                onChange={(e) => setSettings({ ...settings, calorieGoal: Number(e.target.value) })}
                className="w-full bg-[#111827] border border-[#1e293b] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#00ff87] transition-colors"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="proteinGoal" className="block text-sm font-medium text-slate-400">
                Daily Protein Goal (g)
              </label>
              <input
                id="proteinGoal"
                type="number"
                autoComplete="off"
                value={settings.proteinGoal}
                onChange={(e) => setSettings({ ...settings, proteinGoal: Number(e.target.value) })}
                className="w-full bg-[#111827] border border-[#1e293b] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#00ff87] transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="workoutGoal" className="block text-sm font-medium text-slate-400">
                Weekly Workout Goal (sessions)
              </label>
              <input
                id="workoutGoal"
                type="number"
                autoComplete="off"
                value={settings.workoutGoal}
                onChange={(e) => setSettings({ ...settings, workoutGoal: Number(e.target.value) })}
                className="w-full bg-[#111827] border border-[#1e293b] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#00ff87] transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="targetWeight" className="block text-sm font-medium text-slate-400">
                Target Weight (kg)
              </label>
              <input
                id="targetWeight"
                type="number"
                autoComplete="off"
                value={settings.targetWeight}
                onChange={(e) => setSettings({ ...settings, targetWeight: Number(e.target.value) })}
                className="w-full bg-[#111827] border border-[#1e293b] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#00ff87] transition-colors"
              />
            </div>
          </div>
          
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-[#00ff87] text-[#0a0f1e] font-semibold rounded-lg hover:bg-[#00cc6a] transition-colors"
          >
            Save Goals
          </button>
          {saveMessage && <span className="ml-4 text-sm text-[#00ff87]">{saveMessage}</span>}
        </section>

        {/* Notifications Section */}
        <section className="bg-[#0f172a] rounded-xl border border-[#1e293b] p-6 shadow-lg">
          <div className="flex items-center space-x-2 mb-6 border-b border-[#1e293b] pb-4">
            <Bell className="w-6 h-6 text-[#00ff87]" />
            <h2 className="text-xl font-semibold">Notification Preferences</h2>
          </div>
          
          <div className="space-y-4 mb-6">
            {[
              { id: 'workoutReminders', label: 'Workout Reminders' },
              { id: 'mealReminders', label: 'Meal Logging Reminders' },
              { id: 'weeklyReport', label: 'Weekly Progress Report' },
              { id: 'achievements', label: 'Achievement Notifications' },
            ].map((pref) => (
              <div key={pref.id} className="flex items-center justify-between p-4 bg-[#111827] rounded-lg border border-[#1e293b]">
                <label htmlFor={pref.id} className="font-medium text-slate-200 cursor-pointer">
                  {pref.label}
                </label>
                <div 
                  className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors duration-300 ease-in-out ${
                    settings[pref.id as keyof AppSettings] ? 'bg-[#00ff87]' : 'bg-slate-600'
                  }`}
                  onClick={() => {
                    const newValue = !settings[pref.id as keyof AppSettings];
                    setSettings({ ...settings, [pref.id]: newValue });
                  }}
                >
                  <div 
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${
                      settings[pref.id as keyof AppSettings] ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                  <input
                    id={pref.id}
                    type="checkbox"
                    autoComplete="off"
                    checked={settings[pref.id as keyof AppSettings] as boolean}
                    onChange={(e) => setSettings({ ...settings, [pref.id]: e.target.checked })}
                    className="sr-only"
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleSave}
            className="px-6 py-2 bg-[#00ff87] text-[#0a0f1e] font-semibold rounded-lg hover:bg-[#00cc6a] transition-colors"
          >
            Save Preferences
          </button>
        </section>

        {/* Data Management Section */}
        <section className="bg-[#0f172a] rounded-xl border border-[#1e293b] p-6 shadow-lg">
          <div className="flex items-center space-x-2 mb-6 border-b border-[#1e293b] pb-4">
            <Database className="w-6 h-6 text-[#00ff87]" />
            <h2 className="text-xl font-semibold">Data Management</h2>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-[#111827] rounded-lg border border-[#1e293b] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-medium text-slate-200">Export All Data</h3>
                <p className="text-sm text-slate-400">Download your fitness data as a JSON file.</p>
              </div>
              <button
                onClick={handleExport}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors border border-slate-700"
              >
                <Download className="w-4 h-4" />
                <span>Export Data</span>
              </button>
            </div>

            <div className="p-4 bg-[#111827] rounded-lg border border-[#1e293b] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-medium text-slate-200">Clear Workout Data</h3>
                <p className="text-sm text-slate-400">Permanently delete all your saved workouts.</p>
              </div>
              <button
                onClick={() => clearData('fittrack_workouts', 'Workout')}
                className="flex items-center space-x-2 px-4 py-2 bg-red-900/50 text-red-400 rounded-lg hover:bg-red-900/80 transition-colors border border-red-900/50"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear Workouts</span>
              </button>
            </div>

            <div className="p-4 bg-[#111827] rounded-lg border border-[#1e293b] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-medium text-slate-200">Clear Nutrition Data</h3>
                <p className="text-sm text-slate-400">Permanently delete all your meal logs.</p>
              </div>
              <button
                onClick={() => clearData('fittrack_nutrition', 'Nutrition')}
                className="flex items-center space-x-2 px-4 py-2 bg-red-900/50 text-red-400 rounded-lg hover:bg-red-900/80 transition-colors border border-red-900/50"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear Nutrition</span>
              </button>
            </div>

            <div className="p-4 bg-[#111827] rounded-lg border border-[#1e293b] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-medium text-slate-200">Clear Progress Data</h3>
                <p className="text-sm text-slate-400">Permanently delete weight tracking history.</p>
              </div>
              <button
                onClick={() => clearData('fittrack_progress', 'Progress')}
                className="flex items-center space-x-2 px-4 py-2 bg-red-900/50 text-red-400 rounded-lg hover:bg-red-900/80 transition-colors border border-red-900/50"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear Progress</span>
              </button>
            </div>
          </div>
        </section>

        {/* App Info Section */}
        <section className="bg-[#0f172a] rounded-xl border border-[#1e293b] p-6 shadow-lg flex items-start space-x-4">
          <Info className="w-6 h-6 text-slate-400 flex-shrink-0 mt-1" />
          <div>
            <h2 className="text-lg font-semibold text-slate-200">FitTrack App Info</h2>
            <p className="text-slate-400 mt-1">Version 2.0.0</p>
            <p className="text-slate-400">Built with Next.js, TypeScript, and Tailwind CSS.</p>
            <p className="text-slate-500 text-sm mt-4">© {new Date().getFullYear()} FitTrack. All rights reserved.</p>
          </div>
        </section>

      </div>
    </div>
  );
}
