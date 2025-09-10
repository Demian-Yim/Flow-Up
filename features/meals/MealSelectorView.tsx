import React, { useState } from 'react';
import { CheckCircle, Info, BarChart2, Settings, Plus, Trash, Edit, X, Save } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { useParticipantId } from '../../hooks/useParticipantId';
import { Meal } from '../../types';
import { generateMealReaction } from '../../services/geminiService';

const MealSelectorView: React.FC = () => {
    const { role, meals, selections, addSelection, addMeal, updateMeal, deleteMeal } = useAppContext();
    const participantId = useParticipantId();
    const mySelection = selections.find(s => s.participantId === participantId);

    const [reaction, setReaction] = useState('');
    const [isManaging, setIsManaging] = useState(false);
    const [editingMeal, setEditingMeal] = useState<Meal | null | Partial<Meal>>(null);

    const handleSelect = async (mealId: number) => {
        const meal = meals.find(m => m.id === mealId);
        if (meal && meal.stock > 0) {
            addSelection({ participantId, mealId });
            const msg = await generateMealReaction(meal.name);
            setReaction(msg);
            setTimeout(() => setReaction(''), 4000);
        }
    };

    const handleSaveMeal = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingMeal?.name) {
            alert("메뉴 이름을 입력해주세요.");
            return;
        }

        if ('id' in editingMeal && editingMeal.id) {
            updateMeal(editingMeal as Meal);
        } else {
            addMeal({
                name: editingMeal.name,
                description: editingMeal.description || '',
                price: Number(editingMeal.price) || 0,
                image: editingMeal.image || '',
                stock: Number(editingMeal.stock) || 0,
                isRecommended: editingMeal.isRecommended || false
            });
        }
        setEditingMeal(null);
    }
    
    const handleDeleteMeal = (mealId: number) => {
        if (window.confirm("정말로 이 메뉴를 삭제하시겠습니까?")) {
            deleteMeal(mealId);
        }
    }

    const totalSelections = selections.length;

    const MealManagementModal = () => (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4">
            <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-bold">메뉴 관리</h3>
                    <button onClick={() => setEditingMeal(null)} className="p-2 rounded-full hover:bg-slate-700"><X /></button>
                </div>
                <form onSubmit={handleSaveMeal} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <input type="text" placeholder="메뉴 이름" value={editingMeal?.name || ''} onChange={e => setEditingMeal({...editingMeal, name: e.target.value})} className="w-full px-4 py-2 bg-slate-700 rounded-lg border-slate-600" required/>
                    <input type="number" placeholder="가격" value={editingMeal?.price || ''} onChange={e => setEditingMeal({...editingMeal, price: Number(e.target.value)})} className="w-full px-4 py-2 bg-slate-700 rounded-lg border-slate-600" />
                    <input type="number" placeholder="재고" value={editingMeal?.stock || ''} onChange={e => setEditingMeal({...editingMeal, stock: Number(e.target.value)})} className="w-full px-4 py-2 bg-slate-700 rounded-lg border-slate-600" />
                    <div className="flex items-center gap-2">
                        <input type="checkbox" id="is-recommended" checked={editingMeal?.isRecommended || false} onChange={e => setEditingMeal({...editingMeal, isRecommended: e.target.checked})} />
                        <label htmlFor="is-recommended">추천 메뉴로 설정</label>
                    </div>
                    <textarea placeholder="설명" value={editingMeal?.description || ''} onChange={e => setEditingMeal({...editingMeal, description: e.target.value})} className="md:col-span-2 w-full px-4 py-2 bg-slate-700 rounded-lg border-slate-600" rows={2}/>
                    <input type="text" placeholder="이미지 URL" value={editingMeal?.image || ''} onChange={e => setEditingMeal({...editingMeal, image: e.target.value})} className="md:col-span-2 w-full px-4 py-2 bg-slate-700 rounded-lg border-slate-600" />
                    <button type="submit" className="md:col-span-2 flex items-center justify-center gap-2 bg-brand-emerald text-white font-bold py-2 px-6 rounded-lg"><Save/>저장</button>
                </form>
            </div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center">
                 <h2 className="text-3xl font-bold mb-2">점심 뭐 먹지? 🍱</h2>
                 <p className="text-slate-400">다양한 메뉴를 보고, 다함께 점심을 골라요.</p>
            </div>

            {editingMeal && <MealManagementModal />}

            {role === '관리자' && (
                <div className="bg-slate-800 p-6 rounded-2xl">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold flex items-center gap-2"><BarChart2 />선택 현황</h3>
                        <button onClick={() => setIsManaging(!isManaging)} className="flex items-center gap-2 text-sm py-2 px-4 rounded-lg bg-slate-700 hover:bg-slate-600">
                           <Settings size={16}/>{isManaging ? '관리 닫기' : '메뉴 관리'}
                        </button>
                    </div>

                    {isManaging ? (
                        <div className="space-y-2">
                            <button onClick={() => setEditingMeal({})} className="w-full flex items-center justify-center gap-2 text-sm py-2 px-4 rounded-lg bg-brand-indigo hover:opacity-90 mb-4"><Plus size={16}/>새 메뉴 추가</button>
                            {meals.map(meal => (
                                <div key={meal.id} className="flex items-center justify-between bg-slate-700 p-2 rounded-lg">
                                    <span>{meal.name}</span>
                                    <div className="flex gap-2">
                                        <button onClick={() => setEditingMeal(meal)} className="p-2 hover:text-brand-amber"><Edit size={16}/></button>
                                        <button onClick={() => handleDeleteMeal(meal.id)} className="p-2 hover:text-red-500"><Trash size={16}/></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
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
                    )}
                </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {meals.map(meal => {
                    const isSelected = mySelection?.mealId === meal.id;
                    const isSoldOut = meal.stock <= selections.filter(s => s.mealId === meal.id).length;
                    return (
                        <div key={meal.id} 
                             className={`relative bg-slate-800 rounded-2xl overflow-hidden transition-all duration-300 ${isSoldOut && !isSelected ? 'opacity-50' : 'cursor-pointer hover:scale-105'} ${isSelected ? 'ring-4 ring-brand-emerald' : ''}`}
                             onClick={role === '참가자' && !isSoldOut ? () => handleSelect(meal.id) : undefined}
                             aria-disabled={isSoldOut}
                        >
                            {meal.isRecommended && <div className="absolute top-0 left-0 bg-brand-amber text-white text-xs font-bold px-3 py-1 rounded-br-lg z-10">추천!</div>}
                            {isSelected && <div className="absolute top-2 right-2 bg-brand-emerald text-white p-2 rounded-full z-10"><CheckCircle/></div>}
                            
                            <img src={meal.image} alt={meal.name} className="w-full h-48 object-cover"/>
                            <div className="p-4">
                                <h3 className="text-xl font-bold">{meal.name}</h3>
                                <p className="text-slate-400 text-sm h-10">{meal.description}</p>
                                <div className="flex justify-between items-center mt-4">
                                    <span className="text-lg font-bold text-brand-emerald">{meal.price.toLocaleString()}원</span>
                                    <span className={`text-sm font-bold px-2 py-1 rounded-full ${isSoldOut ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                                        {isSoldOut ? '품절' : `재고: ${meal.stock - selections.filter(s => s.mealId === meal.id).length}개`}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {reaction && role === '참가자' && (
                <div className="fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 w-11/12 max-w-md bg-gradient-to-r from-brand-emerald to-teal-500 text-white p-4 rounded-xl shadow-lg flex items-center gap-4 fade-in">
                    <CheckCircle/>
                    <div className="flex-grow">
                        <p className="font-bold">선택 완료!</p>
                        <p className="text-sm italic">"{reaction}"</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MealSelectorView;