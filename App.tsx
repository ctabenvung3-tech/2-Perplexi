import React, { useState, useCallback, useEffect } from 'react';
import { Survey, Question, QuestionType, SurveyResponse } from './types';

// Import trực tiếp file trong cùng folder
import { generateSurveyFromPrompt } from './GeminiService';
import QuestionEditor from './QuestionEditor';
import FormViewer from './FormViewer';
import ResponsesViewer from './ResponsesViewer';
import ShareModal from './ShareModal';
import { PlusIcon, ShareIcon } from './icons';

type View = 'EDIT' | 'PREVIEW' | 'RESPONSES';

const initialSurvey: Survey = {
  title: 'BIỂU MẪU KHẢO SÁT THÔNG TIN MÔI TRƯỜNG',
  description: 'CHÚNG TÔI CAM KẾT CHỈ SỬ DỤNG THÔNG TIN CHO MỤC ĐÍCH NGHIÊN CỨU KHOA HỌC.',
  questions: [
    {
      id: crypto.randomUUID(),
      title: 'Tên doanh nghiệp',
      questionType: QuestionType.SHORT_ANSWER,
      options: [],
      isRequired: true,
    },
    {
      id: crypto.randomUUID(),
      title: 'Địa chỉ',
      questionType: QuestionType.SHORT_ANSWER,
      options: [],
      isRequired: true,
    },
    {
      id: crypto.randomUUID(),
      title: 'Ngành nghề sản xuất chính (VD: Điện tử, may mặc...)',
      questionType: QuestionType.SHORT_ANSWER,
      options: [],
      isRequired: true,
    },
    {
      id: crypto.randomUUID(),
      title: 'Vốn điều lệ',
      questionType: QuestionType.MULTIPLE_CHOICE,
      options: ['Dưới 3 tỷ', 'Từ 3 đến dưới 20 tỷ', 'Từ 20 đến dưới 100 tỷ', 'Trên 100 tỷ'],
      isRequired: true,
    },
    {
      id: crypto.randomUUID(),
      title: 'Quy mô lao động (Người)',
      questionType: QuestionType.SHORT_ANSWER,
      options: [],
      isRequired: true,
    },
    {
      id: crypto.randomUUID(),
      title: 'Diện tích nhà xưởng sản xuất (m²)',
      questionType: QuestionType.SHORT_ANSWER,
      options: [],
      isRequired: true,
    },
    {
      id: crypto.randomUUID(),
      title: 'Loại hình doanh nghiệp',
      questionType: QuestionType.MULTIPLE_CHOICE,
      options: [
        'Doanh nghiệp nhà nước',
        'Doanh nghiệp FDI',
        'Doanh nghiệp ngoài nhà nước trong nước',
      ],
      isRequired: true,
    },
  ],
};

