import React, { useState } from 'react';
import { ChecklistItem, Source, Priority } from '@/types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { Progress } from '../ui/Progress';
import { CheckSquare, Square, Plus, CheckCircle2, ChevronRight, ListChecks } from 'lucide-react';

export interface VerificationChecklistProps {
  items: ChecklistItem[];
  sources: Source[];
  onToggleItem: (id: string) => void;
  onAddItem: (item: { title: string; description: string; priority: Priority }) => void;
}

export function VerificationChecklist({
  items,
  sources,
  onToggleItem,
  onAddItem,
}: VerificationChecklistProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState<Priority>('medium');

  const sourceMap = new Map<string, Source>();
  sources.forEach((s) => sourceMap.set(s.id, s));

  const completedCount = items.filter((i) => i.completed).length;
  const progress = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddItem({
      title: newTitle.trim(),
      description: newDesc.trim(),
      priority: newPriority,
    });

    setNewTitle('');
    setNewDesc('');
    setShowAddForm(false);
  };

  const getPriorityBadge = (p: Priority) => {
    switch (p) {
      case 'critical':
        return <Badge variant="danger">Immediate Action</Badge>;
      case 'high':
        return <Badge variant="warning">High Priority</Badge>;
      case 'medium':
        return <Badge variant="indigo">Standard Review</Badge>;
      default:
        return <Badge variant="neutral">Optional</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <ListChecks className="w-5 h-5 text-indigo-600" />
              <span>Prioritized Verification Action Plan</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Actionable tasks to resolve gaps, audit discrepancies, and confirm unverified assumptions
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
            <CheckCircle2 className="w-4 h-4 text-indigo-600" />
            <span>
              {completedCount} of {items.length} Tasks Verified
            </span>
          </div>
        </div>

        <Progress
          value={completedCount}
          max={items.length || 1}
          showPercentage
          label="Verification Completion Rate"
          color="indigo"
        />
      </div>

      {/* Checklist items list */}
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => onToggleItem(item.id)}
            className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 select-none ${
              item.completed
                ? 'bg-slate-50/70 border-slate-200 opacity-70'
                : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
            }`}
          >
            <button
              type="button"
              className="mt-0.5 text-indigo-600 focus:outline-none flex-shrink-0"
              aria-label={item.completed ? 'Mark incomplete' : 'Mark complete'}
            >
              {item.completed ? (
                <CheckSquare className="w-5 h-5 text-emerald-600" />
              ) : (
                <Square className="w-5 h-5 text-slate-400" />
              )}
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                <span
                  className={`text-sm font-semibold ${
                    item.completed ? 'line-through text-slate-500' : 'text-slate-900'
                  }`}
                >
                  {item.title}
                </span>
                <div className="flex items-center gap-2">
                  {item.isCustom && (
                    <span className="text-[10px] font-mono uppercase bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                      Custom
                    </span>
                  )}
                  {getPriorityBadge(item.priority)}
                </div>
              </div>

              {item.description && (
                <p
                  className={`text-xs leading-relaxed ${
                    item.completed ? 'text-slate-400' : 'text-slate-600'
                  }`}
                >
                  {item.description}
                </p>
              )}

              {item.sourceIds && item.sourceIds.length > 0 && (
                <div className="flex items-center gap-1.5 mt-2.5 text-[11px] text-slate-400">
                  <span>Referenced in:</span>
                  <div className="flex flex-wrap gap-1">
                    {item.sourceIds.map((sid) => {
                      const src = sourceMap.get(sid);
                      return (
                        <span key={sid} className="font-mono text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded">
                          {src?.domain || sid}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Custom Item */}
      {!showAddForm ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowAddForm(true)}
          leftIcon={<Plus className="w-4 h-4" />}
          className="w-full justify-center border-dashed border-slate-300 hover:border-indigo-400 hover:text-indigo-600"
        >
          Add Custom Verification Task
        </Button>
      ) : (
        <Card className="p-4 border-indigo-200 bg-indigo-50/20">
          <form onSubmit={handleAdd} className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-900">Add Custom Verification Step</h4>
            <Input
              placeholder="e.g. Call bursar office to confirm renewal grade deadline"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
            />
            <Input
              placeholder="Additional details or contact numbers"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
            />
            <div className="flex items-center gap-3">
              <label className="text-xs text-slate-600 font-medium">Priority:</label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as Priority)}
                className="text-xs border rounded-lg px-2.5 py-1.5 bg-white text-slate-800 focus:outline-none"
              >
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Add Task
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}

