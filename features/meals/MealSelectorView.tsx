
import React from 'react';
import { CheckCircle, Info, BarChart2 } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { useParticipantId } from '../../hooks/useParticipantId';

const MealSelectorView: React.FC = () => {
    const { role, meals, selections, addSelection } = useAppContext();
    const participantId = useParticipantId();
    const mySelection = selections.find(s => s.participantId === participantId);

    const handleSelect = (mealId: number) => {
        const meal = meals.find(m => m.id === mealId);
        if (meal && meal.stock > 0) {
            addSelection({ participantId, mealId });
        }
    };

    const totalSelections = selections.length;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center">
                 <h2 className="text-3xl font-bold mb-2">점심 뭐 먹지? 🍱</h2>
                 <p className="text-slate-400">다양한 메뉴를 보고, 다함께 점심을 골라요.</p>
            </div>

            {role === '관리자' && (
                <div className="bg-slate-800 p-6 rounded-2xl">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><BarChart2 />선택 현황</h3>
                    <div className="space-y-3">
                        {meals.map(meal => {
                            const count = selections.filter(s => s.mealId === meal.id).length;
                            const percentage = totalSelections > 0 ? (count / totalSelections) * 100 : 0;
                            return (
                                <div key={meal.id}>
                                    <div className="flex justify-between mb-1 text-sm font-bold">
                                        <span>{meal.name}</span>
                                        <span>{count}명 ({percentage.toFixed(1)}%)</span>
                                    </div>
                                    <div className="w-full bg-slate-700 rounded-full h-3">
                                        <div className="bg-gradient-to-r from-brand-indigo to-brand-purple h-3 rounded-full" style={{width: `${percentage}%`}}></div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {meals.map(meal => {
                    const isSelected = mySelection?.mealId === meal.id;
                    const isSoldOut = meal.stock === 0;
                    return (
                        <div key={meal.id} 
                             className={`relative bg-slate-800 rounded-2xl overflow-hidden transition-all duration-300 ${isSoldOut ? 'opacity-50' : 'cursor-pointer hover:scale-105'} ${isSelected ? 'ring-4 ring-brand-emerald' : ''}`}
                             onClick={role === '참가자' && !isSoldOut ? () => handleSelect(meal.id) : undefined}
                        >
                            {meal.isRecommended && <div className="absolute top-0 left-0 bg-brand-amber text-white text-xs font-bold px-3 py-1 rounded-br-lg">추천!</div>}
                            {isSelected && <div className="absolute top-2 right-2 bg-brand-emerald text-white p-2 rounded-full"><CheckCircle/></div>}
                            
                            <img src={meal.image} alt={meal.name} className="w-full h-48 object-cover"/>
                            <div className="p-4">
                                <h3 className="text-xl font-bold">{meal.name}</h3>
                                <p className="text-slate-400 text-sm h-10">{meal.description}</p>
                                <div className="flex justify-between items-center mt-4">
                                    <span className="text-lg font-bold text-brand-emerald">{meal.price.toLocaleString()}원</span>
                                    <span className={`text-sm font-bold px-2 py-1 rounded-full ${isSoldOut ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                                        {isSoldOut ? '품절' : `재고: ${meal.stock}개`}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {mySelection && role === '참가자' && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-11/12 max-w-md bg-gradient-to-r from-brand-emerald to-teal-500 text-white p-4 rounded-xl shadow-lg flex items-center gap-4 fade-in">
                    <CheckCircle/>
                    <div className="flex-grow">
                        <p className="font-bold">선택 완료!</p>
                        <p className="text-sm">{meals.find(m => m.id === mySelection.mealId)?.name}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MealSelectorView;
