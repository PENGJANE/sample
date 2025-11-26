import React from 'react';
import { AnalysisResult, SafetyGrade, RuleType } from '../types';
import { GRADE_DEFINITIONS, RULES } from '../constants';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface AnalysisViewProps {
  result: AnalysisResult;
  isLoading: boolean;
}

const AnalysisView: React.FC<AnalysisViewProps> = ({ result, isLoading }) => {
  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-12 text-slate-400 animate-pulse">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-lg font-medium text-slate-600">正在进行 AI 智能审核...</p>
        <p className="text-sm text-slate-500">正在校验 R1-R5 规则</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4 text-slate-300"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
        <p>请提交商品信息以查看审核结果</p>
      </div>
    );
  }

  const gradeDef = GRADE_DEFINITIONS[result.grade];
  
  // Prepare data for a simple visualization of detected vs safe rules
  const detectedCount = result.violations.filter(v => v.detected).length;
  const chartData = [
    { name: '安全规则', value: 5 - detectedCount, color: '#e2e8f0' },
    { name: '违规项', value: detectedCount, color: result.grade === SafetyGrade.S2 ? '#ef4444' : (result.grade === SafetyGrade.S1 ? '#f97316' : '#22c55e') },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Result Card */}
      <div className={`p-6 rounded-xl border-2 ${gradeDef.color} shadow-sm bg-opacity-20`}>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-1">{gradeDef.label}</h2>
            <p className="font-medium text-lg opacity-90">{gradeDef.intervention}</p>
          </div>
          <div className="text-right max-w-[200px]">
             <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white bg-opacity-50">
               {gradeDef.logic}
             </span>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-black border-opacity-10">
            <p className="font-semibold mb-1">AI 审核逻辑摘要:</p>
            <p className="text-sm opacity-90 leading-relaxed">{result.summary}</p>
        </div>
      </div>

      {/* Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Rules List */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="font-bold text-slate-700 text-lg">规则命中详情</h3>
          {result.violations.map((violation) => {
             const ruleInfo = RULES.find(r => r.id === violation.ruleId);
             const isDetected = violation.detected;
             return (
               <div 
                  key={violation.ruleId} 
                  className={`p-4 rounded-lg border transition-all ${
                    isDetected 
                    ? 'border-red-200 bg-red-50' 
                    : 'border-slate-100 bg-white opacity-80'
                  }`}
               >
                 <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${isDetected ? 'bg-red-200 text-red-800' : 'bg-slate-200 text-slate-600'}`}>
                            {violation.ruleId}
                        </span>
                        <span className={`text-sm font-semibold ${isDetected ? 'text-red-900' : 'text-slate-600'}`}>
                            {ruleInfo?.name}
                        </span>
                    </div>
                    {isDetected ? (
                        <span className="text-red-600 flex items-center gap-1 text-sm font-bold">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                            违规
                        </span>
                    ) : (
                         <span className="text-slate-400 flex items-center gap-1 text-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                            通过
                        </span>
                    )}
                 </div>
                 <p className={`text-sm ${isDetected ? 'text-red-800' : 'text-slate-500'}`}>
                   {violation.reasoning}
                 </p>
               </div>
             );
          })}
        </div>

        {/* Sidebar Stats */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm flex flex-col h-fit">
            <h3 className="font-bold text-slate-700 mb-4">风险分布</h3>
            <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={60}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
                <div className="flex justify-between items-center text-sm border-b pb-2">
                    <span className="text-slate-500">核心判定逻辑</span>
                    <span className="font-medium text-right text-slate-800">{result.coreLogic}</span>
                </div>
                 <div className="flex justify-between items-center text-sm pt-2">
                    <span className="text-slate-500">命中规则数</span>
                    <span className="font-bold text-slate-800">{detectedCount} / 5</span>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default AnalysisView;