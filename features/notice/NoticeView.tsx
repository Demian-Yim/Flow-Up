import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Role, WorkshopNotice } from '../../types';
import { ClipboardList, Calendar, Clock, Laptop, Link as LinkIcon, MapPin, Save, Edit, X, ExternalLink } from 'lucide-react';
import Spinner from '../../components/Spinner';

const NoticeView: React.FC = () => {
    const { role, workshopNotice, updateWorkshopNotice } = useAppContext();
    const [isEditing, setIsEditing] = useState(false);
    
    const [formData, setFormData] = useState<WorkshopNotice>(
        workshopNotice || {
            title: '', date: '', arrivalInfo: '', requirements: '', 
            surveyLink: '', locationName: '', locationAddress: '', mapLink: ''
        }
    );

    React.useEffect(() => {
        if (workshopNotice) {
            setFormData(workshopNotice);
        }
    }, [workshopNotice]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        updateWorkshopNotice(formData);
        setIsEditing(false);
    };

    const InfoRow: React.FC<{ icon: React.ElementType, label: string, children: React.ReactNode }> = ({ icon: Icon, label, children }) => (
        <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 text-center">
                <Icon className="inline-block h-6 w-6 text-brand-amber" />
                <p className="text-xs text-slate-400 mt-1">{label}</p>
            </div>
            <div className="flex-grow pt-0.5">{children}</div>
        </div>
    );
    
    if (role === Role.Admin && isEditing) {
        return (
            <div className="max-w-3xl mx-auto bg-slate-800 p-6 rounded-2xl">
                <h2 className="text-2xl font-bold mb-4">공지 수정</h2>
                <form onSubmit={handleSave} className="space-y-4">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-slate-300 mb-1">교육 과정명</label>
                        <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} className="w-full bg-slate-700 p-2 rounded-lg" />
                    </div>
                    <div>
                        <label htmlFor="date" className="block text-sm font-medium text-slate-300 mb-1">일시</label>
                        <input type="text" name="date" id="date" value={formData.date} onChange={handleChange} className="w-full bg-slate-700 p-2 rounded-lg" />
                    </div>
                    <div>
                        <label htmlFor="arrivalInfo" className="block text-sm font-medium text-slate-300 mb-1">도착 안내</label>
                        <input type="text" name="arrivalInfo" id="arrivalInfo" value={formData.arrivalInfo} onChange={handleChange} className="w-full bg-slate-700 p-2 rounded-lg" />
                    </div>
                    <div>
                        <label htmlFor="requirements" className="block text-sm font-medium text-slate-300 mb-1">준비물</label>
                        <textarea name="requirements" id="requirements" value={formData.requirements} onChange={handleChange} className="w-full bg-slate-700 p-2 rounded-lg" rows={3} />
                    </div>
                    <div>
                        <label htmlFor="surveyLink" className="block text-sm font-medium text-slate-300 mb-1">사전 설문 링크</label>
                        <input type="url" name="surveyLink" id="surveyLink" value={formData.surveyLink} onChange={handleChange} className="w-full bg-slate-700 p-2 rounded-lg" />
                    </div>
                    <div>
                        <label htmlFor="locationName" className="block text-sm font-medium text-slate-300 mb-1">장소명</label>
                        <input type="text" name="locationName" id="locationName" value={formData.locationName} onChange={handleChange} className="w-full bg-slate-700 p-2 rounded-lg" />
                    </div>
                     <div>
                        <label htmlFor="locationAddress" className="block text-sm font-medium text-slate-300 mb-1">주소</label>
                        <input type="text" name="locationAddress" id="locationAddress" value={formData.locationAddress} onChange={handleChange} className="w-full bg-slate-700 p-2 rounded-lg" />
                    </div>
                    <div>
                        <label htmlFor="mapLink" className="block text-sm font-medium text-slate-300 mb-1">지도 링크</label>
                        <input type="url" name="mapLink" id="mapLink" value={formData.mapLink} onChange={handleChange} className="w-full bg-slate-700 p-2 rounded-lg" />
                    </div>
                    <div className="flex justify-end gap-4">
                        <button type="button" onClick={() => setIsEditing(false)} className="flex items-center gap-2 bg-slate-600 text-white font-bold py-2 px-4 rounded-lg"><X size={18}/> 취소</button>
                        <button type="submit" className="flex items-center gap-2 bg-brand-emerald text-white font-bold py-2 px-4 rounded-lg"><Save size={18}/> 저장</button>
                    </div>
                </form>
            </div>
        )
    }

    if (!workshopNotice) {
        return (
            <div className="text-center p-8">
                <Spinner />
                <p className="mt-2 text-slate-400">공지사항을 불러오는 중입니다...</p>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto bg-slate-800 p-6 md:p-8 rounded-2xl relative">
            {role === Role.Admin && (
                <button 
                    onClick={() => setIsEditing(true)} 
                    className="absolute top-4 right-4 flex items-center gap-2 bg-slate-700 hover:bg-brand-purple text-white font-bold py-2 px-4 rounded-lg"
                >
                    <Edit size={16} /> <span>수정</span>
                </button>
            )}
            <div className="text-center mb-8">
                <div className="p-4 inline-block rounded-2xl bg-gradient-to-br from-brand-indigo to-brand-purple mb-4">
                    <ClipboardList className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold mb-2">{workshopNotice.title}</h2>
            </div>
            
            <div className="space-y-6">
                <InfoRow icon={Calendar} label="일시">
                    <p className="text-lg font-semibold">{workshopNotice.date}</p>
                </InfoRow>
                <InfoRow icon={Clock} label="도착 안내">
                    <p className="text-slate-300">{workshopNotice.arrivalInfo}</p>
                </InfoRow>
                <InfoRow icon={Laptop} label="준비물">
                    <p className="text-slate-300 whitespace-pre-wrap">{workshopNotice.requirements}</p>
                </InfoRow>
                <InfoRow icon={LinkIcon} label="사전 설문">
                    <a href={workshopNotice.surveyLink} target="_blank" rel="noopener noreferrer" className="text-brand-emerald hover:underline break-all inline-flex items-center gap-1">
                        설문 참여하기 <ExternalLink size={16} />
                    </a>
                </InfoRow>
                <InfoRow icon={MapPin} label="장소">
                    <p className="font-semibold">{workshopNotice.locationName}</p>
                    <p className="text-slate-300 mb-1">{workshopNotice.locationAddress}</p>
                    <a href={workshopNotice.mapLink} target="_blank" rel="noopener noreferrer" className="text-brand-emerald hover:underline inline-flex items-center gap-1">
                        지도에서 위치 보기 <ExternalLink size={16} />
                    </a>
                </InfoRow>
            </div>
        </div>
    );
};

export default NoticeView;
