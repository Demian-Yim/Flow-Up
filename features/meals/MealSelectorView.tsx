import React, { useState, useEffect } from 'react';
import { CheckCircle, MapPin, BarChart2, Settings, Plus, Trash, Edit, X, Save, Search, UtensilsCrossed, ExternalLink } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { useParticipantId } from '../../hooks/useParticipantId';
import { Meal } from '../../types';
import { generateMealReaction } from '../../services/geminiService';
import Spinner from '../../components/Spinner';

const MealSelectorView: React.FC = () => {
    const { role, participants, restaurantInfo, meals, selections, addSelection, fetchMenu, addMeal, updateMeal, deleteMeal } = useAppContext();
    const participantId = useParticipantId();
    const mySelection = selections.find(s => s.participantId === participantId);

    const [reaction, setReaction] = useState('');
    const [adminView, setAdminView] = useState<'status' | 'manage'>('status');
    const [editingMeal, setEditingMeal] = useState<Meal | null | Partial<Meal>>(null);
    const [restaurantQuery, setRestaurantQuery] = useState(restaurantInfo?.name || '');
    const [isFetchingMenu, setIsFetchingMenu] = useState(false);

    useEffect(() => {
        if(meals.length === 0 && role === '관리자' && restaurantInfo?.name) {
            handleFetchMenu();
        }
    },[]);

    const handleSelect = async (mealId: number) => {
        const meal = meals.find(m => m.id === mealId);
        if (meal) {
            addSelection({ participantId, mealId });
            const msg = await generateMealReaction(meal.name);
            setReaction(msg);
            setTimeout(() => setReaction(''), 4000);
        }
    };
    
    const handleFetchMenu = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!restaurantQuery.trim()) {
            alert("식당 이름을 입력해주세요.");
            return;
        }
        setIsFetchingMenu(true);
        await fetchMenu(restaurantQuery);
        setIsFetchingMenu(false);
    }

    const handleSaveMeal = (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);
        const mealData = Object.fromEntries(formData.entries());

        if (!mealData.name) {
            alert("메뉴 이름을 입력해주세요.");
            return;
        }
        const mealToSave = {
            ...editingMeal,
            name: mealData.name as string,
            price: Number(mealData.price),
            stock: Number(mealData.stock),
            description: mealData.description as string,
            emoji: mealData.emoji as string,
            isRecommended: mealData.isRecommended === 'on',
        }

        if ('id' in mealToSave && mealToSave.id) {
            updateMeal(mealToSave as Meal);
        } else {
            addMeal(mealToSave as Omit<Meal, 'id'>);
        }
        setEditingMeal(null);
    }
    
    const handleDeleteMeal = (mealId: number) => {
        if (window.confirm("정말로 이 메뉴를 삭제하시겠습니까?")) {
            deleteMeal(mealId);
        }
    }

    const selectionsWithDetails = selections.map(selection => {
        const participant = participants.find(p => p.id === selection.participantId);
        const meal = meals.find(m => m.id === selection.mealId);
        return {
            participantName: participant?.name || '알 수 없는 참가자',
            mealName: meal?.name || '알 수 없는 메뉴',
            price: meal?.price || 0,
        };
    });

    const totalPrice = selectionsWithDetails.reduce((sum, item) => sum + item.price, 0);

    const MealManagementModal = () => (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4">
            <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-bold">{editingMeal && 'id' in editingMeal ? '메뉴 수정' : '새 메뉴 추가'}</h3>
                    <button onClick={() => setEditingMeal(null)} className="p-2 rounded-full hover:bg-slate-700"><X /></button>
                </div>
                <form onSubmit={handleSaveMeal} className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto pr-2">
                    <input name="name" type="text" placeholder="메뉴 이름" defaultValue={editingMeal?.name || ''} className="md:col-span-2 w-full px-4 py-2 bg-slate-700 rounded-lg border-slate-600" required/>
                    <input name="price" type="number" placeholder="가격" defaultValue={editingMeal?.price || ''} className="w-full px-4 py-2 bg-slate-700 rounded-lg border-slate-600" />
                     <input name="emoji" type="text" placeholder="이모지 (예: 🍖)" defaultValue={editingMeal?.emoji || ''} className="w-full px-4 py-2 bg-slate-700 rounded-lg border-slate-600" />
                     <textarea name="description" placeholder="설명" defaultValue={editingMeal?.description || ''} className="md:col-span-2 w-full px-4 py-2 bg-slate-700 rounded-lg border-slate-600" rows={2}/>
                    <input name="stock" type="number" placeholder="재고" defaultValue={editingMeal?.stock || 20} className="w-full px-4 py-2 bg-slate-700 rounded-lg border-slate-600" />
                    <div className="flex items-center gap-2">
                        <input name="isRecommended" type="checkbox" id="is-recommended" defaultChecked={editingMeal?.isRecommended || false} className="h-4 w-4 rounded bg-slate-600 border-slate-500 text-brand-indigo focus:ring-brand-indigo" />
                        <label htmlFor="is-recommended">추천 메뉴로 설정</label>
                    </div>
                    <button type="submit" className="md:col-span-2 flex items-center justify-center gap-2 bg-brand-emerald text-white font-bold py-2 px-6 rounded-lg"><Save/>저장</button>
                </form>
            </div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center">
                 <h2 className="text-3xl font-bold mb-2">오늘 뭐 먹지? 🍱</h2>
                 {restaurantInfo ? (
                     <div className="text-slate-400">
                         <p>"{restaurantInfo.name}" 메뉴를 보고, 다함께 식사를 골라요.</p>
                         {restaurantInfo.address && (
                            <a href={restaurantInfo.mapUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-brand-amber hover:underline mt-1">
                                <MapPin size={14} /> {restaurantInfo.address} <ExternalLink size={14} />
                            </a>
                         )}
                     </div>
                 ) : (
                    <p className="text-slate-400">먼저 관리자가 식당을 선택해야 합니다.</p>
                 )}
            </div>

            {editingMeal && <MealManagementModal />}

            {role === '관리자' && (
                <div className="bg-slate-800 p-6 rounded-2xl">
                     <div className="flex justify-center items-center gap-2 mb-4 p-1 rounded-full bg-slate-900 w-fit mx-auto">
                        <button onClick={() => setAdminView('status')} className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${adminView === 'status' ? 'bg-brand-purple text-white' : 'text-slate-300 hover:bg-slate-700'}`}><BarChart2 size={16}/>주문 현황</button>
                        <button onClick={() => setAdminView('manage')} className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${adminView === 'manage' ? 'bg-brand-purple text-white' : 'text-slate-300 hover:bg-slate-700'}`}><Settings size={16}/>메뉴 관리</button>
                    </div>

                    {adminView === 'status' ? (
                        <div>
                            <h3 className="text-xl font-bold mb-4">주문 현황</h3>
                            <div className="bg-slate-700 p-4 rounded-lg mb-4">
                                <p className="text-slate-400">총 주문</p>
                                <p className="text-3xl font-bold text-white">{selections.length}건 / {totalPrice.toLocaleString()}원</p>
                            </div>
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {selectionsWithDetails.length > 0 ? selectionsWithDetails.map((item, index) => (
                                    <div key={index} className="flex justify-between bg-slate-900/50 p-2 rounded">
                                        <span>{item.participantName}</span>
                                        <span className="text-slate-300">{item.mealName} ({item.price.toLocaleString()}원)</span>
                                    </div>
                                )) : <p className="text-center text-slate-500 py-4">아직 주문이 없습니다.</p>}
                            </div>
                        </div>
                    ) : (
                        <div>
                            <h3 className="text-xl font-bold mb-4">메뉴 관리</h3>
                            <form onSubmit={handleFetchMenu} className="flex gap-2 mb-4">
                                <input type="text" value={restaurantQuery} onChange={e => setRestaurantQuery(e.target.value)} placeholder="식당 이름, 위치 (예: 순남시래기 방배점)" className="flex-grow w-full px-4 py-2 bg-slate-700 rounded-lg border-slate-600"/>
                                <button type="submit" disabled={isFetchingMenu} className="flex items-center justify-center gap-2 bg-brand-indigo text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50">
                                    {isFetchingMenu ? <Spinner/> : <><Search size={16}/>메뉴 불러오기</>}
                                </button>
                            </form>
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                <button onClick={() => setEditingMeal({name: '', price: 0, emoji: '', description: '', stock: 20, isRecommended: false})} className="w-full flex items-center justify-center gap-2 text-sm py-2 px-4 rounded-lg bg-slate-700 hover:bg-slate-600 mb-2"><Plus size={16}/>새 메뉴 직접 추가</button>
                                {meals.map(meal => (
                                    <div key={meal.id} className="flex items-center justify-between bg-slate-700 p-2 rounded-lg">
                                        <span>{meal.emoji} {meal.name}</span>
                                        <div className="flex gap-2">
                                            <button onClick={() => setEditingMeal(meal)} className="p-2 hover:text-brand-amber"><Edit size={16}/></button>
                                            <button onClick={() => handleDeleteMeal(meal.id)} className="p-2 hover:text-red-500"><Trash size={16}/></button>
                                        </div>
                                    </div>
                                ))}
                             </div>
                        </div>
                    )}
                </div>
            )}

            {isFetchingMenu ? <div className="text-center py-10"><Spinner /><p className="mt-2">AI가 메뉴판을 만들고 있습니다...</p></div> : 
            meals.length === 0 ? (
                <div className="text-center py-10 bg-slate-800 rounded-2xl">
                    <UtensilsCrossed className="w-12 h-12 mx-auto text-slate-600 mb-4"/>
                    <p className="text-slate-400">메뉴가 아직 준비되지 않았습니다.</p>
                    <p className="text-sm text-slate-500">관리자가 메뉴를 불러올 때까지 잠시만 기다려주세요.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {meals.map(meal => {
                        const isSelected = mySelection?.mealId === meal.id;
                        return (
                            <div key={meal.id} 
                                className={`relative bg-slate-800 rounded-2xl flex flex-col transition-all duration-300 cursor-pointer hover:scale-105 ${isSelected ? 'ring-4 ring-brand-emerald' : ''}`}
                                onClick={role === '참가자' ? () => handleSelect(meal.id) : undefined}
                            >
                                {meal.isRecommended && <div className="absolute top-0 left-0 bg-brand-amber text-white text-xs font-bold px-3 py-1 rounded-br-lg z-10">추천!</div>}
                                {isSelected && <div className="absolute top-2 right-2 bg-brand-emerald text-white p-2 rounded-full z-10"><CheckCircle/></div>}
                                
                                <div className="p-4 flex-grow flex flex-col">
                                    <div className="flex-grow">
                                        <span className="text-5xl">{meal.emoji || '🍽️'}</span>
                                        <h3 className="text-xl font-bold mt-2">{meal.name}</h3>
                                        <p className="text-slate-400 text-sm h-10 mt-1">{meal.description}</p>
                                    </div>
                                    <div className="flex justify-between items-center mt-4">
                                        <span className="text-lg font-bold text-brand-emerald">{meal.price.toLocaleString()}원</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {reaction && role === '참가자' && (
                <div className="fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 w-11/12 max-w-md bg-gradient-to-r from-brand-emerald to-teal-500 text-white p-4 rounded-xl shadow-lg flex items-center gap-4 fade-in z-30">
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