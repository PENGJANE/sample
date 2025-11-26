import React, { useState } from 'react';
import { RULES, GRADE_DEFINITIONS } from '../constants';

const RuleGuide: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden mb-6">
      <div 
        className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center cursor-pointer hover:bg-slate-100 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="font-semibold text-slate-700 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
          审核规则参考 (Moderation Guidelines)
        </h3>
        <span className="text-slate-500 text-sm">
            {isOpen ? '收起' : '展开'}
        </span>
      </div>

      {isOpen && (
        <div className="p-4 overflow-x-auto">
          <div className="mb-6">
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">规则定义 (Rules R1-R5)</h4>
            <table className="min-w-full text-sm text-left text-slate-600 border border-slate-200">
              <thead className="bg-slate-100 text-slate-700 uppercase font-medium">
                <tr>
                  <th className="px-4 py-2 border-b">编号</th>
                  <th className="px-4 py-2 border-b">类型</th>
                  <th className="px-4 py-2 border-b">客观判断标准</th>
                </tr>
              </thead>
              <tbody>
                {RULES.map((rule) => (
                  <tr key={rule.id} className="border-b hover:bg-slate-50">
                    <td className="px-4 py-2 font-bold whitespace-nowrap">{rule.id}</td>
                    <td className="px-4 py-2 font-medium">{rule.name}</td>
                    <td className="px-4 py-2">
                      <ul className="list-disc pl-4 space-y-1">
                        {rule.criteria.map((c, idx) => <li key={idx}>{c}</li>)}
                      </ul>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div>
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">干预模式</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(GRADE_DEFINITIONS).map(([grade, def]) => (
                <div key={grade} className={`p-3 rounded-md border ${def.color} bg-opacity-10 border-opacity-50`}>
                  <div className="font-bold text-lg mb-1">{def.label}</div>
                  <div className="text-xs font-semibold uppercase mb-2 opacity-75">{def.intervention.split('：')[0]}</div>
                  <p className="text-sm mb-2">{def.intervention}</p>
                  <p className="text-xs italic opacity-80">"{def.logic}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RuleGuide;