function App() {
  const [survey, setSurvey] = useState<Survey>(initialSurvey);
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [currentView, setCurrentView] = useState<View>('EDIT');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isFillMode, setIsFillMode] = useState(false);
  const [webAppUrl, setWebAppUrl] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const surveyData = params.get('survey');
    const endpoint = params.get('endpoint');

    if (surveyData && endpoint) {
      try {
        const decodedSurvey = JSON.parse(decodeURIComponent(atob(surveyData)));
        const decodedUrl = atob(endpoint);
        setSurvey(decodedSurvey);
        setWebAppUrl(decodedUrl);
        setIsFillMode(true);
      } catch (e) {
        console.error("Failed to parse survey data from URL", e);
        setError("Không thể tải khảo sát từ liên kết. Liên kết có thể bị lỗi.");
      }
    }
  }, []);

  const updateSurvey = (updates: Partial<Survey>) => {
    setSurvey(prev => ({ ...prev, ...updates }));
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      id: crypto.randomUUID(),
      title: '',
      description: '',
      questionType: QuestionType.SHORT_ANSWER,
      options: [],
      isRequired: false,
    };
    setSurvey(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
    }));
  };

  const updateQuestion = useCallback((id: string, updatedQuestion: Partial<Question>) => {
    setSurvey(prev => ({
      ...prev,
      questions: prev.questions.map(q => q.id === id ? { ...q, ...updatedQuestion } : q),
    }));
  }, []);

  const deleteQuestion = useCallback((id: string) => {
    setSurvey(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== id),
    }));
  }, []);

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const newSurvey = await generateSurveyFromPrompt(aiPrompt);
      setSurvey(newSurvey);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFormSubmit = (response: SurveyResponse) => {
    setResponses(prev => [...prev, response]);
    alert('Cảm ơn bạn đã gửi phản hồi! (Phản hồi này chỉ được lưu cục bộ)');
    setCurrentView('RESPONSES');
  };

  const renderEditorView = () => (
    <>
      <header className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between py-4 gap-4">
            <h1 className="text-2xl font-bold text-purple-700">AI Survey Builder</h1>
            
            <div className="flex items-center w-full md:w-auto md:max-w-md lg:max-w-lg flex-grow">
              <input 
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAiGenerate()}
                placeholder="Tạo khảo sát với AI ✨"
                className="w-full p-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                disabled={isLoading}
              />
              <button 
                onClick={handleAiGenerate}
                disabled={isLoading}
                className="px-4 py-2 bg-purple-600 text-white font-semibold rounded-r-md hover:bg-purple-700 disabled:bg-gray-400"
              >
                {isLoading ? 'Đang tạo...' : 'Tạo'}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center bg-gray-200 rounded-lg p-1">
                {['EDIT', 'PREVIEW', 'RESPONSES'].map(view => (
                  <button
                    key={view}
                    onClick={() => setCurrentView(view as View)}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      currentView === view
                      ? 'bg-white text-purple-700 shadow'
                      : 'text-gray-600 hover:bg-gray-300'
                    }`}
                  >
                    {view === 'EDIT' ? 'Câu hỏi' : view === 'PREVIEW' ? 'Xem trước' : `Câu trả lời (${responses.length})`}
                  </button>
                ))}
              </div>
              <button 
                onClick={() => setIsShareModalOpen(true)}
                className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                title="Chia sẻ khảo sát"
              >
                <ShareIcon />
              </button>
            </div>
          </div>
          {error && <div className="text-center text-red-500 pb-2">{error}</div>}
        </div>
      </header>
      <main>
        {
          {
            'EDIT': (
              <div className="max-w-4xl mx-auto py-8 px-4">
                <div className="bg-white p-6 rounded-lg border-t-8 border-purple-600 mb-6 shadow-md">
                  <input
                    type="text"
                    value={survey.title}
                    onChange={e => updateSurvey({ title: e.target.value })}
                    className="w-full text-4xl font-bold text-gray-800 p-2 border-b-2 border-transparent focus:border-purple-500 outline-none"
                  />
                  <input
                    type="text"
                    value={survey.description}
                    onChange={e => updateSurvey({ description: e.target.value })}
                    placeholder="Mô tả biểu mẫu"
                    className="w-full text-gray-600 mt-2 p-2 border-b-2 border-transparent focus:border-purple-500 outline-none"
                  />
                </div>
                {survey.questions.map(q => (
                  <QuestionEditor
                    key={q.id}
                    question={q}
                    updateQuestion={updateQuestion}
                    deleteQuestion={deleteQuestion}
                  />
                ))}
                <div className="flex justify-center mt-4">
                  <button onClick={addQuestion} className="p-3 bg-white text-gray-600 hover:bg-gray-100 rounded-full shadow-md border transition-all">
                    <PlusIcon />
                  </button>
                </div>
              </div>
            ),
            'PREVIEW': <FormViewer survey={survey} onSubmit={handleFormSubmit} />,
            'RESPONSES': <ResponsesViewer survey={survey} responses={responses} />
          }[currentView]
        }
      </main>
    </>
  );

  if (isFillMode) {
    return (
      <div className="min-h-screen bg-purple-50">
        <main>
          <FormViewer survey={survey} onSubmit={() => {}} webAppUrl={webAppUrl} isFillMode={true} />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-purple-50">
      {renderEditorView()}
      {isShareModalOpen && <ShareModal survey={survey} onClose={() => setIsShareModalOpen(false)} />}
    </div>
  );
}

export default App;
